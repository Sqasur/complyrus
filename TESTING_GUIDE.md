# Document Management System Testing Guide

## 🧪 TESTING CHECKLIST

### 1. **Authentication & Setup**

- [ ] Navigate to http://localhost:3000
- [ ] Login with seeded user credentials
- [ ] Verify dashboard loads with user information
- [ ] Check sidebar navigation includes all menu items

### 2. **Organization Management**

- [ ] Navigate to Organizations (/organizations)
- [ ] View organization details
- [ ] Access organization settings
- [ ] Verify user roles and permissions

### 3. **Team Management**

- [ ] Navigate to Teams (/teams)
- [ ] Click on a team to view details
- [ ] Test adding new team members
- [ ] Test changing member roles
- [ ] Test removing team members
- [ ] Navigate to team settings
- [ ] Test updating team information

### 4. **Folder Management**

- [ ] From team details, create a new folder
- [ ] Verify folder appears in team's folder list
- [ ] Click on folder to view folder details (/folders/[id])
- [ ] Test folder editing capabilities

### 5. **Document Management**

- [ ] In folder details page, test document upload
- [ ] Upload different file types (PDF, DOCX, XLSX)
- [ ] Set document privacy settings
- [ ] Verify document appears in folder
- [ ] Test document download functionality
- [ ] Test document deletion

### 6. **Access Control Testing**

- [ ] Test private document access restrictions
- [ ] Verify team member-only access to folders
- [ ] Test role-based permissions (teamLeader vs employee)
- [ ] Test organization admin capabilities

### 7. **UI/UX Testing**

- [ ] Test responsive design on different screen sizes
- [ ] Verify all dialogs and forms work properly
- [ ] Check loading states and error handling
- [ ] Test navigation between pages

## 🔍 KEY TEST SCENARIOS

### Scenario 1: Complete Document Workflow

1. Login as team leader
2. Create new folder in team
3. Upload document to folder
4. Add team member
5. Login as team member
6. Access folder and download document

### Scenario 2: Permission Testing

1. Create private document as user A
2. Login as user B (same team)
3. Verify cannot access private document
4. Login as organization admin
5. Verify can access all documents

### Scenario 3: Team Collaboration

1. Team leader creates folder
2. Team leader uploads public document
3. Team member uploads additional document
4. Both users can access shared folder
5. Only appropriate users can edit/delete

## 📊 EXPECTED RESULTS

### ✅ Working Features:

- User authentication and session persistence
- Organization and team management
- Folder creation and management
- Document upload to S3
- Document download via signed URLs
- Role-based access control
- Responsive UI components
- Error handling and validation

### 🔧 API Endpoints to Test:

```bash
# Team Management
GET    /api/teams/[id]
POST   /api/teams/[id]/members
DELETE /api/teams/[id]/members/[userId]

# Folder Management
GET    /api/teams/[id]/folders
POST   /api/teams/[id]/folders
GET    /api/folders/[id]

# Document Management
GET    /api/folders/[id]/documents
POST   /api/folders/[id]/documents
GET    /api/documents/[id]/download
DELETE /api/documents/[id]
```

## 🚨 TROUBLESHOOTING

### Common Issues:

1. **S3 Upload Fails**: Check AWS credentials in .env.local
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **Authentication Issues**: Clear browser cookies and re-login
4. **File Download Fails**: Check S3 bucket permissions

### Debug Steps:

1. Check browser console for JavaScript errors
2. Check Network tab for API response codes
3. Check server console for backend errors
4. Verify environment variables are set

---

**🎯 SUCCESS CRITERIA**: All checkboxes completed = Production Ready Document Management System
