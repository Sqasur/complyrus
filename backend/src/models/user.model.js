import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
    organizationMemberships: [
      {
        organizationId: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
        },
        roles: [
          {
            type: String,
            enum: ["orgOwner", "orgAdmin", "teamLeader", "employee"],
            default: "employee",
          },
        ],
        teams: [
          {
            teamId: {
              type: Schema.Types.ObjectId,
              ref: "Team",
            },
            role: {
              type: String,
              enum: ["teamLeader", "employee"],
              default: "employee",
            },
          },
        ],
      },
    ],
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    isSiteAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (
  activeOrgId,
  activeOrgRoles,
  activeTeamId,
  activeTeamRoles
) {
  return jwt.sign(
    {
      _id: this._id,
      org: activeOrgId,
      oroles: activeOrgRoles,
      team: activeTeamId,
      troles: activeTeamRoles,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      sub: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
