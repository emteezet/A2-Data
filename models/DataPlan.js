import mongoose from "mongoose";

const dataPlanSchema = new mongoose.Schema(
  {
    networkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dataSize: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    validity: {
      type: String,
      required: true,
    },
    providerCode: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["SME", "Coupon"],
      default: "SME",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    indexes: [
      { networkId: 1 },
      { isActive: 1 },
      { price: 1 },
      { networkId: 1, isActive: 1 },
    ],
  },
);

export default mongoose.models.DataPlan ||
  mongoose.model("DataPlan", dataPlanSchema);
