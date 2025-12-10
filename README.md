# Recruitment Management System

A comprehensive web application for managing the entire recruitment process, from job posting to candidate onboarding.

## Description

This system streamlines recruitment workflows with role-based access control for administrators, recruiters, reviewers, interviewers, HR personnel, and candidates. It supports job creation, candidate management, interview scheduling, feedback collection, and reporting.

## Features

- **Multi-Role Support**: Admin, Recruiter, Reviewer, Interviewer, HR, Candidate, Viewer
- **Job Management**: Create and manage job openings with skill requirements
- **Candidate Pipeline**: Upload, screen, and track candidates through the hiring process
- **Interview Management**: Schedule interviews, collect feedback, and manage panels
- **Document Handling**: Upload and manage CVs and verification documents
- **Reporting & Analytics**: Dashboards for hiring metrics and performance tracking
- **Self-Service Portal**: Candidates can apply, track status, and manage profiles

## Tech Stack

### Backend
- ASP.NET Core API
- C#

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios 

## Installation & Setup

### Prerequisites
- .NET 6+ SDK
- Node.js 16+
- SQL Server or compatible database

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend/RecruitmentSystem.Api
   ```
2. Restore dependencies:
   ```
   dotnet restore
   ```
3. Update connection string in `appsettings.json`
4. Run database migrations:
   ```
   dotnet ef database update
   ```
5. Start the API:
   ```
   dotnet run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend/recruitment
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```


## Project Structure

```
Recruitment_management/
├── backend/                 # ASP.NET Core API
│   └── RecruitmentSystem.Api/
│       ├── Controllers/     # API endpoints
│       ├── Models/          # Data models
│       ├── Services/        # Business logic
│       ├── Repositories/    # Data access
│       └── Data/            # Database context
├── frontend/                # React application
│   └── recruitment/
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Page components
│       │   └── auth/        # Authentication context
│       └── public/          # Static assets
└── docs/                    # Documentation files
```
