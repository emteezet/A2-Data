import axios from "axios";
import { verifyPaystackSignature } from "@/lib/crypto";
import { generateReference } from "@/lib/helpers";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import { TRANSACTION_STATUS, PAYMENT_METHOD, TRANSACTION_TYPE } from "@/config/constants";
import { fundWallet } from "@/services/walletService";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function initializePayment(email, amount, metadata = {}, customReference = null, callbackUrl = null) {
  try {
    const reference = customReference || generateReference("PSK");

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        metadata,
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return {
      success: true,
      data: {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference,
      },
    };
  } catch (error) {
    return {
      error: error.response?.data?.message || error.message,
      statusCode: 400,
    };
  }
}

export async function verifyPayment(reference) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = response.data.data;

    return {
      success: true,
      data: {
        reference: data.reference,
        amount: data.amount / 100,
        status: data.status,
        message: data.gateway_response,
        customer: data.customer,
      },
    };
  } catch (error) {
    return {
      error: error.response?.data?.message || error.message,
      statusCode: 400,
    };
  }
}

export async function handlePaystackWebhook(payload, signature) {
  if (!verifyPaystackSignature(payload, signature)) {
    return { error: "Invalid signature", statusCode: 400 };
  }

  const { event, data } = payload;

  if (event === "charge.success") {
    const transaction = await Transaction.findOne({
      paystackReference: data.reference,
    });

    if (!transaction) {
      return { error: "Transaction not found", statusCode: 404 };
    }

    transaction.status = TRANSACTION_STATUS.SUCCESS;
    await transaction.save();

    if (transaction.type === TRANSACTION_TYPE.FUNDING) {
      // Credit user wallet
      await fundWallet(transaction.userId, transaction.amount, data.reference);
      return { success: true, transaction };
    }

    // For purchases, set provider status to pending for background processing
    transaction.providerStatus = "pending";
    await transaction.save();

    // Log commission (only for purchases)
    const commission =
      (transaction.amount *
        parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE)) /
      100;
    await CommissionLog.create({
      transactionId: transaction._id,
      amount: commission,
      percentage: parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE),
    });

    return { success: true, transaction };
  }

  return { success: true, message: "Webhook received" };
}
