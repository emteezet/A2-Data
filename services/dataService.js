import mongoose from "mongoose";
import DataPlan from "@/models/DataPlan";
import Network from "@/models/Network";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import { generateReference, calculateCommission } from "@/lib/helpers";
import { TRANSACTION_STATUS, PAYMENT_METHOD } from "@/config/constants";
import { dataProvider } from "./dataProvider";

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
      };
    }

    return { success: true, data: plans };
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
) {
  const dataPlan = await DataPlan.findById(dataPlanId).populate("networkId");

  if (!dataPlan) {
    return { error: "Data plan not found", statusCode: 404 };
  }

  const reference = generateReference("DATA");
  const amount = dataPlan.price;
  const commission = calculateCommission(
    amount,
    parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE),
  );
  const agentProfit = amount - commission;

  const transaction = await Transaction.create({
    reference,
    userId,
    dataPlanId,
    networkId: dataPlan.networkId._id,
    phoneNumber,
    amount,
    platformCommission: commission,
    agentProfit,
    status: TRANSACTION_STATUS.PENDING,
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
  );

  if (providerResult.success) {
    transaction.providerReference = providerResult.providerReference;
    transaction.providerStatus = providerResult.status;
    transaction.status = TRANSACTION_STATUS.SUCCESS;

    // Log commission
    await CommissionLog.create({
      transactionId: transaction._id,
      amount: commission,
      percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || "5"),
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
) {
  const network = await Network.findById(networkId);
  if (!network) {
    return { error: "Network not found", statusCode: 404 };
  }

  const reference = generateReference("AIRTIME");
  const commission = calculateCommission(
    amount,
    parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || "5"),
  );
  const agentProfit = amount - commission;

  const transaction = await Transaction.create({
    reference,
    userId,
    networkId: network._id,
    phoneNumber,
    amount,
    platformCommission: commission,
    agentProfit,
    status: TRANSACTION_STATUS.PENDING,
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
      percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE || "5"),
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
        percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE),
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
