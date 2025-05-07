import mongoose, { Schema } from "mongoose";

const complianceProgramSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: String, // e.g., "Healthcare", "Information Security"
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programStandards: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProgramStandard",
      },
    ],
    programRules: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProgramRule",
      },
    ],
  },
  { timestamps: true }
);

export const ComplianceProgram = mongoose.model(
  "ComplianceProgram",
  complianceProgramSchema
);
