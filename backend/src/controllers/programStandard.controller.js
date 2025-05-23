import { ProgramStandard } from "../models/programStandard.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { ComplianceProgram } from "../models/complianceProgram.model.js";

// Create a new program standard
export const createProgramStandard = asyncHandler(async (req, res) => {
  const {
    complianceProgramId,
    programRuleId,
    label,
    title,
    description,
    priority,
    type,
  } = req.body;

  if (!complianceProgramId || !label || !title) {
    throw new ApiError(
      400,
      "Compliance Program ID, label, and title are required"
    );
  }

  const complianceProgram =
    await ComplianceProgram.findById(complianceProgramId);
  if (!complianceProgram) {
    throw new ApiError(404, "Compliance Program not found");
  }

  if (programRuleId) {
    const programRule = await ProgramRule.findById(programRuleId);
    if (!programRule) {
      throw new ApiError(404, "Program Rule not found");
    }

    // Ensure the rule belongs to the same compliance program
    if (programRule.complianceProgramId.toString() !== complianceProgramId) {
      throw new ApiError(
        400,
        "The provided Program Rule does not belong to the specified Compliance Program"
      );
    }
  }

  const standard = await ProgramStandard.create({
    complianceProgramId,
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

  res
    .status(201)
    .json(
      new ApiResponse(201, standard, "Program standard created successfully")
    );
});

// Fetch all standards for a compliance program
export const fetchStandardsForProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standards = await ProgramStandard.find({ complianceProgramId: id });
  res
    .status(200)
    .json(new ApiResponse(200, standards, "Standards fetched successfully"));
});

// Fetch all standards for a rule
export const fetchStandardsForRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standards = await ProgramStandard.find({ programRuleId: id });
  res
    .status(200)
    .json(new ApiResponse(200, standards, "Standards fetched successfully"));
});

// Fetch a single standard
export const fetchProgramStandard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standard = await ProgramStandard.findById(id);
  if (!standard) throw new ApiError(404, "Standard not found");

  res
    .status(200)
    .json(new ApiResponse(200, standard, "Standard fetched successfully"));
});

// Update a program standard
export const updateProgramStandard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const standard = await ProgramStandard.findByIdAndUpdate(id, updates, {
    new: true,
  });
  if (!standard) throw new ApiError(404, "Standard not found");

  res
    .status(200)
    .json(new ApiResponse(200, standard, "Standard updated successfully"));
});

// Delete a program standard
export const deleteProgramStandard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const standard = await ProgramStandard.findByIdAndDelete(id);
  if (!standard) throw new ApiError(404, "Standard not found");

  // Remove the standard ID from the compliance program's programStandards array
  await ComplianceProgram.updateOne(
    { _id: standard.complianceProgramId },
    { $pull: { programStandards: id } }
  );

  if (standard.programRuleId) {
    await ProgramRule.findByIdAndUpdate(standard.programRuleId, {
      $pull: { programStandards: id },
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Standard deleted successfully"));
});
