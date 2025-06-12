import connectDB from "./db.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/organization.model.js";
import { Team } from "../models/team.model.js";
import { ComplianceProgram } from "../models/complianceProgram.model.js";
import { Template } from "../models/template.model.js";
import { Folder } from "../models/folder.model.js";

// Sample users data
const sampleUsers = [
  {
    username: "admin",
    email: "admin@complyrus.com",
    password: "admin123",
    firstName: "Site",
    lastName: "Administrator",
    phoneNumber: "+1234567890",
    isSiteAdmin: true,
    siteLevelRoles: ["siteAdmin"],
  },
  {
    username: "moderator",
    email: "moderator@complyrus.com",
    password: "mod123",
    firstName: "Site",
    lastName: "Moderator",
    phoneNumber: "+1234567891",
    siteLevelRoles: ["siteModerator"],
  },
  {
    username: "johndoe",
    email: "john@acmecorp.com",
    password: "john123",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567892",
  },
  {
    username: "janesmith",
    email: "jane@acmecorp.com",
    password: "jane123",
    firstName: "Jane",
    lastName: "Smith",
    phoneNumber: "+1234567893",
  },
  {
    username: "mikejohnson",
    email: "mike@acmecorp.com",
    password: "mike123",
    firstName: "Mike",
    lastName: "Johnson",
    phoneNumber: "+1234567894",
  },
  {
    username: "sarahwilson",
    email: "sarah@techstart.com",
    password: "sarah123",
    firstName: "Sarah",
    lastName: "Wilson",
    phoneNumber: "+1234567895",
  },
  {
    username: "davidbrown",
    email: "david@techstart.com",
    password: "david123",
    firstName: "David",
    lastName: "Brown",
    phoneNumber: "+1234567896",
  },
  {
    username: "emilydavis",
    email: "emily@globalinc.com",
    password: "emily123",
    firstName: "Emily",
    lastName: "Davis",
    phoneNumber: "+1234567897",
  },
];

// Sample organizations
const sampleOrganizations = [
  {
    name: "ACME Corporation",
    description:
      "Leading manufacturing company focused on compliance excellence",
    logoUrl: "https://example.com/acme-logo.png",
    billingInfo: {
      plan: "enterprise",
      billingAddress: "123 Business St, Corporate City, CC 12345",
    },
  },
  {
    name: "TechStart Inc",
    description: "Innovative technology startup with strong compliance focus",
    logoUrl: "https://example.com/techstart-logo.png",
    billingInfo: {
      plan: "professional",
      billingAddress: "456 Innovation Ave, Tech Valley, TV 67890",
    },
  },
  {
    name: "Global Industries",
    description:
      "International conglomerate with complex compliance requirements",
    logoUrl: "https://example.com/global-logo.png",
    billingInfo: {
      plan: "enterprise",
      billingAddress: "789 Global Plaza, Worldwide City, WW 11111",
    },
  },
];

// Sample teams
const sampleTeams = [
  {
    name: "Compliance Team",
    description: "Handles all compliance-related activities and documentation",
  },
  {
    name: "Legal Department",
    description: "Legal review and regulatory compliance oversight",
  },
  {
    name: "Risk Management",
    description: "Risk assessment and mitigation strategies",
  },
  {
    name: "Quality Assurance",
    description: "Quality control and compliance verification",
  },
  {
    name: "Audit Team",
    description: "Internal and external audit coordination",
  },
];

// Sample compliance programs
const sampleCompliancePrograms = [
  {
    name: "ISO 27001 Information Security",
    description: "Information security management system compliance",
    version: "2013",
    status: "active",
  },
  {
    name: "SOX Compliance",
    description: "Sarbanes-Oxley Act compliance for financial reporting",
    version: "2022",
    status: "active",
  },
  {
    name: "GDPR Data Protection",
    description: "General Data Protection Regulation compliance",
    version: "2018",
    status: "active",
  },
  {
    name: "HIPAA Healthcare",
    description: "Health Insurance Portability and Accountability Act",
    version: "2013",
    status: "draft",
  },
];

