import mongoose from "mongoose";
import DataPlan from "@/models/DataPlan";
import Network from "@/models/Network";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import { generateReference, calculateCommission } from "@/lib/helpers";
import { TRANSACTION_STATUS, TRANSACTION_TYPE, PAYMENT_METHOD, DEFAULT_PLATFORM_COMMISSION } from "@/config/constants";
import { dataProvider } from "./dataProvider";
import dbConnect from "@/lib/mongodb";

export async function getNetworks() {
  try {
    const networks = await Network.find({ isActive: true }).maxTimeMS(10000);
    if (!networks || networks.length === 0) {
      return { success: true, data: [], message: "No active networks found" };
    }
    return { success: true, data: networks };
  } catch (error) {
    console.error("Error fetching networks:", error);
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
      return { error: "Network ID is required", statusCode: 400 };
    }

    // Look up the network to get its providerCode
    const network = await Network.findById(networkId);
    if (!network) {
      return { error: "Network not found", statusCode: 404 };
    }

    // Try fetching live plans from MobileNig API
    try {
      const liveResult = await dataProvider.getLiveDataPlans(network.providerCode);

      if (liveResult.success && liveResult.plans.length > 0) {
        // Transform MobileNig response to match our frontend format
        const networkName = network.name.toUpperCase();
        const transformedPlans = liveResult.plans.map((plan, index) => {
          const providerPrice = parseFloat(plan.price || plan.amount || 0);
          const providerProductCode = String(plan.productCode || plan.code || plan.product_code || plan.price || plan.amount);

          return {
            _id: `live_${networkId}_${index}_${providerProductCode}`,
            networkId: networkId,
            name: plan.name || `${networkName} ${plan.dataSize || plan.data_size || plan.amount || ""} (${plan.type || "SME"})`,
            dataSize: plan.dataSize || plan.data_size || plan.size || (plan.name ? plan.name.split(' ')[0] : "DATA"),
            price: providerPrice,
            nominalAmount: providerPrice, // For most networks, amount to send is the price. buyData logic handles overrides.
            validity: plan.validity || plan.duration || plan.valid || "30 days",
            providerCode: providerProductCode,
            isActive: true,
            type: plan.type || "SME",
            description: plan.description || "",
          };
        });

        console.log(`[DataService] Fetched ${transformedPlans.length} live plans for ${network.name}`);
        return { success: true, data: transformedPlans, source: "live" };
      }
    } catch (liveError) {
      console.warn(`[DataService] Live plan fetch failed for ${network.name}, falling back to DB:`, liveError.message);
    }

    // Fallback: use local DB-cached plans
    console.log(`[DataService] Using DB-cached plans for ${network.name}`);
    const plans = await DataPlan.find({
      networkId,
      isActive: true,
    })
      .sort({ price: 1 })
      .maxTimeMS(10000);

    if (!plans || plans.length === 0) {
      return {
        success: true,
        data: [],
        message: "No plans available for this network",
        source: "db",
      };
    }

    return { success: true, data: plans, source: "db" };
  } catch (error) {
    console.error("Error fetching network plans:", error);
    return {
      error: "Failed to fetch network plans",
      statusCode: 500,
      details: error.message,
    };
  }
}

export async function getDataPlanById(planId) {
  const plan = await DataPlan.findById(planId).populate("networkId");
  if (!plan) {
    return { error: "Plan not found", statusCode: 404 };
  }
  return { success: true, data: plan };
}

export async function purchaseData(
  userId,
  dataPlanId,
  phoneNumber,
  paymentMethod = PAYMENT_METHOD.WALLET,
  idempotencyKey = null,
) {
  await dbConnect();

  // Idempotency check
  if (idempotencyKey) {
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      console.log(`[DataService] Duplicate request detected for idempotencyKey: ${idempotencyKey}`);
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

  const dataPlan = await DataPlan.findById(dataPlanId).populate("networkId");

  if (!dataPlan) {
    return { error: "Data plan not found", statusCode: 404 };
  }

  const reference = generateReference("DATA");
  const amount = dataPlan.price;
  const commission = calculateCommission(
    amount,
    parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
  );
  const agentProfit = amount - commission;

  const transaction = await Transaction.create({
    reference,
    idempotencyKey,
    userId,
    dataPlanId,
    networkId: dataPlan.networkId._id,
    phoneNumber,
    amount,
    nominalAmount: dataPlan.nominalAmount || amount,
    platformCommission: commission,
    agentProfit,
    status: TRANSACTION_STATUS.PENDING,
    type: TRANSACTION_TYPE.DATA_PURCHASE,
    paymentMethod,
    metadata: {
      dataSizeGB: dataPlan.dataSize,
      validity: dataPlan.validity,
    },
  });

  // Deduct from wallet
  const Wallet = mongoose.models.Wallet || mongoose.model("Wallet");
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < amount) {
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.errorMessage = "Insufficient wallet balance";
    await transaction.save();
    return { error: "Insufficient wallet balance", statusCode: 400 };
  }

  wallet.balance -= amount;
  wallet.totalSpent += amount;
  await wallet.save();

  // Attempt to deliver data
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

    // Log commission
    await CommissionLog.create({
      transactionId: transaction._id,
      amount: commission,
      percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
    });
  } else {
    transaction.providerStatus = "failed";
    transaction.errorMessage = providerResult.error;
    transaction.status = TRANSACTION_STATUS.FAILED;

    // Refund wallet
    wallet.balance += amount;
    wallet.totalSpent -= amount;
    await wallet.save();

    transaction.errorMessage = (transaction.errorMessage || "") + " (Refunded)";
  }

  await transaction.save();

  return {
    success: providerResult.success,
    error: providerResult.success ? undefined : (providerResult.error || "Data purchase failed at provider. Your wallet has been refunded."),
    statusCode: providerResult.success ? undefined : 400,
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      status: transaction.status,
    },
  };
}

