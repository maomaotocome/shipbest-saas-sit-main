# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Development server runs on port 47890:
```bash
pnpm dev
```

Build and deployment:
```bash
pnpm build        # Includes prisma generate step
pnpm start        # Production server
```

Code quality:
```bash
pnpm lint         # Run ESLint checks
pnpm lint:fix     # Auto-fix linting issues
```

Database operations:
```bash
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:push      # Push schema changes to database
```

Data seeding scripts:
```bash
pnpm seed:payment-providers
pnpm seed:blog
pnpm seed:billing-plans
pnpm seed:billing-history
pnpm seed:users
pnpm seed:notifications
pnpm seed:credits
```

Development tools:
```bash
pnpm docker:up     # Start Docker containers
pnpm ngrok:start   # Expose local server via ngrok
```

## Architecture Overview

**Tech Stack**: Next.js 15 + TypeScript + Prisma + NextAuth.js + Tailwind CSS + React Query

**Key Architectural Patterns**:

### Database Layer (`src/db/`)
- **Prisma ORM** with modular schema files in `prisma/schema/`
- **Generated client** at `src/db/generated/prisma/`
- **Database helpers** organized by domain (auth, billing, blog, etc.)
- **Transaction utilities** in `src/lib/prisma.ts` with `withTransaction()` helper

### Authentication (`src/lib/auth/`)
- **NextAuth.js 5.0** with custom Prisma adapter
- **Multiple providers**: Google OAuth, Google One Tap, email (Resend/Nodemailer)
- **JWT strategy** with 30-day sessions
- **Role-based access** with User role field

### API Structure (`src/app/api/`)
- **Next.js App Router** API routes
- **Domain-specific endpoints**: `/ai`, `/billing`, `/oss`, `/playground`
- **Server Actions** in `src/actions/` for data mutations

### Frontend Architecture
- **App Router** with internationalization support
- **Component structure**:
  - `src/components/ui/` - Radix UI-based components
  - `src/components/common/` - Shared application components
  - `src/components/pages/` - Page-specific components
  - `src/components/sections/` - Feature sections
- **Layout system** with multiple layout types (admin, AI, user, workspace)

### Business Logic (`src/services/`)
- **Service layer** handling complex business operations
- **Task management** system for AI operations
- **Billing integration** with Stripe
- **File upload** via OSS (Object Storage Service)

### Internationalization
- **next-intl** with comprehensive message system in `src/i18n/messages/`
- **Supported locales**: en, zh, zh-hk, fr, de, it, pt, ru, ja, ko, es (12 languages total)
- **Route-based locale switching** with automatic locale detection disabled
- **Namespace-based organization**: 60+ message namespaces covering all domains
  - Core namespaces: components, header, footer, home, about, pricing, blog
  - AI tool namespaces: ai/video, ai/image, ai/explore 
  - User area namespaces: user/dashboard, user/billing, user/profile
  - Admin area namespaces: admin/dashboard, admin/billing, admin/users
  - Playground namespaces: playground/main, playground/chat
- **Deep merge system**: Automatically merges multiple JSON message files per locale
- **Custom date/time formatting**: Configurable formats for different locales
- **Fallback system**: Automatic fallback to default locale for missing translations

### State Management
- **React Query** for server state
- **React Context** for global state
- **Form handling** with react-hook-form + Zod validation

## Key Domain Models

**Billing System**: Multi-tier subscription model with credits, plans, purchases, and invoices
**Task System**: Async AI task processing with status tracking
**User Management**: Role-based access with billing integration
**Content Management**: Blog system with MDX support and categorization
**File Management**: OSS integration with S3-compatible storage

## Core System Implementations

### **Configuration System (`src/conifg/aigc/`)**

A sophisticated AI model and template configuration system with strong type safety:

#### **AI Provider Management**
- **Supported Providers**: FAL (Flux AI Labs), KIE-AI, OpenAI, Google (Imagen4), Replicate
- **Provider-Agnostic Design**: Unified interface across all AI providers
- **Company Integration**: Provider metadata with logos, ordering, and branding

#### **Model Configuration Architecture**
```
conifg/aigc/
├── types.ts                    # Core type definitions and interfaces
├── utils.ts                    # Configuration utility functions
├── companys.ts                 # Provider company definitions
├── model-direct-invocation/    # Direct model invocation configs
│   ├── text-to-image/         # Text-to-image model configurations
│   ├── image-to-image/        # Image-to-image model configurations
│   ├── text-to-video/         # Text-to-video model configurations
│   ├── image-to-video/        # Image-to-video model configurations
│   └── text-to-music/         # Text-to-music model configurations
└── template/                   # Template system configurations
    ├── stylized/              # Anime/style transfer templates
    └── image/                 # Image manipulation templates
```

