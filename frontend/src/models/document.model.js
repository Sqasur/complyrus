import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["docx", "pdf", "xlsx"],
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
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
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    versions: [
      {
        versionNumber: {
          type: String,
          required: true,
        },
        s3Key: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isCurrent: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
