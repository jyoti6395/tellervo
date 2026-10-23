# Tellervo Monorepo

Monorepo for the Tellervo platform, orchestrating applications and shared packages using **npm Workspaces** and **Turborepo**.

## Directory Structure

```text
tellervo/
├── apps/
│   ├── tellervo-app/             # Customer-facing app (@tellervo/app) -> Port 5173
│   └── tellervo-dashboard/       # Admin & management dashboard (@tellervo/dashboard) -> Port 5174
├── packages/
│   └── functions/                # Shared utility & calculation functions (@tellervo/functions)
├── package.json                  # Root monorepo workspace configuration
├── turbo.json                    # Turborepo task pipeline
└── .gitignore
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development

Run both apps concurrently in dev mode:
```bash
npm run dev
```

Or run an individual app:
```bash
# Run customer app (port 5173)
npm run dev:app

# Run admin dashboard (port 5174)
npm run dev:dashboard
```

### 3. Build

Build all packages and apps with Turbo caching:
```bash
npm run build
```

### 4. Lint

Lint all projects across the workspace:
```bash
npm run lint
```

## Shared Packages

- **`@tellervo/functions`**: Located at `packages/functions/`. Provides shared functions (formatting, calculations, tailwind `cn` helper) consumed by `@tellervo/app` and `@tellervo/dashboard`.