#### **Key Features**
- **Multi-language Parameter Labels**: 12+ languages for all model parameters
- **Dynamic Credit Calculation**: Provider and parameter-specific pricing
- **Type-Safe Configuration**: Strong TypeScript interfaces for all models
- **Parameter Validation**: Comprehensive validation with min/max constraints
- **Template System**: Predefined workflows for common AI tasks

#### **Model Categories Supported**
- **Text-to-Image**: Flux Dev/Pro/Ultra, Imagen4, GPT-4o
- **Image-to-Image**: Style transfer, upscaling, modifications
- **Text-to-Video**: Kling Video, Veo3, Hailuo02Pro
- **Image-to-Video**: Video generation from static images
- **Text-to-Music**: Suno music generation models

### **Task Processing System (`src/services/tasks/`)**

Enterprise-grade AI task orchestration with comprehensive lifecycle management:

#### **Task Lifecycle Architecture**
```
services/tasks/
├── create.ts                  # Task creation and orchestration
├── run.ts                     # Task execution engine
├── recall.ts                  # Task result recall system
├── aigc/                      # AI provider integrations
│   ├── providers/
│   │   ├── fal/              # FAL provider implementation
│   │   ├── kie_ai/           # KIE-AI provider implementation
│   │   └── openai-next/      # OpenAI provider implementation
│   └── utils/                # Result processing utilities
│       ├── images/           # Image post-processing
│       └── videos/           # Video post-processing
├── credit/                   # Credit management system
│   ├── calculate.ts          # Dynamic credit calculation
│   └── refund.ts             # Automatic refund processing
└── utils/                    # Task utilities and status management
```

#### **Core Features**

**1. Credit Management System**
- **Pre-calculation**: Credits calculated before task execution
- **Reservation System**: Credit reversal with automatic confirmation/cancellation
- **Dynamic Pricing**: Model and parameter-specific credit calculations
- **Automatic Refunds**: Proportional refunds for failed/cancelled tasks
- **Audit Trail**: Complete transaction tracking for all credit operations

**2. Multi-Provider Integration**
- **FAL Provider**: Webhook-based async processing with signature verification
- **KIE-AI Provider**: Specialized handling for video and music generation
- **OpenAI Provider**: Direct API integration for synchronous processing
- **Provider Abstraction**: Unified interface allowing easy addition of new providers

**3. Task Status Management**
- **Status Hierarchy**: `PENDING` → `PROCESSING` → `COMPLETED`/`FAILED`/`PARTIALLY_COMPLETED`
- **Real-time Updates**: Automatic status updates based on subtask completion
- **Webhook Processing**: Secure webhook handling with signature verification
- **Recall System**: Ability to retrieve results from pending/processing tasks

**4. Result Processing Pipeline**
- **Image Processing**: Automatic compression, format conversion, metadata extraction
- **Video Processing**: Multi-resolution support (480p-4K), streaming URL generation
- **Storage Integration**: Automatic upload to OSS with original and compressed versions
- **Media Optimization**: Bandwidth-optimized delivery for different devices

**5. Workflow Orchestration**
- **Sub-task Management**: Parallel and sequential task execution support
- **Template Processing**: Server-side prompt combination and system integration
- **Error Handling**: Comprehensive error recovery with automatic credit protection
- **Queue Management**: Efficient task distribution across providers

#### **Integration Points**
- **Explore System**: Automatic conversion of completed tasks to public gallery items
- **Billing System**: Real-time credit deduction and usage tracking
- **Notification System**: Task completion and status update notifications
- **OSS Storage**: Automated media storage and CDN distribution

## Development Notes

- **Port Configuration**: Development server uses port 47890
- **Package Manager**: Uses pnpm with specific build dependencies configuration
- **ESLint**: Ignores generated Prisma files and scripts
- **Database**: Prisma with modular schema organization
- **Image Handling**: Multiple remote patterns configured for external image sources
- **MDX Support**: Configured for content pages and documentation

## Detailed Engineering Architecture

### **Core Architectural Layers**

This project follows a **domain-driven design (DDD)** pattern with clear separation of concerns:

