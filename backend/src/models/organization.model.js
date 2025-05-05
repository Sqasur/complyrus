import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billingInfo: {
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      country: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      contactName: {
        type: String,
      },
      contactEmail: {
        type: String,
      },
      contactPhone: {
        type: String,
      },
      paymentMethod: {
        type: String,
        enum: ["creditCard", "paypal", "bankTransfer"],
      },
      paymentStatus: {
        type: String,
        enum: ["paid", "unpaid", "pending"],
        default: "unpaid",
      },
    },
    settings: {
      complianceProgramsEnabled: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ComplianceProgram" },
      ],
      dataRetentionPeriod: {
        type: Number,
        default: 365, // days
      },
      ipRestrictions: {
        type: [String],
        default: [],
      },
    },
    users: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        roles: [
          {
            type: String,
            enum: ["orgOwner", "orgAdmin", "teamLeader", "employee"],
            default: "employee",
          },
        ],
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    organizationStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
