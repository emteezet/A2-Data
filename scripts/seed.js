import mongoose from "mongoose";
import Network from "../models/Network.js";
import DataPlan from "../models/DataPlan.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dataapp";

const networks = [
  {
    name: "MTN",
    code: "mtn",
    commissionPercentage: 10,
    providerCode: "mtn-ng",
    description: "MTN Nigeria",
    isActive: true,
  },
  {
    name: "Airtel",
    code: "airtel",
    commissionPercentage: 10,
    providerCode: "airtel-ng",
    description: "Airtel Nigeria",
    isActive: true,
  },
  {
    name: "Glo",
    code: "glo",
    commissionPercentage: 10,
    providerCode: "glo-ng",
    description: "Globacom Nigeria",
    isActive: true,
  },
  {
    name: "9mobile",
    code: "9mobile",
    commissionPercentage: 10,
    providerCode: "9mobile-ng",
    description: "9mobile Nigeria",
    isActive: true,
  },
];

const dataPlanTemplates = {
  mtn: [
    {
      name: "MTN 1GB",
      dataSize: "1GB",
      price: 500,
      validity: "30 days",
      providerCode: "MTN1GB",
    },
    {
      name: "MTN 2GB",
      dataSize: "2GB",
      price: 1000,
      validity: "30 days",
      providerCode: "MTN2GB",
    },
    {
      name: "MTN 5GB",
      dataSize: "5GB",
      price: 2000,
      validity: "30 days",
      providerCode: "MTN5GB",
    },
    {
      name: "MTN 10GB",
      dataSize: "10GB",
      price: 3500,
      validity: "30 days",
      providerCode: "MTN10GB",
    },
  ],
  airtel: [
    {
      name: "Airtel 1GB",
      dataSize: "1GB",
      price: 520,
      validity: "30 days",
      providerCode: "AIRTEL1GB",
    },
    {
      name: "Airtel 2GB",
      dataSize: "2GB",
      price: 1050,
      validity: "30 days",
      providerCode: "AIRTEL2GB",
    },
    {
      name: "Airtel 5GB",
      dataSize: "5GB",
      price: 2050,
      validity: "30 days",
      providerCode: "AIRTEL5GB",
    },
    {
      name: "Airtel 10GB",
      dataSize: "10GB",
      price: 3800,
      validity: "30 days",
      providerCode: "AIRTEL10GB",
    },
  ],
  glo: [
    {
      name: "Glo 1GB",
      dataSize: "1GB",
      price: 480,
      validity: "30 days",
      providerCode: "GLO1GB",
    },
    {
      name: "Glo 2GB",
      dataSize: "2GB",
      price: 950,
      validity: "30 days",
      providerCode: "GLO2GB",
    },
    {
      name: "Glo 5GB",
      dataSize: "5GB",
      price: 1950,
      validity: "30 days",
      providerCode: "GLO5GB",
    },
    {
      name: "Glo 10GB",
      dataSize: "10GB",
      price: 3400,
      validity: "30 days",
      providerCode: "GLO10GB",
    },
  ],
  "9mobile": [
    {
      name: "9mobile 1GB",
      dataSize: "1GB",
      price: 490,
      validity: "30 days",
      providerCode: "9M1GB",
    },
    {
      name: "9mobile 2GB",
      dataSize: "2GB",
      price: 970,
      validity: "30 days",
      providerCode: "9M2GB",
    },
    {
      name: "9mobile 5GB",
      dataSize: "5GB",
      price: 1970,
      validity: "30 days",
      providerCode: "9M5GB",
    },
    {
      name: "9mobile 10GB",
      dataSize: "10GB",
      price: 3600,
      validity: "30 days",
      providerCode: "9M10GB",
    },
  ],
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Network.deleteMany({});
    await DataPlan.deleteMany({});

    // Insert networks
    const createdNetworks = await Network.insertMany(networks);
    console.log(`✓ Created ${createdNetworks.length} networks`);

    // Insert data plans
    let totalPlans = 0;
    for (const network of createdNetworks) {
      const plans = dataPlanTemplates[network.code];
      const plansWithNetworkId = plans.map((plan) => ({
        ...plan,
        networkId: network._id,
      }));

      await DataPlan.insertMany(plansWithNetworkId);
      totalPlans += plansWithNetworkId.length;
      console.log(
        `✓ Created ${plansWithNetworkId.length} plans for ${network.name}`,
      );
    }

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`   - Networks: ${createdNetworks.length}`);
    console.log(`   - Data Plans: ${totalPlans}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
