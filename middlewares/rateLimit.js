import { errorResponse } from "@/lib/response";

const requestLimits = new Map();

export function rateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  return (handler) => async (req, res) => {
    const clientId = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!requestLimits.has(clientId)) {
      requestLimits.set(clientId, []);
    }

    const requests = requestLimits.get(clientId);
    const recentRequests = requests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res
        .status(429)
        .json(errorResponse("Too many requests. Please try again later.", 429));
    }

    recentRequests.push(now);
    requestLimits.set(clientId, recentRequests);

    return handler(req, res);
  };
}
