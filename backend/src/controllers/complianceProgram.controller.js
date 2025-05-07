import { ComplianceProgram } from "../models/complianceProgram.model.js";
import { ProgramRule } from "../models/programRule.model.js";
import { ProgramStandard } from "../models/programStandard.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new compliance program
export const createComplianceProgram = asyncHandler(async (req, res) => {
  const { name, description, industry, isActive } = req.body;

  if (!name || !industry) {
    throw new ApiError(400, "Name and industry are required");
  }

  const program = await ComplianceProgram.create({
    name,
    description,
    industry,
    isActive,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, program, "Program created successfully"));
});

// Fetch all compliance programs
export const fetchAllCompliancePrograms = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter =
    isActive !== undefined ? { isActive: isActive === "true" } : {};
  const programs = await ComplianceProgram.find(filter);
  res
    .status(200)
    .json(new ApiResponse(200, programs, "Programs fetched successfully"));
});

// Fetch a single compliance program with rules and standards
export const fetchComplianceProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const program = await ComplianceProgram.findById(id)
    .populate("programRules")
    .populate("programStandards");
  if (!program) throw new ApiError(404, "Program not found");
  res
    .status(200)
    .json(new ApiResponse(200, program, "Program fetched successfully"));
});

// Update a compliance program
export const updateComplianceProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const program = await ComplianceProgram.findByIdAndUpdate(id, updates, {
    new: true,
  });
  if (!program) throw new ApiError(404, "Program not found");

  res
    .status(200)
    .json(new ApiResponse(200, program, "Program updated successfully"));
});

// Delete a compliance program (soft delete)
export const deleteComplianceProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await ComplianceProgram.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!program) throw new ApiError(404, "Program not found");

  res
    .status(200)
    .json(new ApiResponse(200, program, "Program deleted successfully"));
});

// Fetch program with nested rules and standards
export const fetchProgramWithDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await ComplianceProgram.findById(id);
  if (!program) throw new ApiError(404, "Program not found");

  const rules = await ProgramRule.find({ complianceProgramId: id });
  const standards = await ProgramStandard.find({
    complianceProgramId: id,
    programRuleId: null,
  });

  const rulesWithStandards = await Promise.all(
    rules.map(async (rule) => {
      const ruleStandards = await ProgramStandard.find({
        programRuleId: rule._id,
      });
      return { ...rule.toObject(), standards: ruleStandards };
    })
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...program.toObject(), rules: rulesWithStandards, standards },
        "Program details fetched successfully"
      )
    );
});
