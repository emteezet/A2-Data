import mongoose from "mongoose";
import DataPlan from "@/models/DataPlan";
import Network from "@/models/Network";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import { generateReference, calculateCommission } from "@/lib/helpers";
import { TRANSACTION_STATUS, TRANSACTION_TYPE, PAYMENT_METHOD, DEFAULT_PLATFORM_COMMISSION } from "@/config/constants";
import { dataProvider } from "./dataProvider";
import { vtpassService } from "./vtpassService";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/lib/logger.js";
import { ValidationError, BusinessError, ProviderError } from "@/lib/AppError.js";

export async function getNetworks() {
  try {
    const networks = await Network.find({ isActive: true }).maxTimeMS(10000);
    if (!networks || networks.length === 0) {
      logger.warn("No active networks found in database.");
      return { success: true, data: [], message: "No active networks found" };
    }
    return { success: true, data: networks };
  } catch (error) {
    logger.error("Failed to fetch networks", error);
    return {
      error: "Failed to fetch networks",
      statusCode: 500,
      details: error.message,
    };
  }
}

export async function getNetworkPlans(networkId) {
  try {
    if (!networkId) {
      throw new ValidationError("Network ID is required");
    }

    const network = await Network.findById(networkId);
    if (!network) {
      logger.warn(`Network not found for ID: ${networkId}`);
      return { error: "Network not found", statusCode: 404 };
    }

    try {
      logger.debug(`Fetching live plans for ${network.name} from provider...`);
      const liveResult = await dataProvider.getLiveDataPlans(network.providerCode);

      if (liveResult.success && liveResult.plans.length > 0) {
        const networkName = network.name.toUpperCase();
        const ops = liveResult.plans.map((plan) => {
          const providerPrice = parseFloat(plan.price || plan.amount || 0);
          const providerProductCode = String(plan.productCode || plan.code || plan.product_code || plan.price || plan.amount);

          return {
            updateOne: {
              filter: { networkId: network._id, providerCode: providerProductCode },
              update: {
                $set: {
                  name: plan.name || `${networkName} ${plan.dataSize || plan.data_size || plan.amount || ""} (${plan.type || "SME"})`,
                  dataSize: plan.dataSize || plan.data_size || plan.size || (plan.name ? plan.name.split(' ')[0] : "DATA"),
                  price: providerPrice,
                  nominalAmount: providerPrice,
                  validity: plan.validity || plan.duration || plan.valid || "30 days",
                  isActive: true,
                  type: plan.type || "SME",
                  description: plan.description || "",
                }
              },
              upsert: true
            }
          };
        });

        await DataPlan.bulkWrite(ops);
        const updatedPlans = await DataPlan.find({ networkId: network._id, isActive: true }).sort({ price: 1 });
        logger.success(`Fetched and cached ${updatedPlans.length} live plans for ${network.name}`);
        return { success: true, data: updatedPlans, source: "live" };
      }
    } catch (liveError) {
      logger.warn(`Live plan fetch failed for ${network.name}, falling back to DB`, { error: liveError.message });
    }

    const plans = await DataPlan.find({ networkId, isActive: true }).sort({ price: 1 }).maxTimeMS(10000);
    if (!plans || plans.length === 0) {
      return { success: true, data: [], message: "No plans available for this network", source: "db" };
    }

    return { success: true, data: plans, source: "db" };
  } catch (error) {
    logger.error("Error in getNetworkPlans", error, { networkId });
    return {
      error: error.message || "Failed to fetch network plans",
      statusCode: error.statusCode || 500,
      category: error.category
    };
  }
}

export async function getDataPlanById(planId) {
  try {
    const plan = await DataPlan.findById(planId).populate("networkId");
    if (!plan) {
      return { error: "Plan not found", statusCode: 404 };
    }
    return { success: true, data: plan };
  } catch (error) {
    logger.error(`Error fetching plan by ID: ${planId}`, error);
    return { error: "Failed to fetch plan", statusCode: 500 };
  }
}

