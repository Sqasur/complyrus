import mongoose, { Schema } from "mongoose";

const programRuleSchema = new Schema(
  {
    complianceProgramId: {
      type: Schema.Types.ObjectId,
      ref: "ComplianceProgram",
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g., "Security Rule"
      trim: true,
    },
    code: {
      type: String, // e.g., "164.308"
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    programStandards: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProgramStandard",
      },
    ],
  },
  { timestamps: true }
);

export const ProgramRule = mongoose.model("ProgramRule", programRuleSchema);