// Sample templates
const sampleTemplates = [
  {
    name: "Incident Response Plan",
    type: "Policy",
    content: `
      <h1>Incident Response Plan Template</h1>
      <h2>1. Immediate Response</h2>
      <p>Upon discovery of a security incident:</p>
      <ul>
        <li>Contain the incident immediately</li>
        <li>Notify the incident response team</li>
        <li>Document all actions taken</li>
      </ul>
      <h2>2. Assessment</h2>
      <p>Evaluate the scope and impact of the incident...</p>
    `,
  },
  {
    name: "Policy Review Checklist",
    type: "Checklist",
    content: `
      <h1>Policy Review Checklist</h1>
      <h2>Pre-Review Preparation</h2>
      <ul>
        <li>[ ] Gather current policy documents</li>
        <li>[ ] Review regulatory changes</li>
        <li>[ ] Identify stakeholders</li>
      </ul>
      <h2>Review Process</h2>
      <ul>
        <li>[ ] Content accuracy review</li>
        <li>[ ] Compliance gap analysis</li>
        <li>[ ] Stakeholder feedback collection</li>
      </ul>
    `,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    await connectDB();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Team.deleteMany({});
    await ComplianceProgram.deleteMany({});
    await Template.deleteMany({});
    await Folder.deleteMany({});

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create compliance programs
    console.log("📋 Creating compliance programs...");
    const createdPrograms = [];
    for (const programData of sampleCompliancePrograms) {
      const program = await ComplianceProgram.create({
        ...programData,
        createdBy: createdUsers[0]._id, // Created by admin
      });
      createdPrograms.push(program);
      console.log(`✅ Created program: ${program.name}`);
    }

    // Create templates
    console.log("📄 Creating templates...");
    for (const templateData of sampleTemplates) {
      const template = await Template.create({
        ...templateData,
        associatedPrograms: [createdPrograms[0]._id], // Associate with ISO 27001
        createdBy: createdUsers[0]._id, // Created by admin
      });
      console.log(`✅ Created template: ${template.name}`);
    }

    // Create organizations and assign users
    console.log("🏢 Creating organizations...");
    const createdOrganizations = [];

    // ACME Corporation
    const acmeOrg = await Organization.create({
      ...sampleOrganizations[0],
      createdBy: createdUsers[2]._id, // John Doe
      users: [
        { userId: createdUsers[2]._id, roles: ["orgOwner"] }, // John Doe - Owner
        { userId: createdUsers[3]._id, roles: ["orgAdmin"] }, // Jane Smith - Admin
        { userId: createdUsers[4]._id, roles: ["employee"] }, // Mike Johnson - Employee
      ],
      settings: {
        complianceProgramsEnabled: [
          createdPrograms[0]._id,
          createdPrograms[1]._id,
        ], // ISO 27001 & SOX
      },
    });
    createdOrganizations.push(acmeOrg);
    console.log(`✅ Created organization: ${acmeOrg.name}`);

    // TechStart Inc
    const techStartOrg = await Organization.create({
      ...sampleOrganizations[1],
      createdBy: createdUsers[5]._id, // Sarah Wilson
      users: [
        { userId: createdUsers[5]._id, roles: ["orgOwner"] }, // Sarah Wilson - Owner
        { userId: createdUsers[6]._id, roles: ["employee"] }, // David Brown - Employee
      ],
      settings: {
        complianceProgramsEnabled: [createdPrograms[2]._id], // GDPR
      },
    });
    createdOrganizations.push(techStartOrg);
    console.log(`✅ Created organization: ${techStartOrg.name}`);

    // Global Industries
    const globalOrg = await Organization.create({
      ...sampleOrganizations[2],
      createdBy: createdUsers[7]._id, // Emily Davis
      users: [
        { userId: createdUsers[7]._id, roles: ["orgOwner"] }, // Emily Davis - Owner
      ],
      settings: {
        complianceProgramsEnabled: createdPrograms.map((p) => p._id), // All programs
      },
    });
    createdOrganizations.push(globalOrg);
    console.log(`✅ Created organization: ${globalOrg.name}`);

    // Create teams for each organization
    console.log("👥 Creating teams...");

    // Teams for ACME Corporation
    const acmeTeams = [];
    for (let i = 0; i < 3; i++) {
      const team = await Team.create({
        ...sampleTeams[i],
        organizationId: acmeOrg._id,
        members: [
          { userId: createdUsers[2]._id, role: "teamLeader" }, // John Doe - Leader
          { userId: createdUsers[3]._id, role: "employee" }, // Jane Smith - Member
          { userId: createdUsers[4]._id, role: "employee" }, // Mike Johnson - Member
        ],
        createdBy: createdUsers[2]._id,
      });
      acmeTeams.push(team);
      acmeOrg.teams.push(team._id);
      console.log(`✅ Created team: ${team.name} (ACME Corp)`);
    }
    await acmeOrg.save();

    // Teams for TechStart Inc
    const techStartTeams = [];
    for (let i = 3; i < 5; i++) {
      const team = await Team.create({
        ...sampleTeams[i],
        organizationId: techStartOrg._id,
        members: [
          { userId: createdUsers[5]._id, role: "teamLeader" }, // Sarah Wilson - Leader
          { userId: createdUsers[6]._id, role: "employee" }, // David Brown - Member
        ],
        createdBy: createdUsers[5]._id,
      });
      techStartTeams.push(team);
      techStartOrg.teams.push(team._id);
      console.log(`✅ Created team: ${team.name} (TechStart Inc)`);
    }
    await techStartOrg.save();

    // Create folders for teams
    console.log("📁 Creating folders...");

    // Folders for ACME Corporation teams
    for (const team of acmeTeams) {
      const folder = await Folder.create({
        name: `${team.name} Documents`,
        description: `Document repository for ${team.name}`,
        organizationId: acmeOrg._id,
        teamId: team._id,
        createdBy: createdUsers[2]._id,
      });
      console.log(`✅ Created folder: ${folder.name}`);
    }

    // Folders for TechStart Inc teams
    for (const team of techStartTeams) {
      const folder = await Folder.create({
        name: `${team.name} Files`,
        description: `File storage for ${team.name}`,
        organizationId: techStartOrg._id,
        teamId: team._id,
        createdBy: createdUsers[5]._id,
      });
      console.log(`✅ Created folder: ${folder.name}`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`🏢 Organizations created: ${createdOrganizations.length}`);
    console.log(
      `👥 Teams created: ${acmeTeams.length + techStartTeams.length}`
    );
    console.log(`📋 Compliance programs created: ${createdPrograms.length}`);
    console.log(`📄 Templates created: ${sampleTemplates.length}`);
    console.log(
      `📁 Folders created: ${acmeTeams.length + techStartTeams.length}`
    );

    console.log("\n🔑 Test Login Credentials:");
    console.log("Site Admin: admin@complyrus.com / admin123");
    console.log("Site Moderator: moderator@complyrus.com / mod123");
    console.log("ACME Corp Owner: john@acmecorp.com / john123");
    console.log("TechStart Owner: sarah@techstart.com / sarah123");
    console.log("Global Industries Owner: emily@globalinc.com / emily123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Named export
export { seedDatabase };
// Default export
export default seedDatabase;
