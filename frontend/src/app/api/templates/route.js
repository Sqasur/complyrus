import { withAuth } from "@/lib/auth";
import { Template } from "@/models/template.model";
import { ComplianceProgram } from "@/models/complianceProgram.model";
import { ProgramStandard } from "@/models/programStandard.model";
import { Organization } from "@/models/organization.model";
import { successResponse, ApiError, asyncHandler } from "@/lib/api-utils";
import connectDB from "@/lib/db";
import sanitizeHtml from "sanitize-html";

// Create a new template
const createTemplate = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const { name, type, content, associatedPrograms, associatedStandards } = body;

  if (!name || !content) {
    throw new ApiError(400, "Name and content are required");
  }

  // Validate associated programs
  if (associatedPrograms && associatedPrograms.length > 0) {
    for (const programId of associatedPrograms) {
      const program = await ComplianceProgram.findById(programId);
      if (!program) {
        throw new ApiError(
          404,
          `Compliance Program with ID ${programId} not found`
        );
      }
    }
  }

  // Validate associated standards
  if (associatedStandards && associatedStandards.length > 0) {
    for (const standardId of associatedStandards) {
      const standard = await ProgramStandard.findById(standardId);
      if (!standard) {
        throw new ApiError(
          404,
          `Program Standard with ID ${standardId} not found`
        );
      }
    }
  }

  // Sanitize the content field
  const sanitizedContent = sanitizeHtml(content, {
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

  const template = await Template.create({
    name,
    type,
    content: sanitizedContent,
    associatedPrograms,
    associatedStandards,
    createdBy: request.user._id,
  });

  return successResponse(template, "Template created successfully", 201);
});

// Fetch all templates
const fetchAllTemplates = asyncHandler(async (request) => {
  await connectDB();

  let templates;

  if (
    request.user.siteLevelRoles?.includes("siteAdmin") ||
    request.user.siteLevelRoles?.includes("siteModerator")
  ) {
    // SiteAdmins and SiteModerators can view all templates
    templates = await Template.find()
      .populate("associatedPrograms")
      .populate("associatedStandards")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
  } else {
    // OrgOwner, OrgAdmin, and TeamLeader can only view templates associated with their organization's enabled programs
    const organization = await Organization.findOne({
      "users.userId": request.user._id,
    }).populate("settings.complianceProgramsEnabled");

    if (!organization) {
      throw new ApiError(
        403,
        "Access denied. No associated organization found."
      );
    }

    const enabledProgramIds =
      organization.settings?.complianceProgramsEnabled?.map(
        (program) => program._id
      ) || [];

    templates = await Template.find({
      associatedPrograms: { $in: enabledProgramIds },
    })
      .populate("associatedPrograms")
      .populate("associatedStandards")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
  }

  return successResponse(templates, "Templates fetched successfully");
});

// Export with auth protection
export const POST = withAuth(createTemplate, {
  siteLevel: ["siteAdmin", "siteModerator"],
});

export const GET = withAuth(fetchAllTemplates, {
  siteLevel: ["siteAdmin", "siteModerator"],
  org: ["orgOwner", "orgAdmin"],
  team: ["teamLeader"],
});
