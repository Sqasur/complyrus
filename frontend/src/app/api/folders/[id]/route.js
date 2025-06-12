// filepath: frontend/src/app/api/folders/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Folder } from "@/models/folder.model";
import { Document } from "@/models/document.model";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const folderId = (await params).id;

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

    // Find the folder with populated fields
    const folder = await Folder.findById(folderId)
      .populate("organizationId", "name")
      .populate("teamId", "name members")
      .populate("createdBy", "firstName lastName email");

    if (!folder) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder not found",
        },
        { status: 404 }
      );
    }

    // Check if user has access to this folder
    const org = await Organization.findById(folder.organizationId._id).populate(
      "users.userId"
    );

    const isOrgMember = org.users.some(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    );

    const isTeamMember = folder.teamId.members.some(
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
      data: folder,
    });
  } catch (error) {
    console.error("Get folder error:", error);
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
    const folderId = (await params).id;

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

    // Find the folder
    const folder = await Folder.findById(folderId)
      .populate("organizationId")
      .populate("teamId");

    if (!folder) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder not found",
        },
        { status: 404 }
      );
    }

    // Check permissions
    const org = await Organization.findById(folder.organizationId._id).populate(
      "users.userId"
    );

    const userOrgRole = org.users.find(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    )?.role;

    const userTeamRole = folder.teamId.members.find(
      (m) =>
        (m.userId._id || m.userId).toString() === currentUser._id.toString()
    )?.role;

    // Only organization admins/owners, team leaders, or folder creator can update
    const isCreator =
      folder.createdBy.toString() === currentUser._id.toString();
    const canUpdate =
      ["admin", "owner"].includes(userOrgRole) ||
      userTeamRole === "teamLeader" ||
      isCreator;

    if (!canUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    // Update folder
    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate("organizationId", "name")
      .populate("teamId", "name")
      .populate("createdBy", "firstName lastName email");

    return NextResponse.json({
      success: true,
      message: "Folder updated successfully",
      data: updatedFolder,
    });
  } catch (error) {
    console.error("Update folder error:", error);
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

    const folderId = (await params).id;

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

    // Check if folder has documents
    const documentsCount = await Document.countDocuments({ folderId });
    if (documentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete folder that contains documents",
        },
        { status: 400 }
      );
    }

    // Find the folder
    const folder = await Folder.findById(folderId)
      .populate("organizationId")
      .populate("teamId");

    if (!folder) {
      return NextResponse.json(
        {
          success: false,
          message: "Folder not found",
        },
        { status: 404 }
      );
    }

    // Check permissions - only organization admins/owners can delete folders
    const org = await Organization.findById(folder.organizationId._id).populate(
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
            "Permission denied - only organization admins can delete folders",
        },
        { status: 403 }
      );
    }

    // Delete folder
    await Folder.findByIdAndDelete(folderId);

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
