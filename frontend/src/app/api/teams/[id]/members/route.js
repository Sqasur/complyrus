// filepath: frontend/src/app/api/teams/[id]/members/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { userId, role = "employee" } = await request.json();
    const teamId = (await params).id;

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Find the team and populate necessary fields
    const team = await Team.findById(teamId)
      .populate("organizationId")
      .populate("members.userId");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found",
        },
        { status: 404 }
      );
    }

    // Check if user has permission to add members
    const org = await Organization.findById(team.organizationId._id).populate(
      "users.userId"
    );

    const userOrgRole = org.users.find(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    )?.role;

    const userTeamRole = team.members.find(
      (m) =>
        (m.userId._id || m.userId).toString() === currentUser._id.toString()
    )?.role;

    // Only organization admins/owners or team leaders can add members
    if (
      !["admin", "owner"].includes(userOrgRole) &&
      userTeamRole !== "teamLeader"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    // Check if user exists and is part of the organization
    const newUser = await User.findById(userId);
    if (!newUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isOrgMember = org.users.some(
      (u) => (u.userId._id || u.userId).toString() === userId
    );

    if (!isOrgMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not a member of this organization",
        },
        { status: 400 }
      );
    }

    // Check if user is already a team member
    const isTeamMember = team.members.some(
      (m) => (m.userId._id || m.userId).toString() === userId
    );

    if (isTeamMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User is already a team member",
        },
        { status: 400 }
      );
    }

    // Add member to team
    team.members.push({
      userId,
      role,
      joinedAt: new Date(),
    });

    await team.save();

    // Return updated team with populated data
    const updatedTeam = await Team.findById(teamId)
      .populate("organizationId", "name")
      .populate("members.userId", "firstName lastName email username")
      .populate("createdBy", "firstName lastName");

    return NextResponse.json({
      success: true,
      message: "Member added successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Add team member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
