# Trenova

A modern web application leveraging AI capabilities through OpenRouter.ai, built with Next.js and React.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

### Frontend

- Next.js 15 with Turbopack for fast, efficient page rendering
- React 19 for interactive components
- TypeScript 5 for static typing and improved IDE support
- Tailwind 4 for styling
- Shadcn/ui for accessible React components

### Backend

- Supabase as a comprehensive backend solution:
  - PostgreSQL database
  - Multi-language SDK (Backend-as-a-Service)
  - Open-source solution that can be self-hosted
  - Built-in user authentication

### AI Integration

- OpenRouter.ai for communication with AI models:
  - Access to various models (OpenAI, Anthropic, Google, etc.)
  - Cost-effective solutions with financial limits on API keys

### CI/CD and Hosting

- GitHub Actions for CI/CD pipelines
- DigitalOcean for hosting via Docker images

### Testing Tools

- Unit and Integration Testing:
  - Vitest - Jest-compatible unit testing framework
  - React Testing Library
  - MSW (Mock Service Worker)
- End-to-End Testing:
  - Playwright
  - Playwright Component Testing
- Visual and Performance Testing:
  - axe-core for accessibility testing
  - Percy/Chromatic for visual regression testing
  - Lighthouse CI for performance testing
  - Web Vitals monitoring

## Getting Started

### Prerequisites

- Node.js version 22.14.0 (specified in `.nvmrc`)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <https://github.com/kubaparol/trenova.git>
cd trenova
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Runs the app in development mode with Turbopack
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint to check for code issues

## Project Scope

Trenova is a web application that integrates various AI models through OpenRouter.ai. The project aims to provide a platform that leverages AI capabilities while ensuring efficiency and cost-effectiveness.

The application is built with a modern tech stack, focusing on performance and developer experience with Next.js 15 and React 19.

## Project Status

🚧 **In Development** 🚧

This project is currently in early development (v0.1.0). Features and documentation will be expanded as development progresses.

## License

Not specified.

---

© 2025 Trenova
