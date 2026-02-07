import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFunded: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastFundedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "frozen", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    indexes: [{ userId: 1 }, { status: 1 }, { createdAt: -1 }],
  },
);

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
