import dbConnect from "@/lib/mongodb";
import { registerUser, loginUser } from "@/services/authService";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(request) {
  try {
    console.log("Auth request received:", new Date().toISOString());

    await dbConnect();
    console.log("Database connected successfully");

    const { action, email, password, phone, name } = await request.json();

    try {
      if (action === "register") {
        if (!email || !password || !phone || !name) {
          return Response.json(errorResponse("Missing required fields", 400), {
            status: 400,
          });
        }

        const result = await registerUser(email, phone, password, name);

        if (result.error) {
          return Response.json(errorResponse(result.error, result.statusCode), {
            status: result.statusCode,
          });
        }

        return Response.json(
          successResponse(result.data, "Registration successful", 201),
          {
            status: 201,
          },
        );
      }

      if (action === "login") {
        if (!email || !password) {
          return Response.json(
            errorResponse("Email and password are required", 400),
            { status: 400 },
          );
        }

        const result = await loginUser(email, password);

        if (result.error) {
          return Response.json(errorResponse(result.error, result.statusCode), {
            status: result.statusCode,
          });
        }

        return Response.json(successResponse(result.data, "Login successful"), {
          status: 200,
        });
      }

      return Response.json(errorResponse("Invalid action", 400), {
        status: 400,
      });
    } catch (error) {
      console.error("Auth error:", error);
      return Response.json(errorResponse("Internal server error", 500), {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Database connection error:", error.message);
    return Response.json(
      errorResponse("Database connection failed. Please try again later.", 503),
      {
        status: 503,
      },
    );
  }
}
