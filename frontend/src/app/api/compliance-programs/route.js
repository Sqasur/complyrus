import { withAuth } from "@/lib/auth";
import { ComplianceProgram } from "@/models/complianceProgram.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create compliance program
const createComplianceProgram = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { name, description, version, status } = body;

  if (!name) {
    throw new ApiError(400, "Program name is required");
  }

  const existingProgram = await ComplianceProgram.findOne({ name });
  if (existingProgram) {
    throw new ApiError(
      400,
      "A compliance program with this name already exists"
    );
  }

  const program = await ComplianceProgram.create({
    name,
    description,
    version: version || "1.0.0",
    status: status || "draft",
    createdBy: request.user._id,
  });

  return successResponse(
    program,
    "Compliance program created successfully",
    201
  );
});

// Fetch all compliance programs
const fetchAllCompliancePrograms = asyncHandler(async (request) => {
  await connectDB();

  const programs = await ComplianceProgram.find()
    .populate("createdBy", "firstName lastName email")
    .populate("programRules")
    .populate("programStandards")
    .sort({ createdAt: -1 });

  return successResponse(programs, "Compliance programs fetched successfully");
});

// Export HTTP methods with auth protection
export const POST = withAuth(createComplianceProgram, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const GET = withAuth(fetchAllCompliancePrograms, {
  siteLevel: ["siteAdmin", "siteModerator"],
});