### **1. Presentation Layer**
```
src/components/
├── ui/                    # Radix-based design system components
├── common/               # Shared application components
│   ├── auth/            # Authentication UI components
│   ├── billing/         # Billing interface components
│   ├── uploader/        # File upload system components
│   └── workspace/       # Workspace interface components
├── layout/              # Layout components (admin/user/ai/workspace)
├── pages/               # Page-specific components
│   ├── admin/          # Admin dashboard components
│   ├── user/           # User dashboard components
│   ├── ai/             # AI tool interfaces
│   └── playground/     # Code playground components
├── sections/            # Marketing and content sections
├── toolpanel/          # AI tool interfaces and parameter controls
└── providers/          # React context providers
```

### **2. Business Logic Layer**
```
src/services/
├── billing/            # Payment processing and subscription management
│   ├── credits/       # Credit system operations
│   ├── payment/       # Stripe payment processing
│   └── utils/         # Billing utilities
├── tasks/             # AI task execution system
│   ├── aigc/          # AI-generated content providers (FAL, KIE-AI, OpenAI)
│   ├── credit/        # Task credit calculations
│   └── utils/         # Task processing utilities
├── oss/               # Object storage service (S3-compatible)
├── playground/        # Code playground services
├── notifications/     # Notification system
├── explore/           # Content exploration features
└── users/             # User management services
```

### **3. Data Access Layer**
```
src/db/
├── generated/prisma/   # Auto-generated Prisma client
├── auth/              # Authentication data operations
├── billing/           # Billing and subscription data access
├── blog/              # Content management data operations
├── explore/           # Content exploration data access
├── oss/               # File storage data operations
└── playground/        # Playground data operations
```

### **4. Server Actions & API Layer**
```
src/actions/           # Next.js 15 Server Actions
├── admin/             # Admin-only server actions
├── user/              # User-facing server actions
├── billing/           # Billing operations
├── tasks/             # Task management actions
├── oss/               # File operations
└── staticData/        # Static data retrieval

src/app/api/           # API Route Handlers
├── ai/webhook/        # AI provider webhooks
├── billing/payment/   # Payment provider webhooks
├── oss/object/        # Object storage endpoints
└── playground/        # Playground API endpoints
```

### **5. App Router Structure**
```
src/app/
├── (front)/           # Public-facing routes
│   ├── (nolocale)/   # Non-localized routes
│   └── [locale]/     # Internationalized routes (12 languages)
│       ├── (default)/     # Default layout group
│       │   ├── (ai)/     # AI tool routes
│       │   └── blog/     # Blog and content routes
│       └── (workspace)/  # Authenticated workspace
│           ├── admin/    # Admin dashboard
│           ├── user/     # User dashboard
│           ├── playground/ # Code playground
│           └── studio/   # AI content studio
```

### **Key Architectural Patterns**

#### **Multi-Tenant Architecture**
- **Role-Based Access**: Admin, User, Public interfaces with granular permissions
- **Workspace Isolation**: Separate contexts for different user types
- **Layout Composition**: Multiple layout types for different user contexts

#### **Provider Pattern Implementation**
- **AI Providers**: Unified interface for FAL, KIE-AI, OpenAI integrations
- **Payment Providers**: Stripe integration with comprehensive webhook handling
- **Storage Providers**: S3-compatible object storage abstraction

#### **Event-Driven Architecture**
- **Webhook Processing**: Extensive webhook handling for AI and payment providers
- **Task Queue System**: Asynchronous AI task processing with status tracking
- **Credit System**: Real-time usage tracking and billing

#### **Domain-Driven Organization**
- **Billing Domain**: Complete subscription, credit, and payment system
- **AI/ML Domain**: Task processing, model management, and content generation
- **Content Domain**: Blog system with categories, tags, and SEO optimization
- **User Domain**: Authentication, profiles, and role management

## File Organization Patterns

- **Database operations**: `src/db/{domain}/` with specific operation files
- **API controllers**: `src/controller/{domain}/` for webhook and external integrations  
- **Types**: `src/types/{domain}/` for TypeScript type definitions organized by business domain
- **Static data**: `src/staticData/` for configuration and content data
- **Configuration**: `src/conifg/aigc/` for AI model and template configurations
- **Hooks**: `src/hooks/` for reusable React hooks
- **Internationalization**: `src/i18n/` with sophisticated multi-language system
  - `messages/{locale}/{namespace}.json` - Domain-specific translation files
  - `locales.ts` - Supported language configuration  
  - `request.ts` - Core i18n request configuration with namespace management
  - `routing.ts` - Locale-aware routing configuration