export async function purchaseAirtime(
  userId,
  networkId,
  amount,
  phoneNumber,
  paymentMethod = PAYMENT_METHOD.WALLET,
  idempotencyKey = null,
) {
  await dbConnect();

  // Idempotency check
  if (idempotencyKey) {
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if (existingTransaction) {
      console.log(`[DataService] Duplicate airtime request detected: ${idempotencyKey}`);
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
    return { error: "Network not found", statusCode: 404 };
  }

  const reference = generateReference("AIRTIME");
  const commission = calculateCommission(
    amount,
    parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
  );
  const agentProfit = amount - commission;

  const transaction = await Transaction.create({
    reference,
    idempotencyKey,
    userId,
    networkId: network._id,
    phoneNumber,
    amount,
    platformCommission: commission,
    agentProfit,
    status: TRANSACTION_STATUS.PENDING,
    type: TRANSACTION_TYPE.AIRTIME_PURCHASE,
    paymentMethod,
  });

  // Deduct from wallet
  const Wallet = mongoose.models.Wallet || mongoose.model("Wallet");
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < amount) {
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.errorMessage = "Insufficient wallet balance";
    await transaction.save();
    return { error: "Insufficient wallet balance", statusCode: 400 };
  }

  wallet.balance -= amount;
  wallet.totalSpent += amount;
  await wallet.save();

  // Attempt to deliver airtime
  const providerResult = await dataProvider.buyAirtime(
    network.providerCode,
    phoneNumber,
    amount,
    reference
  );

  if (providerResult.success) {
    transaction.providerReference = providerResult.providerReference;
    transaction.providerStatus = providerResult.status;
    transaction.status = TRANSACTION_STATUS.SUCCESS;

    // Log commission
    await CommissionLog.create({
      transactionId: transaction._id,
      amount: commission,
      percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
    });
  } else {
    transaction.providerStatus = "failed";
    transaction.errorMessage = providerResult.error;
    transaction.status = TRANSACTION_STATUS.FAILED;

    // Refund wallet
    wallet.balance += amount;
    wallet.totalSpent -= amount;
    await wallet.save();

    transaction.errorMessage = (transaction.errorMessage || "") + " (Refunded)";
  }

  await transaction.save();

  return {
    success: providerResult.success,
    error: providerResult.success ? undefined : (providerResult.error || "Airtime purchase failed at provider. Your wallet has been refunded."),
    statusCode: providerResult.success ? undefined : 400,
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      status: transaction.status,
    },
  };
}

export async function getTransactionDetails(transactionId) {
  const transaction = await Transaction.findById(transactionId)
    .populate("dataPlanId")
    .populate("networkId")
    .populate("userId", "-password");

  if (!transaction) {
    return { error: "Transaction not found", statusCode: 404 };
  }

  return { success: true, data: transaction };
}

export async function retryFailedTransaction(transactionId) {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    return { error: "Transaction not found", statusCode: 404 };
  }

  const result = await dataProvider.retry(transactionId);

  if (result.error) {
    return { error: result.error, statusCode: 400 };
  }

  return { success: true, data: result.transaction };
}

export async function handleVTPassWebhook(payload) {
  try {
    // Check if payload is nested under 'data' key (as per documentation)
    const data = payload.data || payload;
    const { reference, status, message } = data;

    if (!reference) {
      return { error: "Missing reference in webhook payload" };
    }

    // Find transaction by provider reference
    const transaction = await Transaction.findOne({
      providerReference: reference,
    });

    if (!transaction) {
      console.warn(`Transaction not found for reference: ${reference}`);
      return {
        success: true,
        message: "Webhook logged but transaction not found",
      };
    }

    // Update transaction status based on VT Pass response
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
      // Log commission on successful delivery
      await CommissionLog.create({
        transactionId: transaction._id,
        amount: transaction.platformCommission,
        percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || DEFAULT_PLATFORM_COMMISSION),
      });
    }

    await transaction.save();

    return {
      success: true,
      transaction,
      message: `Transaction ${reference} status updated to ${status}`,
    };
  } catch (error) {
    console.error("VT Pass webhook handling error:", error);
    return {
      error: error.message,
      success: false,
    };
  }
}
