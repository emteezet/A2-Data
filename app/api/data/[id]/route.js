export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import { getNetworkPlans } from "@/services/dataService";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!id) {
            return Response.json(errorResponse("Network ID is required", 400), { status: 400 });
        }

        const result = await getNetworkPlans(id);

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
