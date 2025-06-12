<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# ComplyRus Frontend - Copilot Instructions

## Project Overview

This is a Next.js frontend application for a compliance document management system called ComplyRus. The project uses:

- **Next.js 15** with App Router and JavaScript (no TypeScript)
- **Tailwind CSS** for styling
- **Shadcn/UI** for modern UI components
- **ProseMirror** for rich text editing
- **JWT Authentication** for user sessions
- **Role-based access control** (site-level, organization-level, team-level)

## Architecture

- **Multi-tenant system** with Organizations → Teams → Folders → Documents hierarchy
- **Backend API** running on Express.js with MongoDB
- **File uploads** to AWS S3 with version control
- **Compliance programs, rules, and standards** management

## Key Entities

- **Users**: Site admins, org owners, team leaders, employees
- **Organizations**: Multi-tenant containers with billing
- **Teams**: Groups within organizations
- **Documents**: Files with version control and compliance associations
- **Templates**: Rich text templates for compliance documentation
- **Compliance Programs**: Contain rules and standards

## Code Style Guidelines

- Use **JavaScript** (not TypeScript) for all components and logic
- Follow **Next.js App Router** conventions (app directory)
- Use **Tailwind CSS** classes for styling
- Implement **Shadcn/UI** components for consistent design
- Use **client components** ("use client") when needed for interactivity
- Follow **React hooks** patterns (useState, useEffect, etc.)

## Authentication & Security

- JWT tokens stored in localStorage/cookies
- Role-based route protection with middleware
- API calls to backend at http://localhost:5000/api/
- Handle 401/403 responses with redirects to login

## File Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and API calls
- `/src/hooks` - Custom React hooks
- `/src/context` - React context providers

## API Integration

- Backend runs on port 5000
- Use fetch() or axios for API calls
- Handle authentication headers
- Implement proper error handling and loading states

## UI/UX Guidelines

- Use Shadcn/UI components (Button, Card, Dialog, etc.)
- Implement responsive design with Tailwind
- Create intuitive navigation for document management
- Support file upload with drag-and-drop
- Rich text editor for templates and documents

When generating code, prioritize:

1. Clean, readable JavaScript code
2. Proper error handling and loading states
3. Responsive, accessible UI components
4. Integration with the existing backend API
5. Role-based access control implementation
