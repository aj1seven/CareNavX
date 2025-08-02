# CareNav-X Hospital Patient Onboarding System

## Overview

CareNav-X is a comprehensive hospital patient onboarding system designed to streamline the patient intake process. The application features a modern dashboard for tracking patient statistics, a multi-step onboarding form with emergency mode support, and intelligent document analysis using OpenAI's vision capabilities. The system handles both regular and emergency patient admissions while providing real-time activity tracking and hospital navigation features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript in a single-page application (SPA) architecture
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Pattern**: RESTful API design with proper HTTP status codes and error handling
- **File Uploads**: Multer middleware for handling document uploads with size limits
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: Normalized tables for patients, documents, activities, and users with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Connection Pool**: Neon serverless connection pooling for optimal database performance

### Authentication & Authorization
- **Session-based Authentication**: Express sessions stored in PostgreSQL
- **User Management**: Staff user system with role-based access (prepared for future expansion)
- **Security**: CORS configuration and secure session handling

### External Dependencies

#### AI and Document Processing
- **OpenAI API**: GPT-4o model for document analysis and patient data extraction from uploaded images
- **Document Analysis**: Vision-based text extraction from insurance cards, medical documents, and forms
- **Smart Data Extraction**: Automated parsing of patient information including personal details, insurance data, and medical history

#### Development and Deployment
- **Replit Integration**: Cartographer plugin for development environment mapping and runtime error overlays
- **Build System**: ESBuild for server-side bundling and Vite for client-side optimization
- **Environment Management**: Environment variable configuration for database and API credentials

#### UI and User Experience
- **Component Library**: Extensive Radix UI component set including dialogs, forms, navigation, and data display components
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation
- **Class Management**: clsx and tailwind-merge for conditional styling
- **Mobile Responsiveness**: Custom mobile detection hooks and responsive design patterns

#### File and Asset Management
- **File Upload Processing**: Local file system storage with configurable upload directories
- **Asset Resolution**: Custom Vite aliases for asset management and import optimization
- **Static File Serving**: Express static file serving for uploaded documents and assets