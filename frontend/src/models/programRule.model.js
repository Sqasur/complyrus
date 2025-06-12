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

programRuleSchema.index({ complianceProgramId: 1 });

programRuleSchema.index({ complianceProgramId: 1, code: 1 }, { unique: true });

programRuleSchema.pre("remove", async function () {
  await mongoose
    .model("ProgramStandard")
    .deleteMany({ programRuleId: this._id });
});

programRuleSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await mongoose
      .model("ProgramStandard")
      .deleteMany({ programRuleId: this._id });
  }
);

export const ProgramRule =
  mongoose.models.ProgramRule ||
  mongoose.model("ProgramRule", programRuleSchema);
