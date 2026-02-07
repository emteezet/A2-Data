import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import { generateReference } from "@/lib/helpers";
import { TRANSACTION_STATUS, PAYMENT_METHOD } from "@/config/constants";

export async function getWalletBalance(userId) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    return { error: "Wallet not found", statusCode: 404 };
  }
  return { success: true, data: wallet };
}

export async function fundWallet(userId, amount, paystackReference = null) {
  if (amount <= 0) {
    return { error: "Amount must be greater than 0", statusCode: 400 };
  }

  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    return { error: "Wallet not found", statusCode: 404 };
  }

  wallet.balance += amount;
  wallet.totalFunded += amount;
  wallet.lastFundedAt = new Date();
  await wallet.save();

  return {
    success: true,
    data: {
      newBalance: wallet.balance,
      totalFunded: wallet.totalFunded,
    },
  };
}

export async function deductWalletBalance(userId, amount, reason = "purchase") {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    return { error: "Wallet not found", statusCode: 404 };
  }

  if (wallet.balance < amount) {
    return { error: "Insufficient wallet balance", statusCode: 400 };
  }

  wallet.balance -= amount;
  wallet.totalSpent += amount;
  await wallet.save();

  return {
    success: true,
    data: {
      newBalance: wallet.balance,
      totalSpent: wallet.totalSpent,
    },
  };
}

export async function refundWallet(userId, amount, reason = "refund") {
  return fundWallet(userId, amount);
}

export async function getWalletTransactions(userId, limit = 50, skip = 0) {
  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("dataPlanId", "name dataSize")
    .populate("networkId", "name");

  const total = await Transaction.countDocuments({ userId });

  return {
    success: true,
    data: {
      transactions,
      total,
      limit,
      skip,
    },
  };
}

export async function processWalletPayment(
  userId,
  amount,
  dataPlanId,
  networkId,
  phoneNumber,
) {
  const walletResult = await deductWalletBalance(userId, amount);

  if (walletResult.error) {
    return walletResult;
  }

  const reference = generateReference("WLT");

  const transaction = await Transaction.create({
    reference,
    userId,
    dataPlanId,
    networkId,
    phoneNumber,
    amount,
    platformCommission: 0,
    agentProfit: 0,
    status: TRANSACTION_STATUS.PENDING,
    paymentMethod: PAYMENT_METHOD.WALLET,
  });

  return {
    success: true,
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
    },
  };
}

export async function isTransactionIdempotent(idempotencyKey) {
  // In production, use Redis for this
  // For now, using a simple in-memory check
  return false;
}
