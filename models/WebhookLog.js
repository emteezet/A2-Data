import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["paystack", "vtpass", "mobilenig", "provider"],
      required: true,
    },
    reference: {
      type: String,
      default: null,
    },
    payload: {
      type: Object,
      required: true,
    },
    signature: {
      type: String,
      default: null,
    },
    isValid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["received", "processed", "failed"],
      default: "received",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  {
    timestamps: true,
    indexes: [
      { reference: 1 },
      { source: 1 },
      { status: 1 },
      { transactionId: 1 },
      { createdAt: -1 },
    ],
  },
);

export default mongoose.models.WebhookLog ||
  mongoose.model("WebhookLog", webhookLogSchema);
