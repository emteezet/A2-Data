import mongoose from "mongoose";
import dotenv from "dotenv";
import Network from "../models/Network.js";
import DataPlan from "../models/DataPlan.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const networks = [
  {
    name: "MTN",
    code: "mtn",
    commissionPercentage: 10,
    providerCode: "mtn-data",
    description: "MTN Nigeria",
    isActive: true,
  },
  {
    name: "Airtel",
    code: "airtel",
    commissionPercentage: 10,
    providerCode: "airtel-data",
    description: "Airtel Nigeria",
    isActive: true,
  },
  {
    name: "Glo",
    code: "glo",
    commissionPercentage: 10,
    providerCode: "glo-data",
    description: "Globacom Nigeria",
    isActive: true,
  },
  {
    name: "9mobile",
    code: "9mobile",
    commissionPercentage: 10,
    providerCode: "9mobile-data",
    description: "9mobile Nigeria",
    isActive: true,
  },
];

const dataPlanTemplates = {
  mtn: [
    { name: "MTN 1GB (SME)", dataSize: "1GB", price: 250, validity: "30 days", providerCode: "1000", type: "SME" },
    { name: "MTN 2GB (SME)", dataSize: "2GB", price: 500, validity: "30 days", providerCode: "2000", type: "SME" },
    { name: "MTN 3GB (SME)", dataSize: "3GB", price: 750, validity: "30 days", providerCode: "3000", type: "SME" },
    { name: "MTN 5GB (SME)", dataSize: "5GB", price: 1250, validity: "30 days", providerCode: "5000", type: "SME" },
    { name: "MTN 10GB (SME)", dataSize: "10GB", price: 2500, validity: "30 days", providerCode: "10000", type: "SME" },
    { name: "MTN 1GB (Coupon)", dataSize: "1GB", price: 300, validity: "30 days", providerCode: "C1000", type: "Coupon" },
    { name: "MTN 2GB (Coupon)", dataSize: "2GB", price: 600, validity: "30 days", providerCode: "C2000", type: "Coupon" },
  ],
  airtel: [
    { name: "Airtel 1GB (SME)", dataSize: "1GB", price: 260, validity: "30 days", providerCode: "A1000", type: "SME" },
    { name: "Airtel 2GB (SME)", dataSize: "2GB", price: 520, validity: "30 days", providerCode: "A2000", type: "SME" },
    { name: "Airtel 5GB (SME)", dataSize: "5GB", price: 1300, validity: "30 days", providerCode: "A5000", type: "SME" },
    { name: "Airtel 1GB (Coupon)", dataSize: "1GB", price: 350, validity: "30 days", providerCode: "AC1000", type: "Coupon" },
  ],
  glo: [
    { name: "Glo 1GB (SME)", dataSize: "1GB", price: 240, validity: "30 days", providerCode: "G1000", type: "SME" },
    { name: "Glo 2GB (SME)", dataSize: "2GB", price: 480, validity: "30 days", providerCode: "G2000", type: "SME" },
    { name: "Glo 1GB (Coupon)", dataSize: "1GB", price: 280, validity: "30 days", providerCode: "GC1000", type: "Coupon" },
  ],
  "9mobile": [
    { name: "9mobile 1GB (SME)", dataSize: "1GB", price: 250, validity: "30 days", providerCode: "E1000", type: "SME" },
    { name: "9mobile 1.5GB (SME)", dataSize: "1.5GB", price: 375, validity: "30 days", providerCode: "E1500", type: "SME" },
    { name: "9mobile 1GB (Coupon)", dataSize: "1GB", price: 300, validity: "30 days", providerCode: "EC1000", type: "Coupon" },
  ],
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // Clear existing data
    await Network.deleteMany({});
    await DataPlan.deleteMany({});

    // Insert networks
    const createdNetworks = await Network.insertMany(networks);
    console.log(`✓ Created ${createdNetworks.length} networks`);

    // Seed plans if needed (removed as requested)
    console.log("Skipping data plan seeding as requested.");

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`   - Networks: ${createdNetworks.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedDatabase();

