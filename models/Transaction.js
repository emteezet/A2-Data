import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataPlan",
      required: false,
    },
    networkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["purchase", "funding"],
      default: "purchase",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    nominalAmount: {
      type: Number,
      default: null,
    },
    platformCommission: {
      type: Number,
      required: true,
      default: 0,
    },
    agentProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    providerReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    providerStatus: {
      type: String,
      enum: ["pending", "delivered", "failed", "retry"],
      default: "pending",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "paystack"],
      default: "wallet",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    indexes: [
      { reference: 1 },
      { userId: 1 },
      { status: 1 },
      { providerStatus: 1 },
      { paystackReference: 1 },
      { createdAt: -1 },
      { createdAt: -1, status: 1 },
    ],
  },
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
