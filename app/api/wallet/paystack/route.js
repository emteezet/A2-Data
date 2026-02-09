import dbConnect from "@/lib/mongodb";
import { initializePayment, verifyPayment } from "@/services/paystackService";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyToken } from "@/lib/jwt";
import { TRANSACTION_STATUS, PAYMENT_METHOD, TRANSACTION_TYPE } from "@/config/constants";
import Transaction from "@/models/Transaction";
import { generateReference } from "@/lib/helpers";

async function getAuthUser(request) {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return null;
    try {
        return verifyToken(token);
    } catch (error) {
        return null;
    }
}

export async function POST(request) {
    await dbConnect();

    const user = await getAuthUser(request);
    if (!user) {
        return Response.json(errorResponse("Unauthorized", 401), { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, email, amount, metadata = {} } = body;

        if (action === "initialize") {
            if (!email || !amount || amount <= 0) {
                return Response.json(errorResponse("Invalid email or amount", 400), {
                    status: 400,
                });
            }

            const reference = generateReference("PSK");

            // Create pending transaction in DB
            await Transaction.create({
                reference,
                userId: user.userId,
                amount: amount,
                status: TRANSACTION_STATUS.PENDING,
                paymentMethod: PAYMENT_METHOD.PAYSTACK,
                type: TRANSACTION_TYPE.FUNDING,
                paystackReference: reference,
                metadata: { ...metadata, email }
            });

            const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
            const callback_url = `${origin}/api/wallet/paystack`;

            const result = await initializePayment(email, amount, metadata, reference, callback_url);

            if (result.error) {
                return Response.json(errorResponse(result.error, result.statusCode), {
                    status: result.statusCode,
                });
            }

            return Response.json(successResponse(result.data), { status: 200 });
        }

        if (action === "verify") {
            const { reference } = body;
            if (!reference) {
                return Response.json(errorResponse("Reference is required", 400), {
                    status: 400,
                });
            }

            const result = await verifyPayment(reference);

            if (result.error) {
                return Response.json(errorResponse(result.error, result.statusCode), {
                    status: result.statusCode,
                });
            }

            return Response.json(successResponse(result.data), { status: 200 });
        }

        return Response.json(errorResponse("Invalid action", 400), { status: 400 });
    } catch (error) {
        console.error("Payment error:", error);
        return Response.json(errorResponse("Internal server error", 500), {
            status: 500,
        });
    }
}

export async function GET(request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
        return Response.redirect(new URL("/dashboard/fund-wallet?status=error&message=No reference found", request.url));
    }

    try {
        const result = await verifyPayment(reference);

        if (result.success && result.data.status === "success") {
            return Response.redirect(new URL("/dashboard/fund-wallet?status=success&reference=" + reference, request.url));
        } else {
            return Response.redirect(new URL("/dashboard/fund-wallet?status=failed&reference=" + reference, request.url));
        }
    } catch (error) {
        console.error("Paystack redirect error:", error);
        return Response.redirect(new URL("/dashboard/fund-wallet?status=error", request.url));
    }
}
