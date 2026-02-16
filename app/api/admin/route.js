export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import Transaction from "@/models/Transaction";
import CommissionLog from "@/models/CommissionLog";
import DataPlan from "@/models/DataPlan";
import Network from "@/models/Network";
import { successResponse, errorResponse } from "@/lib/response";
import { generateReference } from "@/lib/helpers";
import { TRANSACTION_STATUS } from "@/config/constants";

async function getAdminUser(request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return null;
  }

  try {
    const user = verifyToken(token);
    if (user.role !== "admin" && user.role !== "agent") {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  await dbConnect();

  const user = await getAdminUser(request);
  if (!user) {
    return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (section === "dashboard") {
      const totalTransactions = await Transaction.countDocuments();
      const successfulTransactions = await Transaction.countDocuments({
        status: TRANSACTION_STATUS.SUCCESS,
      });
      const totalCommission = await CommissionLog.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const recentTransactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "email name")
        .populate("dataPlanId", "name")
        .populate("networkId", "name");

      return Response.json(
        successResponse({
          totalTransactions,
          successfulTransactions,
          totalCommission: totalCommission[0]?.total || 0,
          recentTransactions,
        }),
        { status: 200 },
      );
    }

    if (section === "transactions") {
      const { limit = 50, skip = 0, status } = Object.fromEntries(searchParams);
      const query = status ? { status } : {};

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate("userId", "email name")
        .populate("dataPlanId")
        .populate("networkId");

      const total = await Transaction.countDocuments(query);

      return Response.json(successResponse({ transactions, total }), {
        status: 200,
      });
    }

    if (section === "commissions") {
      const { limit = 50, skip = 0 } = Object.fromEntries(searchParams);

      const commissions = await CommissionLog.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate("transactionId");

      const total = await CommissionLog.countDocuments();
      const totalAmount = await CommissionLog.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return Response.json(
        successResponse({
          commissions,
          total,
          totalAmount: totalAmount[0]?.total || 0,
        }),
        { status: 200 },
      );
    }

    return Response.json(errorResponse("Invalid section", 400), {
      status: 400,
    });
  } catch (error) {
    console.error("Admin error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}

export async function POST(request) {
  await dbConnect();

  const user = await getAdminUser(request);
  if (!user) {
    return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
  }

  const { action, ...data } = await request.json();

  try {
    if (action === "create-data-plan") {
      const { networkId, name, dataSize, price, validity, providerCode } = data;

      if (
        !networkId ||
        !name ||
        !dataSize ||
        !price ||
        !validity ||
        !providerCode
      ) {
        return Response.json(errorResponse("Missing required fields", 400), {
          status: 400,
        });
      }

      const plan = await DataPlan.create({
        networkId,
        name,
        dataSize,
        price,
        validity,
        providerCode,
      });

      return Response.json(successResponse(plan, "Data plan created"), {
        status: 201,
      });
    }

    if (action === "update-data-plan") {
      const { planId, ...updateData } = data;

      if (!planId) {
        return Response.json(errorResponse("Plan ID required", 400), {
          status: 400,
        });
      }

      const plan = await DataPlan.findByIdAndUpdate(planId, updateData, {
        new: true,
      });

      if (!plan) {
        return Response.json(errorResponse("Plan not found", 404), {
          status: 404,
        });
      }

      return Response.json(successResponse(plan, "Plan updated"), {
        status: 200,
      });
    }

    if (action === "create-network") {
      const { name, code, commissionPercentage, providerCode } = data;

      if (!name || !code || !commissionPercentage || !providerCode) {
        return Response.json(errorResponse("Missing required fields", 400), {
          status: 400,
        });
      }

      const network = await Network.create({
        name,
        code,
        commissionPercentage,
        providerCode,
      });

      return Response.json(successResponse(network, "Network created"), {
        status: 201,
      });
    }

    if (action === "manual-refund") {
      const { transactionId, reason } = data;

      if (!transactionId) {
        return Response.json(errorResponse("Transaction ID required", 400), {
          status: 400,
        });
      }

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return Response.json(errorResponse("Transaction not found", 404), {
          status: 404,
        });
      }

      transaction.status = TRANSACTION_STATUS.REFUNDED;
      transaction.errorMessage = reason || "Manual refund by admin";
      await transaction.save();

      const commission = await CommissionLog.findOne({ transactionId });
      if (commission) {
        commission.status = "reversed";
        await commission.save();
      }

      return Response.json(successResponse(transaction, "Refund processed"), {
        status: 200,
      });
    }

    return Response.json(errorResponse("Invalid action", 400), { status: 400 });
  } catch (error) {
    console.error("Admin error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}
