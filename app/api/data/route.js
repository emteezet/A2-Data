import dbConnect from "@/lib/mongodb";
import {
  getNetworks,
  getNetworkPlans,
  purchaseData,
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
  await dbConnect();

  const user = await getAuthUser(request);
  if (!user) {
    return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
  }

  const { action, dataPlanId, phoneNumber } = await request.json();

  try {
    if (action === "purchase") {
      if (!dataPlanId || !phoneNumber) {
        return Response.json(errorResponse("Missing required fields", 400), {
          status: 400,
        });
      }

      const result = await purchaseData(user.userId, dataPlanId, phoneNumber);

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

    if (action === "transaction-details") {
      const { transactionId } = await request.json();
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
