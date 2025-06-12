import { successResponse, errorResponse, asyncHandler } from "@/lib/api-utils";
import seedDatabase from "@/lib/seed";

export const POST = asyncHandler(async (request) => {
  // Only allow seeding in development
  if (process.env.NODE_ENV === "production") {
    return errorResponse("Seeding is not allowed in production", 403);
  }

  try {
    await seedDatabase();
    return successResponse(
      {
        message: "Database seeded successfully",
        timestamp: new Date().toISOString(),
      },
      "Database seeding completed"
    );
  } catch (error) {
    console.error("Seeding error:", error);
    return errorResponse(`Seeding failed: ${error.message}`, 500);
  }
});
