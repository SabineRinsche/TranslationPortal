# Alpha's AI Translation Portal

## Overview

Alpha's AI Translation Portal is a comprehensive web application that provides professional translation services powered by AI. The platform allows users to upload files for translation, submit translation requests through both web interface and API, manage translation projects, and track their progress. The application features an intuitive dashboard, real-time notifications, a sophisticated AI assistant, and personalized language preferences to guide users through the translation process.

The system is designed to handle multiple file formats, support 100+ languages (with user-customizable language preferences), and offer different translation workflows including AI-only translation, AI with LQE (Language Quality Evaluation), and AI with human review. Users can manage their accounts, configure language preferences, track credit usage, and monitor translation projects through a modern, responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, utilizing modern React patterns including hooks and context providers. The application follows a component-based architecture with shared UI components built on top of Radix UI primitives and styled with Tailwind CSS.

**Key Frontend Components:**
- Authentication system with role-based access control (admin/client roles)
- File upload and analysis interface with drag-and-drop functionality
- Real-time dashboard with charts and analytics using Recharts
- Interactive chatbot for user assistance
- Language preferences management with searchable interface
- Responsive design with dark/light theme support
- Toast notifications and real-time updates

**State Management:** The application uses Zustand for client-side state management, combined with TanStack Query for server state management and caching.

### Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The backend handles file processing, translation request management, user authentication, and project tracking.

**Key Backend Features:**
- RESTful API with comprehensive endpoint coverage
- File upload and processing capabilities with multer
- Session-based authentication with role-based permissions
- Database abstraction layer with repository pattern
- API versioning support (v1 endpoints)

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes tables for accounts, users, translation requests, and project updates.

**Database Schema:**
- `accounts` - Organization/company information with subscription and credits
- `users` - User profiles with role-based permissions and language preferences
- `translation_requests` - Core translation job data and metadata
- `project_updates` - Activity tracking and status changes
- `user_language_preferences` - User-specific language selections for translation filtering

### Authentication and Authorization
The system implements a session-based authentication mechanism with role-based access control. Users can have either 'admin' or 'client' roles, with admins having additional privileges for system management.

**Security Features:**
- Session management with secure cookies
- Role-based route protection
- API key authentication for programmatic access
- Input validation using Zod schemas

### External Dependencies

**Core Framework Dependencies:**
- React 18+ with TypeScript for frontend development
- Express.js with Node.js for backend API server
- Vite for build tooling and development server

**Database and ORM:**
- PostgreSQL via Neon Database serverless connection
- Drizzle ORM with Drizzle Kit for migrations
- Connection pooling for optimal performance

**UI and Styling:**
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- Recharts for data visualization

**File Processing:**
- Multer for multipart file uploads
- AdmZip for archive file handling
- File system operations for asset management

**External APIs:**
- Anthropic AI SDK for chatbot functionality
- Stripe integration for payment processing
- Font loading via Adobe Fonts (Museo Sans)

**Development and Build Tools:**
- TypeScript for type safety
- ESBuild for server bundling
- PostCSS with Autoprefixer
- Zod for runtime type validation

The architecture is designed to be scalable and maintainable, with clear separation of concerns between frontend and backend, comprehensive error handling, and robust data validation throughout the system.

## Recent Changes (August 12, 2025)

### Multi-Tenant Team Structure Implementation
- **Database Schema Updates**: Successfully restructured the teams table to function as independent client organizations rather than shared account groups
- **Team-Based Credits System**: Each team now has its own credits (default: 5000), subscription plan, and billing information
- **Removed Account Dependencies**: Teams no longer require shared accounts, making each team fully independent
- **AlphaCRCInternal Team Created**: Created internal team with 10,000 credits and enterprise subscription
- **Test User Assignment**: Both test users (jsmith and sjohnson) are now assigned to AlphaCRCInternal team

### Team Management Interface Implementation
- **Comprehensive Team Detail Page**: Three-tab structure (Team Members, Credit Usage, Account Details)
- **Add User Functionality**: Working user creation with proper validation and team assignment
- **Add Credits Functionality**: Fixed foreign key constraints and implemented credit addition with transaction recording
- **User Status Display**: Updated to show email verification status instead of deprecated isActive field
- **Error Resolution**: Fixed all runtime errors, LSP diagnostics, and API request formatting issues

### Working Test Credentials
- **Admin User**: jsmith / password123 (assigned to AlphaCRCInternal)
- **Client User**: sjohnson / password123 (assigned to AlphaCRCInternal)
- **Team**: AlphaCRCInternal (ID: 2) with 10,000 credits and enterprise plan

### Technical Fixes Completed
- **Credit Transaction Schema**: Fixed foreign key constraint violations by ensuring all teams reference valid account IDs
- **API Request Format**: Corrected apiRequest calls to use proper parameter structure (url, method, data)
- **Database Consistency**: All teams now properly reference account ID 2 for credit transaction compatibility
- **User Interface Alignment**: Updated frontend User interface to match actual database schema

The system now operates as a true multi-tenant platform where each team represents an independent client organization with separate billing, credits, and user management. All core functionality for team management, user creation, and credit administration is working correctly.