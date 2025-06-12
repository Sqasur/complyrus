import mongoose, { Schema } from "mongoose";

const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["SOP", "Policy", "Checklist", "Other"],
      default: "Other",
    },
    content: {
      type: String, // URL or text content
      required: true,
    },
    associatedPrograms: [
      {
        type: Schema.Types.ObjectId,
        ref: "ComplianceProgram",
      },
    ],
    associatedStandards: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProgramStandard",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Template =
  mongoose.models.Template || mongoose.model("Template", templateSchema);
