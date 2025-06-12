// filepath: frontend/src/app/api/teams/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

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

    // Find the team with populated fields
    const team = await Team.findById(teamId)
      .populate("organizationId", "name description")
      .populate("members.userId", "firstName lastName email username createdAt")
      .populate("createdBy", "firstName lastName email");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found",
        },
        { status: 404 }
      );
    }

    // Check if user has access to this team
    const org = await Organization.findById(team.organizationId._id).populate(
      "users.userId"
    );

    const isOrgMember = org.users.some(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    );

    const isTeamMember = team.members.some(
      (m) =>
        (m.userId._id || m.userId).toString() === currentUser._id.toString()
    );

    if (!isOrgMember || !isTeamMember) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { name, description } = await request.json();
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

    // Find the team
    const team = await Team.findById(teamId).populate("organizationId");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found",
        },
        { status: 404 }
      );
    }

    // Check permissions - organization admins/owners or team leaders can update
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

    // Update team
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate("organizationId", "name description")
      .populate("members.userId", "firstName lastName email username")
      .populate("createdBy", "firstName lastName email");

    return NextResponse.json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Update team error:", error);
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

    // Find the team
    const team = await Team.findById(teamId).populate("organizationId");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Team not found",
        },
        { status: 404 }
      );
    }

    // Check permissions - only organization admins/owners can delete teams
    const org = await Organization.findById(team.organizationId._id).populate(
      "users.userId"
    );

    const userOrgRole = org.users.find(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    )?.role;

    if (!["admin", "owner"].includes(userOrgRole)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Permission denied - only organization admins can delete teams",
        },
        { status: 403 }
      );
    }

    // Delete team
    await Team.findByIdAndDelete(teamId);

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
