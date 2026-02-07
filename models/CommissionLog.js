import mongoose from "mongoose";

const commissionLogSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "reversed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    indexes: [{ transactionId: 1 }, { status: 1 }, { createdAt: -1 }],
  },
);

export default mongoose.models.CommissionLog ||
  mongoose.model("CommissionLog", commissionLogSchema);
