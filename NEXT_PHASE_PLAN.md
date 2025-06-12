# Next Phase Implementation Plan

## 🎯 **PHASE 1: COMPLIANCE FOUNDATION** (Priority: Critical)

### **1. Compliance Program Management**

**Estimated Time: 3-4 days**

#### **A. Admin Compliance Program Interface**

```javascript
// Pages to create:
- /admin/compliance-programs           // List all programs
- /admin/compliance-programs/new       // Create new program
- /admin/compliance-programs/[id]      // Edit program
- /admin/document-types               // Manage document types per program

// API Routes needed:
- GET/POST /api/admin/compliance-programs
- GET/PUT/DELETE /api/admin/compliance-programs/[id]
- GET/POST /api/admin/compliance-programs/[id]/document-types
```

#### **B. Document Type Categories**

```javascript
// Document types to implement:
- SOPs / Policies
- Checklists / Audits
- Training Records
- Incident Reports
- Forms
- Corrective Actions
- Risk Assessments
- Meeting Minutes
- Equipment Records

// Enhanced Document model needed with:
- complianceProgram: ObjectId
- documentType: String (from predefined categories)
- workflowStatus: String (draft, review, approved, archived)
```

### **2. Enhanced Role System**

**Estimated Time: 2-3 days**

#### **A. Role Permission Matrix Implementation**

```javascript
// Role definitions to implement:
const ROLE_PERMISSIONS = {
  systemAdmin: {
    seeAllDocs: true,
    createDocs: true,
    assignForms: false,
    seeOrgUsers: true,
    manageBilling: false,
    managePrograms: true,
  },
  orgOwner: {
    seeAllDocs: "orgOnly",
    createDocs: true,
    assignForms: true,
    seeOrgUsers: true,
    manageBilling: true,
    managePrograms: false,
  },
  orgAdmin: {
    seeAllDocs: "orgOnly",
    createDocs: true,
    assignForms: true,
    seeOrgUsers: true,
    manageBilling: false,
    managePrograms: false,
  },
  groupLeader: {
    seeAllDocs: "ownGroupsOnly",
    createDocs: true,
    assignForms: "ownGroupsOnly",
    seeOrgUsers: false,
    manageBilling: false,
    managePrograms: false,
  },
  employee: {
    seeAllDocs: false,
    createDocs: false,
    assignForms: false,
    seeOrgUsers: false,
    manageBilling: false,
    managePrograms: false,
  },
};
```

#### **B. Group-based Access Control**

```javascript
// Enhanced Team/Group model:
{
  name: String,
  organizationId: ObjectId,
  groupLeaders: [{ userId: ObjectId, assignedAt: Date }],
  members: [{ userId: ObjectId, role: String, joinedAt: Date }],
  compliancePrograms: [ObjectId], // Which programs this group works with
  permissions: {
    canViewAllOrgDocs: Boolean,
    canCreateTemplates: Boolean,
    allowedDocumentTypes: [String]
  }
}
```

---

## 🔧 **PHASE 2: DOCUMENT LIFECYCLE** (Priority: High)

### **3. Template System**

**Estimated Time: 4-5 days**

#### **A. Template Creation Interface**

```javascript
// Pages needed:
- /templates                          // List templates
- /templates/new                      // Create template
- /templates/[id]                     // Edit template
- /templates/[id]/preview             // Preview template

// Template model enhancement:
{
  name: String,
  description: String,
  complianceProgram: ObjectId,
  documentType: String,
  isGlobal: Boolean,              // Admin created vs org-specific
  organizationId: ObjectId,       // null for global templates
  createdBy: ObjectId,
  fields: [{                      // Form field definitions
    type: String,                 // text, textarea, checkbox, select, date
    label: String,
    required: Boolean,
    options: [String],            // for select fields
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String
    }
  }],
  structure: {                    // Document structure
    sections: [{
      title: String,
      fields: [String],           // Field IDs
      order: Number
    }]
  }
}
```

