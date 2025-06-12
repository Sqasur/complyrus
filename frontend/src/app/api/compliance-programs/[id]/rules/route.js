import { withAuth } from "@/lib/auth";
import { ProgramRule } from "@/models/programRule.model";
import { ComplianceProgram } from "@/models/complianceProgram.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";

// Create a new program rule
const createProgramRule = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params; // This is the complianceProgramId
  const body = await request.json();
  const { name, code, description } = body;

  if (!name) {
    throw new ApiError(400, "Rule name is required");
  }

  const complianceProgram = await ComplianceProgram.findById(id);
  if (!complianceProgram) {
    throw new ApiError(404, "Compliance Program not found");
  }

  // Create the new program rule
  let rule;
  try {
    rule = await ProgramRule.create({
      complianceProgramId: id,
      name,
      code,
      description,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "Rule code already exists for this program");
    }
    throw err;
  }

  // Prevent duplicate rule IDs
  if (!complianceProgram.programRules.includes(rule._id)) {
    complianceProgram.programRules.push(rule._id);
    await complianceProgram.save();
  }

  return successResponse(rule, "Program rule created successfully", 201);
});

// Fetch all rules for a compliance program
const fetchRulesForProgram = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const rules = await ProgramRule.find({ complianceProgramId: id })
    .populate("programStandards")
    .sort({ createdAt: -1 });

  return successResponse(rules, "Rules fetched successfully");
});

// Export with auth protection
export const POST = withAuth(createProgramRule, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const GET = withAuth(fetchRulesForProgram, {
  siteLevel: ["siteAdmin", "siteModerator"],
});
