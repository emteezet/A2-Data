import dbConnect from "@/lib/mongodb";
import {
  getNetworks,
  getNetworkPlans,
  purchaseData,
  purchaseAirtime,
  getTransactionDetails,
} from "@/services/dataService";
import { verifyToken } from "@/lib/jwt";
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
  try {
    await dbConnect();
    // Get all networks
    const result = await getNetworks();

    if (result.error) {
      return Response.json(errorResponse(result.error, result.statusCode), {
        status: result.statusCode,
      });
    }

    return Response.json(successResponse(result.data), { status: 200 });
  } catch (error) {
    console.error("Data error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
    }

    const body = await request.json();
    const { action, dataPlanId, phoneNumber, idempotencyKey } = body;

    if (action === "purchase") {
      if (!dataPlanId || !phoneNumber) {
        return Response.json(errorResponse("Missing required fields", 400), {
          status: 400,
        });
      }

      const result = await purchaseData(user.userId, dataPlanId, phoneNumber, body.paymentMethod, idempotencyKey);

      if (result.error) {
        return Response.json(
          errorResponse(result.error, result.statusCode || 400),
          {
            status: result.statusCode || 400,
          },
        );
      }

      return Response.json(
        successResponse(
          result.data,
          result.success ? "Purchase successful" : "Purchase initiated",
        ),
        { status: result.success ? 200 : 202 },
      );
    }

    if (action === "airtime") {
      const { network, amount, phoneNumber } = body;
      if (!network || !amount || !phoneNumber) {
        return Response.json(errorResponse("Missing required fields", 400), {
          status: 400,
        });
      }

      const result = await purchaseAirtime(user.userId, network, amount, phoneNumber, body.paymentMethod, idempotencyKey);

      if (result.error) {
        return Response.json(
          errorResponse(result.error, result.statusCode || 400),
          {
            status: result.statusCode || 400,
          },
        );
      }

      return Response.json(
        successResponse(
          result.data,
          result.success ? "Airtime purchase successful" : "Airtime purchase initiated",
        ),
        { status: result.success ? 200 : 202 },
      );
    }

    if (action === "transaction-details") {
      const { transactionId } = body;
      if (!transactionId) {
        return Response.json(errorResponse("Transaction ID required", 400), {
          status: 400,
        });
      }

      const result = await getTransactionDetails(transactionId);

      if (result.error) {
        return Response.json(errorResponse(result.error, result.statusCode), {
          status: result.statusCode,
        });
      }

      return Response.json(successResponse(result.data), { status: 200 });
    }

    return Response.json(errorResponse("Invalid action", 400), { status: 400 });
  } catch (error) {
    console.error("Data error:", error);
    return Response.json(errorResponse("Internal server error", 500), {
      status: 500,
    });
  }
}
