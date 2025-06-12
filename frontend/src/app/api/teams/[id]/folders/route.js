// filepath: frontend/src/app/api/teams/[id]/folders/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/team.model";
import { Folder } from "@/models/folder.model";
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

    // Get folders for this team
    const folders = await Folder.find({ teamId })
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get team folders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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

    // Create new folder
    const folder = new Folder({
      name,
      description,
      teamId,
      organizationId: team.organizationId._id,
      createdBy: currentUser._id,
    });

    await folder.save();

    // Return created folder with populated data
    const populatedFolder = await Folder.findById(folder._id).populate(
      "createdBy",
      "firstName lastName"
    );

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      data: populatedFolder,
    });
  } catch (error) {
    console.error("Create team folder error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
