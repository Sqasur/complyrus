import { withAuth } from "@/lib/auth";
import { ProgramStandard } from "@/models/programStandard.model";
import { ComplianceProgram } from "@/models/complianceProgram.model";
import { ProgramRule } from "@/models/programRule.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create a new program standard
const createProgramStandard = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params; // This is the complianceProgramId
  const body = await request.json();
  const { programRuleId, label, title, description, priority, type } = body;

  if (!label || !title) {
    throw new ApiError(400, "Label and title are required");
  }

  const complianceProgram = await ComplianceProgram.findById(id);
  if (!complianceProgram) {
    throw new ApiError(404, "Compliance Program not found");
  }

  if (programRuleId) {
    const programRule = await ProgramRule.findById(programRuleId);
    if (!programRule) {
      throw new ApiError(404, "Program Rule not found");
    }

    // Ensure the rule belongs to the same compliance program
    if (programRule.complianceProgramId.toString() !== id) {
      throw new ApiError(
        400,
        "The provided Program Rule does not belong to the specified Compliance Program"
      );
    }
  }

  const standard = await ProgramStandard.create({
    complianceProgramId: id,
    programRuleId,
    label,
    title,
    description,
    priority,
    type,
  });

  // Prevent duplicate standard IDs
  if (!complianceProgram.programStandards.includes(standard._id)) {
    complianceProgram.programStandards.push(standard._id);
    await complianceProgram.save();
  }

  return successResponse(
    standard,
    "Program standard created successfully",
    201
  );
});

// Fetch all standards for a compliance program
const fetchStandardsForProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const standards = await ProgramStandard.find({ complianceProgramId: id })
    .populate("programRuleId", "name code")
    .sort({ createdAt: -1 });

  return successResponse(standards, "Standards fetched successfully");
});

// Export with auth protection
export const POST = withAuth(createProgramStandard, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const GET = withAuth(fetchStandardsForProgram, {
  siteLevel: ["siteAdmin", "siteModerator"],
});
