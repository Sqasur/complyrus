import { ProgramRule } from "../models/programRule.model.js";
import { ComplianceProgram } from "../models/complianceProgram.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new program rule
export const createProgramRule = asyncHandler(async (req, res) => {
  const { complianceProgramId, name, code, description } = req.body;

  if (!complianceProgramId || !name) {
    throw new ApiError(400, "Compliance Program ID and name are required");
  }

  const complianceProgram =
    await ComplianceProgram.findById(complianceProgramId);
  if (!complianceProgram) {
    throw new ApiError(404, "Compliance Program not found");
  }

  // Create the new program rule
  let rule;
  try {
    rule = await ProgramRule.create({
      complianceProgramId,
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

  res
    .status(201)
    .json(new ApiResponse(201, rule, "Program rule created successfully"));
});

// Fetch all rules for a compliance program
export const fetchRulesForProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rules = await ProgramRule.find({ complianceProgramId: id });
  res
    .status(200)
    .json(new ApiResponse(200, rules, "Rules fetched successfully"));
});

// Fetch a single rule
export const fetchProgramRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rule = await ProgramRule.findById(id).populate("programStandards");
  if (!rule) throw new ApiError(404, "Rule not found");

  res.status(200).json(new ApiResponse(200, rule, "Rule fetched successfully"));
});

// Update a program rule
export const updateProgramRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const rule = await ProgramRule.findByIdAndUpdate(id, updates, { new: true });
  if (!rule) throw new ApiError(404, "Rule not found");

  res.status(200).json(new ApiResponse(200, rule, "Rule updated successfully"));
});

// Delete a program rule
export const deleteProgramRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Delete all program standards associated with this rule
  await ProgramStandard.deleteMany({ programRuleId: id });

  // Delete the program rule
  const rule = await ProgramRule.findByIdAndDelete(id);
  if (!rule) throw new ApiError(404, "Rule not found");

  // Remove the rule ID from the compliance program's programRules array
  await ComplianceProgram.findByIdAndUpdate(rule.complianceProgramId, {
    $pull: { programRules: rule._id },
  });

  res.status(200).json(new ApiResponse(200, {}, "Rule deleted successfully"));
});
