// filepath: frontend/src/app/api/folders/[id]/documents/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Document } from "@/models/document.model";
import { Folder } from "@/models/folder.model";
import { Team } from "@/models/team.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

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

    // Find the folder to verify access
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

    // Get documents in this folder
    const documents = await Document.find({ folderId })
      .populate("createdBy", "firstName lastName email")
      .populate("associatedPrograms", "name")
      .populate("associatedStandards", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get folder documents error:", error);
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

    // Check if user has access to upload to this folder
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name");
    const type = formData.get("type");
    const isPrivate = formData.get("isPrivate") === "true";

    if (!file || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "File, name, and type are required",
        },
        { status: 400 }
      );
    }

    // Generate unique S3 key
    const fileExtension = file.name.split(".").pop();
    const s3Key = `documents/${folder.organizationId._id}/${
      folder.teamId._id
    }/${folderId}/${uuidv4()}.${fileExtension}`;

    // Upload file to S3
    const uploadResult = await uploadToS3(file, s3Key);
    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload file",
        },
        { status: 500 }
      );
    }

    // Create document record
    const document = new Document({
      name,
      type,
      isPrivate,
      organizationId: folder.organizationId._id,
      teamId: folder.teamId._id,
      folderId,
      createdBy: currentUser._id,
      versions: [
        {
          versionNumber: "v1.0",
          s3Key,
          isCurrent: true,
          createdAt: new Date(),
        },
      ],
    });

    await document.save();

    // Return created document with populated data
    const populatedDocument = await Document.findById(document._id)
      .populate("createdBy", "firstName lastName email")
      .populate("associatedPrograms", "name")
      .populate("associatedStandards", "name");

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      data: populatedDocument,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
