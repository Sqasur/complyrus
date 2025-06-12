// filepath: frontend/src/app/api/teams/[id]/members/[userId]/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { role } = await request.json();
    const { id: teamId, userId } = await params;

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

    // Find the team
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

    // Check permissions
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

    // Only organization admins/owners or team leaders can change roles
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

    // Find and update the member
    const memberIndex = team.members.findIndex(
      (m) => (m.userId._id || m.userId).toString() === userId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not a team member",
        },
        { status: 404 }
      );
    }

    team.members[memberIndex].role = role;
    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate("organizationId", "name")
      .populate("members.userId", "firstName lastName email username")
      .populate("createdBy", "firstName lastName");

    return NextResponse.json({
      success: true,
      message: "Member role updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id: teamId, userId } = await params;

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

    // Find the team
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

    // Check permissions
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

    // Users can remove themselves, or admins/owners/team leaders can remove others
    const isSelfRemoval = currentUser._id.toString() === userId;
    const hasPermission =
      ["admin", "owner"].includes(userOrgRole) || userTeamRole === "teamLeader";

    if (!isSelfRemoval && !hasPermission) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    // Remove member from team
    team.members = team.members.filter(
      (m) => (m.userId._id || m.userId).toString() !== userId
    );

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate("organizationId", "name")
      .populate("members.userId", "firstName lastName email username")
      .populate("createdBy", "firstName lastName");

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
