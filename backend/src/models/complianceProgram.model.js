import mongoose, { Schema } from "mongoose";
import { ProgramStandard } from "./programStandard.model.js";
import { ProgramRule } from "./programRule.model.js";

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

complianceProgramSchema.pre("remove", async function () {
  await ProgramStandard.deleteMany({ complianceProgramId: this._id });
  await ProgramRule.deleteMany({ complianceProgramId: this._id });
});

complianceProgramSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await ProgramStandard.deleteMany({ complianceProgramId: this._id });
    await ProgramRule.deleteMany({ complianceProgramId: this._id });
  }
);

export const ComplianceProgram = mongoose.model(
  "ComplianceProgram",
  complianceProgramSchema
);
