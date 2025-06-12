// filepath: frontend/src/app/api/documents/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Document } from "@/models/document.model";
import { Folder } from "@/models/folder.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";
import { deleteFromS3 } from "@/lib/s3";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const documentId = (await params).id;

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

    // Find the document with populated fields
    const document = await Document.findById(documentId)
      .populate("organizationId", "name")
      .populate("teamId", "name members")
      .populate("folderId", "name")
      .populate("createdBy", "firstName lastName email")
      .populate("associatedPrograms", "name")
      .populate("associatedStandards", "name");

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    // Check if user has access to this document
    const org = await Organization.findById(
      document.organizationId._id
    ).populate("users.userId");

    const isOrgMember = org.users.some(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    );

    const isTeamMember = document.teamId.members.some(
      (m) =>
        (m.userId._id || m.userId).toString() === currentUser._id.toString()
    );

    // Check privacy settings
    if (
      document.isPrivate &&
      document.createdBy._id.toString() !== currentUser._id.toString()
    ) {
      // Private documents can only be accessed by the creator unless user is admin
      const userOrgRole = org.users.find(
        (u) =>
          (u.userId._id || u.userId).toString() === currentUser._id.toString()
      )?.role;

      if (!["admin", "owner"].includes(userOrgRole)) {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied to private document",
          },
          { status: 403 }
        );
      }
    }

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
      data: document,
    });
  } catch (error) {
    console.error("Get document error:", error);
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

    const { name, type, isPrivate, associatedPrograms, associatedStandards } =
      await request.json();
    const documentId = (await params).id;

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

    // Find the document
    const document = await Document.findById(documentId)
      .populate("organizationId")
      .populate("teamId");

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    // Check permissions
    const org = await Organization.findById(
      document.organizationId._id
    ).populate("users.userId");

    const userOrgRole = org.users.find(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    )?.role;

    const userTeamRole = document.teamId.members.find(
      (m) =>
        (m.userId._id || m.userId).toString() === currentUser._id.toString()
    )?.role;

    // Only document creator, organization admins/owners, or team leaders can update
    const isCreator =
      document.createdBy.toString() === currentUser._id.toString();
    const canUpdate =
      isCreator ||
      ["admin", "owner"].includes(userOrgRole) ||
      userTeamRole === "teamLeader";

    if (!canUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    // Update document
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      {
        name,
        type,
        isPrivate,
        associatedPrograms: associatedPrograms || [],
        associatedStandards: associatedStandards || [],
      },
      { new: true, runValidators: true }
    )
      .populate("organizationId", "name")
      .populate("teamId", "name")
      .populate("folderId", "name")
      .populate("createdBy", "firstName lastName email")
      .populate("associatedPrograms", "name")
      .populate("associatedStandards", "name");

    return NextResponse.json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Update document error:", error);
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

    const documentId = (await params).id;

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

    // Find the document
    const document = await Document.findById(documentId)
      .populate("organizationId")
      .populate("teamId");

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    // Check permissions
    const org = await Organization.findById(
      document.organizationId._id
    ).populate("users.userId");

    const userOrgRole = org.users.find(
      (u) =>
        (u.userId._id || u.userId).toString() === currentUser._id.toString()
    )?.role;

    // Only document creator or organization admins/owners can delete
    const isCreator =
      document.createdBy.toString() === currentUser._id.toString();
    const canDelete = isCreator || ["admin", "owner"].includes(userOrgRole);

    if (!canDelete) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        { status: 403 }
      );
    }

    // Delete all versions from S3
    for (const version of document.versions) {
      try {
        await deleteFromS3(version.s3Key);
      } catch (error) {
        console.error("Failed to delete S3 object:", version.s3Key, error);
        // Continue with deletion even if S3 cleanup fails
      }
    }

    // Delete document from database
    await Document.findByIdAndDelete(documentId);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
