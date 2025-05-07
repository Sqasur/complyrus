import { ProgramRule } from "../models/programRule.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new program rule
export const createProgramRule = asyncHandler(async (req, res) => {
  const { complianceProgramId, name, code, description } = req.body;

  if (!complianceProgramId || !name) {
    throw new ApiError(400, "Compliance Program ID and name are required");
  }

  const rule = await ProgramRule.create({
    complianceProgramId,
    name,
    code,
    description,
  });
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

  const rule = await ProgramRule.findByIdAndDelete(id);
  if (!rule) throw new ApiError(404, "Rule not found");

  res.status(200).json(new ApiResponse(200, {}, "Rule deleted successfully"));
});
