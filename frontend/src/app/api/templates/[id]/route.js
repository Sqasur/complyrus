import { withAuth } from "@/lib/auth";
import { Template } from "@/models/template.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";
import sanitizeHtml from "sanitize-html";

// Fetch single template
const fetchTemplate = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const template = await Template.findById(id)
    .populate("associatedPrograms")
    .populate("associatedStandards")
    .populate("createdBy", "firstName lastName email");

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return successResponse(template, "Template fetched successfully");
});

// Update template
const updateTemplate = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;
  const body = await request.json();

  // Sanitize the content field if it exists in the updates
  if (body.content) {
    body.content = sanitizeHtml(body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
        "u",
        "span",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "title", "width", "height"],
        span: ["style"],
      },
    });
  }

  const template = await Template.findByIdAndUpdate(id, body, { new: true })
    .populate("associatedPrograms")
    .populate("associatedStandards");

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return successResponse(template, "Template updated successfully");
});

// Delete template
const deleteTemplate = asyncHandler(async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const template = await Template.findByIdAndDelete(id);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return successResponse({}, "Template deleted successfully");
});

// Export with auth protection
export const GET = withAuth(fetchTemplate, {
  siteLevel: ["siteAdmin", "siteModerator"],
  org: ["orgOwner", "orgAdmin"],
  team: ["teamLeader"],
});

export const PATCH = withAuth(updateTemplate, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const DELETE = withAuth(deleteTemplate, {
  siteLevel: ["siteAdmin", "siteModerator"],
});
