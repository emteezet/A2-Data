import mongoose from "mongoose";

const networkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["MTN", "Airtel", "Glo", "9mobile"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    commissionPercentage: {
      type: Number,
      default: 10,
    },
    providerCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    indexes: [{ name: 1 }, { code: 1 }, { isActive: 1 }],
  },
);

export default mongoose.models.Network ||
  mongoose.model("Network", networkSchema);
