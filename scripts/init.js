import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Network from "../models/Network.js";
import DataPlan from "../models/DataPlan.js";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dataapp";

async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin user exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("✓ Admin user already exists");
    } else {
      // Create sample admin
      const admin = await User.create({
        email: "admin@dataapp.com",
        phone: "+2348012345678",
        password:
          "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
        name: "Admin User",
        role: "admin",
        isVerified: true,
        status: "active",
      });

      await Wallet.create({
        userId: admin._id,
        balance: 0,
      });

      console.log(
        "✓ Sample admin created: admin@dataapp.com / password: admin",
      );
    }

    // Check networks
    const networkCount = await Network.countDocuments();
    console.log(`✓ Networks in database: ${networkCount}`);

    // Check data plans
    const planCount = await DataPlan.countDocuments();
    console.log(`✓ Data plans in database: ${planCount}`);

    console.log("\n✅ Database initialization complete!");
    console.log("\nQuick Start:");
    console.log("1. Run: npm run dev");
    console.log("2. Visit: http://localhost:3000");
    console.log("3. Register as user or login as admin@dataapp.com");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

initDatabase();
