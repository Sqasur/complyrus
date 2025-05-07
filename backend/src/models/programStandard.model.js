import mongoose, { Schema } from "mongoose";

const programStandardSchema = new Schema(
  {
    complianceProgramId: {
      type: Schema.Types.ObjectId,
      ref: "ComplianceProgram",
      required: true,
    },
    programRuleId: {
      type: Schema.Types.ObjectId,
      ref: "ProgramRule",
      default: null, // Nullable for programs without rules
    },
    label: {
      type: String, // e.g., "164.308(a)(1)(ii)(A)"
      required: true,
      trim: true,
    },
    title: {
      type: String, // e.g., "Risk Analysis"
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["administrative", "technical", "physical", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

export const ProgramStandard = mongoose.model(
  "ProgramStandard",
  programStandardSchema
);