export async function purchaseData(userId, dataPlanId, phoneNumber, paymentMethod = PAYMENT_METHOD.WALLET, idempotencyKey = null) {
  await dbConnect();

  try {
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({ idempotencyKey });
      if (existingTransaction) {
        logger.info(`Duplicate data purchase request detected [${idempotencyKey}]`);
        return {
          success: existingTransaction.status === TRANSACTION_STATUS.SUCCESS,
          data: {
            transactionId: existingTransaction._id,
            reference: existingTransaction.reference,
            status: existingTransaction.status,
            isDuplicate: true,
          },
        };
      }
    }

    let dataPlan;
    if (mongoose.Types.ObjectId.isValid(dataPlanId)) {
      dataPlan = await DataPlan.findById(dataPlanId).populate("networkId");
    } else if (String(dataPlanId).startsWith("live_")) {
      logger.debug(`Handling legacy live ID: ${dataPlanId}`);
      const parts = dataPlanId.split('_');
      if (parts.length >= 4) {
        dataPlan = await DataPlan.findOne({ networkId: parts[1], providerCode: parts.slice(3).join('_') }).populate("networkId");
      }
    }

    if (!dataPlan) {
      throw new ValidationError("Data plan not found or invalid");
    }

    const reference = generateReference("DATA");
    const amount = dataPlan.price;
    const commission = calculateCommission(amount, parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION));

    logger.info(`Processing Data Purchase for User ${userId}`, { plan: dataPlan.name, phone: phoneNumber, reference });

    const transaction = await Transaction.create({
      reference,
      idempotencyKey,
      userId,
      dataPlanId: dataPlan._id,
      networkId: dataPlan.networkId._id,
      phoneNumber,
      amount,
      nominalAmount: dataPlan.nominalAmount || amount,
      platformCommission: commission,
      agentProfit: amount - commission,
      status: TRANSACTION_STATUS.PENDING,
      type: TRANSACTION_TYPE.DATA_PURCHASE,
      paymentMethod,
    });

    const Wallet = mongoose.models.Wallet || mongoose.model("Wallet");
    const wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      transaction.status = TRANSACTION_STATUS.FAILED;
      transaction.errorMessage = "Insufficient wallet balance";
      await transaction.save();
      logger.warn(`Insufficient balance for User ${userId}`, { balance: wallet?.balance, cost: amount });
      throw new BusinessError("Insufficient wallet balance");
    }

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    logger.debug(`Wallet deducted. Attempting provider delivery for [${reference}]...`);

    const providerResult = await dataProvider.buyData(
      dataPlan.providerCode,
      phoneNumber,
      reference,
      dataPlan.networkId.providerCode,
      dataPlan.nominalAmount || dataPlan.price,
      dataPlan.type,
    );

    if (providerResult.success) {
      transaction.providerReference = providerResult.providerReference;
      transaction.providerStatus = providerResult.status;
      transaction.status = TRANSACTION_STATUS.SUCCESS;
      await transaction.save();

      await CommissionLog.create({
        transactionId: transaction._id,
        amount: commission,
        percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
      });

      logger.success(`Data Purchase SUCCESSFUL [${reference}] Provider Ref: ${providerResult.providerReference}`);
    } else {
      logger.error(`Provider Delivery FAILED for [${reference}]`, null, { error: providerResult.error });

      transaction.providerStatus = "failed";
      transaction.errorMessage = providerResult.error;
      transaction.status = TRANSACTION_STATUS.FAILED;

      // Refund wallet
      wallet.balance += amount;
      wallet.totalSpent -= amount;
      await wallet.save();

      transaction.errorMessage += " (Refunded)";
      await transaction.save();
    }

    return {
      success: providerResult.success,
      error: providerResult.success ? undefined : (providerResult.error || "Data purchase failed at provider. Your wallet has been refunded."),
      data: {
        transactionId: transaction._id,
        reference: transaction.reference,
        status: transaction.status,
      },
    };
  } catch (error) {
    logger.error("Critical error in purchaseData", error, { userId, phoneNumber });
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      category: error.category || "INTERNAL_ERROR",
      statusCode: error.statusCode || 500
    };
  }
}

