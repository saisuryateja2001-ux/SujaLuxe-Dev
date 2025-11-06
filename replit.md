# SujaLuxe - Luxury Interior Marketplace

## Overview

SujaLuxe is a dual-interface luxury interior marketplace platform designed to connect retailers with customers. It offers a sophisticated e-commerce experience enhanced by AI-powered room design visualization, real-time negotiation capabilities, and a comprehensive product catalog system. The platform aims to provide a premium user experience with a focus on luxury aesthetics and advanced functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, utilizing **Vite** for fast development and optimized builds. **Wouter** handles client-side routing. UI components are developed using **shadcn/ui** (based on Radix UI) and styled with **Tailwind CSS**, adhering to a custom design system. The design features a dual personality: efficiency-focused for retailers and aspirational luxury for customers, using Playfair Display and Inter fonts, with a purple crown branding motif. **TanStack Query (React Query)** manages server state, while **React Hook Form** with **Zod** handles form state and validation.

Both retailer and customer portals feature comprehensive **sidebar navigation** for easy access to all modules. The customer sidebar is organized into logical sections: Shopping (Dashboard, Browse Products, AI Room Designer, Shopping Cart, Wishlist), Transactions (My Orders, Negotiations, Auctions), Engagement (Reviews, Campaigns), and Account (Profile, Support).

### Backend Architecture

The backend is powered by **Express.js** on **Node.js** with **TypeScript**, providing RESTful API endpoints. A **WebSocket** server (`ws` library) is integrated for real-time communication features like live auction updates and notifications. API design follows RESTful principles with shared schema definitions and **Zod** validation derived from Drizzle ORM models.

**JWT Authentication** is used throughout the application for secure user sessions. JWT tokens are stored in localStorage on the frontend and sent via Authorization headers in all authenticated requests. This approach ensures compatibility with Replit's webview environment where session cookies don't work due to iframe/cross-origin restrictions.

### Data Storage

**PostgreSQL** is the primary relational database, accessed via **Neon Database** for serverless connectivity. **Drizzle ORM** is used for type-safe queries and migrations, with `drizzle-zod` for automatic validation schema generation. Core data models include: User Management (Retailers, Customers), Product Catalog, Commerce (Orders, OrderItems), Auctions, Reviews, Campaigns, Communication (Notifications, Negotiations), AI Features (RoomDesign), and Shopping (CartItems). A storage abstraction (`IStorage`) supports future backend changes, and UUIDs are used for primary keys.

### AI Room Designer

The AI Room Designer uses **Replit AI Integrations** for image generation, which provides OpenAI-compatible API access without requiring a personal API key. The service uses the `gpt-image-1` model to generate high-quality room visualizations based on selected products and room settings. Generated images are returned as base64-encoded data URIs and stored directly in the database. Charges are billed to Replit credits.

### Build & Deployment

Development uses a Vite dev server integrated with the Express backend, while production builds leverage Vite for frontend assets and ESBuild for the backend. The system supports environment configuration via `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, and `NODE_ENV`.

## Recent Changes

### AI Room Designer with Replit AI Integrations (November 2025)
- Switched from personal OpenAI API key to Replit AI Integrations
- Uses gpt-image-1 model for room design generation
- Images stored as base64 data URIs (no external hosting needed)
- Supports multiple product selection in single design
- Charges billed to Replit credits (no separate OpenAI billing)
- Fully functional end-to-end testing confirmed

### Collapsible Sidebar with Hover Trigger (November 2025)
- Implemented auto-hiding sidebar that starts collapsed by default
- Added floating trigger button on left edge (appears on hover)
- Sidebar uses "offcanvas" mode - overlays content when open
- Dashboard and all pages now have full width when sidebar is closed
- Smooth slide-in/out animations for better UX
- Trigger button positioned at 50% height on left edge with subtle hover effect

### Customer Sidebar Navigation (November 2025)
- Implemented comprehensive left sidebar navigation for customer portal
- Created new customer pages: Wishlist, Auctions, Reviews, Campaigns, Support
- Organized navigation into logical sections: Shopping, Transactions, Engagement, Account
- Added logout functionality with JWT token cleanup
- Updated CustomerLayout to use Shadcn Sidebar component
- All customer routes now accessible via sidebar navigation

### JWT Authentication System
- Replaced session-based authentication with JWT tokens
- Implemented token generation and verification utilities
- Updated all authentication endpoints to return JWT tokens
- Frontend automatically includes Authorization headers in all requests
- Fixed queryKey format to ensure proper API calls and cache invalidation

## External Dependencies

- **Replit AI Integrations**: Provides OpenAI-compatible API access for AI-powered room design generation using the gpt-image-1 model. No personal API key required.
- **PostgreSQL**: Primary database for all application data.
- **Neon Database (@neondatabase/serverless)**: Provides serverless PostgreSQL connectivity.
- **jsonwebtoken**: For JWT-based authentication and session management.
- **Google Fonts**: For loading Playfair Display and Inter fonts.