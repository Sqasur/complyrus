import { withAuth } from "@/lib/auth";
import { ComplianceProgram } from "@/models/complianceProgram.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Fetch single compliance program
const fetchComplianceProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const program = await ComplianceProgram.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("programRules")
    .populate("programStandards");

  if (!program) {
    throw new ApiError(404, "Compliance program not found");
  }

  return successResponse(program, "Compliance program fetched successfully");
});

// Update compliance program
const updateComplianceProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;
  const body = await request.json();

  const program = await ComplianceProgram.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!program) {
    throw new ApiError(404, "Compliance program not found");
  }

  return successResponse(program, "Compliance program updated successfully");
});

// Delete compliance program
const deleteComplianceProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const program = await ComplianceProgram.findByIdAndDelete(id);

  if (!program) {
    throw new ApiError(404, "Compliance program not found");
  }

  return successResponse({}, "Compliance program deleted successfully");
});

// Activate compliance program
const activateComplianceProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const program = await ComplianceProgram.findByIdAndUpdate(
    id,
    { status: "active" },
    { new: true }
  );

  if (!program) {
    throw new ApiError(404, "Compliance program not found");
  }

  return successResponse(program, "Compliance program activated successfully");
});

// Deactivate compliance program
const deactivateComplianceProgram = asyncHandler(
  async (request, { params }) => {
    await connectDB();

    const { id } = await params;

    const program = await ComplianceProgram.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true }
    );

    if (!program) {
      throw new ApiError(404, "Compliance program not found");
    }

    return successResponse(
      program,
      "Compliance program deactivated successfully"
    );
  }
);

// Export with auth protection
export const GET = withAuth(fetchComplianceProgram, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const PATCH = withAuth(updateComplianceProgram, {
  siteLevel: ["siteAdmin"],
});

export const DELETE = withAuth(deleteComplianceProgram, {
  siteLevel: ["siteAdmin"],
});
