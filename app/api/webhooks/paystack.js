import dbConnect from "@/lib/mongodb";
import { handlePaystackWebhook } from "@/services/paystackService";
import WebhookLog from "@/models/WebhookLog";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request) {
  await dbConnect();

  try {
    const signature = request.headers.get("x-paystack-signature");
    const payload = await request.json();

    // Log webhook
    const webhookLog = await WebhookLog.create({
      event: payload.event,
      source: "paystack",
      reference: payload.data?.reference,
      payload,
      signature,
    });

    // Verify and process
    const result = await handlePaystackWebhook(payload, signature);

    if (result.error) {
      webhookLog.status = "failed";
      webhookLog.errorMessage = result.error;
      webhookLog.isValid = false;
    } else {
      webhookLog.status = "processed";
      webhookLog.isValid = true;
      if (result.transaction) {
        webhookLog.transactionId = result.transaction._id;
      }
    }

    await webhookLog.save();

    return Response.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json(errorResponse("Webhook processing failed", 500), {
      status: 500,
    });
  }
}
