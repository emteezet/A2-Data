import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import {
  getWalletBalance,
  fundWallet,
  getWalletTransactions,
} from "@/services/walletService";
import { successResponse, errorResponse } from "@/lib/response";

async function getAuthUser(request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  await dbConnect();

  const user = await getAuthUser(request);
  if (!user) {
    return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
  }

  try {
    const result = await getWalletBalance(user.userId);

    if (result.error) {
      return Response.json(errorResponse(result.error, result.statusCode), {
        status: result.statusCode,
      });
    }

    return Response.json(successResponse(result.data), { status: 200 });
  } catch (error) {
    console.error("Wallet error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}

export async function POST(request) {
  await dbConnect();

  const user = await getAuthUser(request);
  if (!user) {
    return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
  }

  const { action, amount } = await request.json();

  try {
    if (action === "fund") {
      if (!amount || amount <= 0) {
        return Response.json(errorResponse("Invalid amount", 400), {
          status: 400,
        });
      }

      const result = await fundWallet(user.userId, amount);

      if (result.error) {
        return Response.json(errorResponse(result.error, result.statusCode), {
          status: result.statusCode,
        });
      }

      return Response.json(successResponse(result.data, "Wallet funded"), {
        status: 200,
      });
    }

    if (action === "history") {
      const { limit = 50, skip = 0 } = await request.json();
      const result = await getWalletTransactions(user.userId, limit, skip);

      if (result.error) {
        return Response.json(errorResponse(result.error, result.statusCode), {
          status: result.statusCode,
        });
      }

      return Response.json(successResponse(result.data), { status: 200 });
    }

    return Response.json(errorResponse("Invalid action", 400), { status: 400 });
  } catch (error) {
    console.error("Wallet error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}
