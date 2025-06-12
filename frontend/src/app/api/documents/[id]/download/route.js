// filepath: frontend/src/app/api/documents/[id]/download/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Document } from "@/models/document.model";
import { User } from "@/models/user.model";
import { Organization } from "@/models/organization.model";
import { verifyToken } from "@/lib/auth";
import { getSignedUrlFromS3 } from "@/lib/s3";

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
      document.createdBy.toString() !== currentUser._id.toString()
    ) {
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

    // Get current version
    const currentVersion = document.versions.find((v) => v.isCurrent);
    if (!currentVersion) {
      return NextResponse.json(
        {
          success: false,
          message: "No current version found",
        },
        { status: 404 }
      );
    }

    try {
      // Get signed URL from S3
      const signedUrl = await getSignedUrlFromS3(currentVersion.s3Key);

      // Redirect to signed URL
      return NextResponse.redirect(signedUrl);
    } catch (error) {
      console.error("Failed to generate signed URL:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate download link",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Download document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
