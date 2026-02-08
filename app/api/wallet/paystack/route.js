import dbConnect from "@/lib/mongodb";
import { initializePayment, verifyPayment } from "@/services/paystackService";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request) {
    await dbConnect();

    const body = await request.json();
    const { action, email, amount, metadata, reference } = body;

    try {
        if (action === "initialize") {
            if (!email || !amount || amount <= 0) {
                return Response.json(errorResponse("Invalid email or amount", 400), {
                    status: 400,
                });
            }

            const result = await initializePayment(email, amount, metadata);

            if (result.error) {
                return Response.json(errorResponse(result.error, result.statusCode), {
                    status: result.statusCode,
                });
            }

            return Response.json(successResponse(result.data), { status: 200 });
        }

        if (action === "verify") {
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
