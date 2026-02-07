import { verifyToken } from "@/lib/jwt";
import { errorResponse } from "@/lib/response";

export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json(errorResponse("Unauthorized: No token provided", 401));
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      return res
        .status(401)
        .json(errorResponse("Unauthorized: Invalid token", 401));
    }
  };
}

export function authMiddlewareOptional(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }

      return handler(req, res);
    } catch (error) {
      // Continue without auth
      return handler(req, res);
    }
  };
}