#### **B. Form Generation System**

```javascript
// Form creation from templates:
- /forms/new?template=[id]            // Create form from template
- /forms/[id]/assign                  // Assign form to groups
- /forms/[id]/responses               // View form responses

// Form model:
{
  name: String,
  description: String,
  templateId: ObjectId,
  complianceProgram: ObjectId,
  documentType: String,
  createdBy: ObjectId,
  assignedGroups: [ObjectId],
  dueDate: Date,
  status: String,                     // draft, assigned, completed, overdue
  responses: [{
    userId: ObjectId,
    groupId: ObjectId,
    submittedAt: Date,
    data: Map,                        // Field responses
    status: String                    // completed, partial, reviewed
  }]
}
```

### **4. Rich Text Editor Integration**

**Estimated Time: 3-4 days**

#### **A. ProseMirror Setup**

```javascript
// Components to create:
- /components/editor/TemplateEditor    // For creating templates
- /components/editor/FormBuilder       // For building forms
- /components/editor/DocumentViewer    // For viewing completed docs

// Features needed:
- Rich text editing with formatting
- Form field insertion and editing
- Template variable support
- Export to DOCX functionality
```

---

## 📋 **PHASE 3: COMPLIANCE WORKFLOWS** (Priority: Medium-High)

### **5. Form Assignment & Completion**

**Estimated Time: 3-4 days**

#### **A. Assignment System**

```javascript
// Workflow implementation:
1. Group Leader creates form from template
2. Assigns to specific groups with due date
3. Employees in groups receive notifications
4. Employees complete forms within deadline
5. Completed forms auto-generate final document
6. Documents stored with audit trail
```

#### **B. Notification System**

```javascript
// Notification types:
- Form assigned to your group
- Form completion deadline approaching
- Form overdue
- Document requires approval
- Compliance audit due

// Implementation:
- Real-time notifications (Socket.io or Server-Sent Events)
- Email notifications for important events
- In-app notification center
```

### **6. Compliance Reporting**

**Estimated Time: 2-3 days**

#### **A. Dashboard Enhancements**

```javascript
// Compliance-specific metrics:
- Forms completion rates by group
- Overdue compliance items
- Upcoming audit deadlines
- Document expiration alerts
- Training completion status
```

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **Week 1 (Days 1-5):**

1. **Day 1-2**: Create compliance program management interface
2. **Day 3-4**: Implement enhanced role system with proper permissions
3. **Day 5**: Create basic template creation interface

### **Week 2 (Days 6-10):**

1. **Day 6-7**: Build form generation from templates
2. **Day 8-9**: Implement form assignment to groups
3. **Day 10**: Create employee form completion interface

### **Week 3 (Days 11-15):**

1. **Day 11-13**: Integrate ProseMirror rich text editor
2. **Day 14-15**: Implement DOCX generation from completed forms

### **Success Metrics for Phase 1:**

- [ ] System Admin can create compliance programs (ISO 9001, HIPAA, etc.)
- [ ] All 5 user roles work with correct permissions
- [ ] Group Leaders can create forms from templates
- [ ] Group Leaders can assign forms to their groups
- [ ] Employees can complete assigned forms
- [ ] Completed forms generate final documents automatically

---

## 🚨 **CRITICAL DEPENDENCIES**

### **Before Starting:**

1. **Environment Setup**: Ensure AWS S3 credentials are working
2. **Database Seeding**: Need sample compliance programs and document types
3. **Role Migration**: Update existing users to new role system
4. **Package Dependencies**: Install ProseMirror and DOCX generation libraries

### **Packages to Install:**

```bash
npm install prosemirror-view prosemirror-state prosemirror-schema-basic
npm install prosemirror-schema-list prosemirror-example-setup
npm install docx html-docx-js mammoth
npm install react-hook-form yup # for advanced form validation
```

---

**🎯 GOAL: Transform from 45% generic document management to 85% compliance-focused DMS in 3 weeks**
