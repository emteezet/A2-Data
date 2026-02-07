import { errorResponse } from "@/lib/response";

export function roleMiddleware(allowedRoles) {
  return (handler) => async (req, res) => {
    if (!req.user) {
      return res.status(401).json(errorResponse("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(errorResponse("Forbidden: Insufficient permissions", 403));
    }

    return handler(req, res);
  };
}
