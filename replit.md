# LegalAdvisor AI

## Overview

LegalAdvisor AI is a React-based web application that provides AI-powered legal assistance specializing in Indian law. The system combines a modern frontend built with React and shadcn/ui components with an Express.js backend that integrates Google's Gemini AI for generating legal advice. The application features a chat interface for legal consultations, document upload and analysis capabilities, multilingual support, and voice input functionality. It also provides quick access to various Indian government portals for legal services and complaint filing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using modern React with TypeScript, utilizing a component-based architecture:

- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with custom query client
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

The application follows a clean component structure with separation of concerns:
- UI components in `/client/src/components/ui/` 
- Feature components in `/client/src/components/`
- Pages in `/client/src/pages/`
- Hooks for reusable logic in `/client/src/hooks/`
- Utility functions in `/client/src/lib/`

### Backend Architecture

The backend is built with Express.js using a modular architecture:

- **Framework**: Express.js with TypeScript and ESM modules
- **Development**: Hot reload with tsx for development workflow
- **Routing**: Centralized route registration in `/server/routes.ts`
- **Data Storage**: Abstracted storage interface with in-memory implementation for development
- **File Handling**: Multer for multipart file uploads with size and type restrictions
- **AI Integration**: Google Gemini AI service for legal advice generation and document analysis

The backend uses a clean separation with:
- Route handlers in `/server/routes.ts`
- Storage abstraction in `/server/storage.ts`
- AI services in `/server/services/gemini.ts`
- Development utilities in `/server/vite.ts`

### Database Schema

The application uses Drizzle ORM with PostgreSQL for data persistence:

- **Users**: Basic user authentication with username/password
- **Chat Sessions**: Conversation containers with optional user association
- **Chat Messages**: Individual messages with role-based content (user/assistant)
- **Uploaded Files**: File metadata for document analysis

The schema is designed for scalability with UUID primary keys and timestamp tracking. Drizzle is configured for PostgreSQL with Neon Database serverless support.

### AI Integration Architecture

The system integrates Google's Gemini AI for legal assistance:

- **Legal Advice Generation**: System prompts configure the AI to provide general legal information about Indian law
- **Document Analysis**: Handles multiple file types (PDF, images, Word documents) with appropriate analysis
- **Safety Guardrails**: Built-in disclaimers and limitations to ensure users understand the AI provides general information, not legal advice

### Multilingual Support

The application supports multiple Indian languages:
- English, Hindi, Bengali, Telugu, Tamil, and Marathi
- Voice recognition configured for regional language codes
- Speech synthesis for accessibility

### File Upload System

Secure file handling with:
- 10MB file size limit
- Type restrictions to legal document formats
- Temporary file storage with cleanup
- Integration with AI analysis pipeline

### Development and Build Architecture

The project uses a monorepo structure with shared TypeScript configuration:
- **Build System**: Vite for frontend, esbuild for backend production builds
- **Development**: Concurrent development with Vite dev server and tsx hot reload
- **Type Safety**: Shared types between frontend and backend via `/shared/` directory
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### Authentication Strategy

Currently implements basic session-based authentication preparation:
- User model with username/password structure
- Storage abstraction ready for session management
- Frontend components prepared for authenticated states

### API Design

RESTful API design with:
- `/api/chat/` endpoints for conversation management
- `/api/upload` for file handling
- JSON request/response format
- Error handling middleware with consistent error responses
- Request logging for debugging and monitoring

The system prioritizes user experience with responsive design, accessibility features, and performance optimizations through code splitting and lazy loading patterns.