export async function purchaseAirtime(userId, networkId, amount, phoneNumber, paymentMethod = PAYMENT_METHOD.WALLET, idempotencyKey = null) {
  await dbConnect();

  try {
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({ idempotencyKey });
      if (existingTransaction) {
        logger.info(`Duplicate airtime request detected: ${idempotencyKey}`);
        return {
          success: existingTransaction.status === TRANSACTION_STATUS.SUCCESS,
          data: {
            transactionId: existingTransaction._id,
            reference: existingTransaction.reference,
            status: existingTransaction.status,
            isDuplicate: true,
          },
        };
      }
    }

    const network = await Network.findById(networkId);
    if (!network) {
      throw new ValidationError("Network not found");
    }

    const reference = generateReference("AIRTIME");
    const commission = calculateCommission(amount, parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION));

    logger.info(`Processing Airtime Purchase for User ${userId}`, { network: network.name, phone: phoneNumber, amount, reference });

    const transaction = await Transaction.create({
      reference,
      idempotencyKey,
      userId,
      networkId: network._id,
      phoneNumber,
      amount,
      platformCommission: commission,
      agentProfit: amount - commission,
      status: TRANSACTION_STATUS.PENDING,
      type: TRANSACTION_TYPE.AIRTIME_PURCHASE,
      paymentMethod,
    });

    const Wallet = mongoose.models.Wallet || mongoose.model("Wallet");
    const wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      transaction.status = TRANSACTION_STATUS.FAILED;
      transaction.errorMessage = "Insufficient wallet balance";
      await transaction.save();
      logger.warn(`Insufficient balance for User ${userId}`, { balance: wallet?.balance, cost: amount });
      throw new BusinessError("Insufficient wallet balance");
    }

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    logger.debug(`Wallet deducted. Attempting provider delivery for [${reference}] via VTPass...`);

    const providerResult = await vtpassService.purchaseAirtime(network.providerCode, amount, phoneNumber);

    if (providerResult.success || providerResult.status === "processing") {
      transaction.providerReference = providerResult.providerReference;
      transaction.providerStatus = providerResult.status;
      transaction.status = TRANSACTION_STATUS.SUCCESS;
      await transaction.save();

      await CommissionLog.create({
        transactionId: transaction._id,
        amount: commission,
        percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
      });

      logger.success(`Airtime Purchase SUCCESSFUL [${reference}] Provider Ref: ${providerResult.providerReference}`);
    } else {
      logger.error(`Provider Delivery FAILED for [${reference}]`, null, { error: providerResult.error });

      transaction.providerStatus = "failed";
      transaction.errorMessage = providerResult.error;
      transaction.status = TRANSACTION_STATUS.FAILED;

      // Refund wallet
      wallet.balance += amount;
      wallet.totalSpent -= amount;
      await wallet.save();

      transaction.errorMessage += " (Refunded)";
      await transaction.save();
    }

    return {
      success: providerResult.success,
      error: providerResult.success ? undefined : (providerResult.error || "Airtime purchase failed. Your wallet has been refunded."),
      data: {
        transactionId: transaction._id,
        reference: transaction.reference,
        status: transaction.status,
      },
    };
  } catch (error) {
    logger.error("Critical error in purchaseAirtime", error, { userId, phoneNumber });
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      category: error.category || "INTERNAL_ERROR",
      statusCode: error.statusCode || 500
    };
  }
}

export async function getTransactionDetails(transactionId) {
  try {
    const transaction = await Transaction.findById(transactionId).populate("dataPlanId").populate("networkId").populate("userId", "-password");
    if (!transaction) return { error: "Transaction not found", statusCode: 404 };
    return { success: true, data: transaction };
  } catch (error) {
    logger.error(`Error getting transaction details: ${transactionId}`, error);
    return { error: "Failed to fetch transaction", statusCode: 500 };
  }
}

export async function retryFailedTransaction(transactionId) {
  logger.info(`Manual retry initiated for Transaction ${transactionId}`);
  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new ValidationError("Transaction not found");

    const result = await dataProvider.retry(transactionId);
    if (result.error) {
      logger.warn(`Manual retry failed for ${transactionId}`, { error: result.error });
      return { error: result.error, statusCode: 400 };
    }

    logger.success(`Manual retry processed for ${transactionId}`);
    return { success: true, data: result.transaction };
  } catch (error) {
    logger.error(`Critical error during manual retry: ${transactionId}`, error);
    return { error: error.message, statusCode: error.statusCode || 500 };
  }
}

export async function handleVTPassWebhook(payload) {
  try {
    const data = payload.data || payload;
    const { reference, status, message } = data;

    if (!reference) throw new ValidationError("Missing reference in webhook payload");

    logger.info(`Received VT Pass Webhook for [${reference}]`, { status, message });

    const transaction = await Transaction.findOne({ providerReference: reference });
    if (!transaction) {
      logger.warn(`Webhook logged but transaction not found for reference: ${reference}`);
      return { success: true, message: "Webhook logged but transaction not found" };
    }

    const statusMapping = {
      delivered: TRANSACTION_STATUS.SUCCESS,
      pending: TRANSACTION_STATUS.PENDING,
      failed: TRANSACTION_STATUS.FAILED,
      processing: TRANSACTION_STATUS.PENDING,
    };

    transaction.providerStatus = status;
    transaction.status = statusMapping[status] || TRANSACTION_STATUS.PENDING;
    transaction.errorMessage = message || null;

    if (status === "delivered") {
      await CommissionLog.create({
        transactionId: transaction._id,
        amount: transaction.platformCommission,
        percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
      });
      logger.success(`Transaction [${reference}] marked SUCCESS via Webhook`);
    } else {
      logger.info(`Transaction [${reference}] moved to ${transaction.status} via Webhook`);
    }

    await transaction.save();
    return { success: true, message: `Transaction ${reference} status updated to ${status}` };
  } catch (error) {
    logger.error("VT Pass webhook handling error", error);
    return { error: error.message, success: false };
  }
}
