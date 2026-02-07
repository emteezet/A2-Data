import dbConnect from "@/lib/mongodb";
import { handleVTPassWebhook } from "@/services/dataService";
import WebhookLog from "@/models/WebhookLog";
import { successResponse, errorResponse } from "@/lib/response";
import crypto from "crypto";

export async function POST(request) {
  await dbConnect();

  try {
    const payload = await request.json();
    const signature = request.headers.get("x-vtpass-signature");

    // Log webhook
    const webhookLog = await WebhookLog.create({
      event: payload.event || payload.status,
      source: "vtpass",
      reference: payload.reference,
      payload,
      signature,
    });

    // Verify signature (optional but recommended)
    if (signature && !verifyVTPassSignature(payload, signature)) {
      webhookLog.status = "failed";
      webhookLog.errorMessage = "Invalid signature";
      webhookLog.isValid = false;
      await webhookLog.save();

      return Response.json(errorResponse("Invalid signature", 401), {
        status: 401,
      });
    }

    // Process webhook
    const result = await handleVTPassWebhook(payload);

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

    return Response.json(
      { status: "ok", message: "Webhook processed" },
      { status: 200 },
    );
  } catch (error) {
    console.error("VT Pass webhook error:", error);
    return Response.json(errorResponse("Webhook processing failed", 500), {
      status: 500,
    });
  }
}

function verifyVTPassSignature(payload, signature) {
  // VT Pass signature verification
  // Combine the payload and secret
  const secret = process.env.VTPASS_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return hash === signature;
}
