# Knowledge Book

A production-grade **Personal Knowledge Book** website built with [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).

All documentation content is sourced from a separate GitHub repository (`knowledge-base`), keeping concerns cleanly separated between the presentation layer and the content source.

---

## Tech Stack

| Technology                                                | Version         | Purpose                                |
| --------------------------------------------------------- | --------------- | -------------------------------------- |
| [Next.js](https://nextjs.org/)                            | 16 (App Router) | Framework — SSR, routing, API layer    |
| [React](https://react.dev/)                               | 19              | UI rendering engine                    |
| [Tailwind CSS](https://tailwindcss.com/)                  | 4               | Utility-first CSS (CSS-first config)   |
| [shadcn/ui](https://ui.shadcn.com/)                       | Latest          | Accessible, customizable UI primitives |
| [next-themes](https://github.com/pacocoursey/next-themes) | Latest          | Dark / Light / System theme switching  |
| [Lucide React](https://lucide.dev/)                       | Latest          | Icon library                           |
| [ESLint](https://eslint.org/)                             | 9               | Code linting (flat config)             |
| [Prettier](https://prettier.io/)                          | 3               | Code formatting                        |
| [Husky](https://typicode.github.io/husky/)                | 9               | Git hooks                              |
| [lint-staged](https://github.com/lint-staged/lint-staged) | 17              | Run linters on staged files only       |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.17 (LTS recommended)
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd knowledge-book

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Available Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with hot reload |
| `npm run build`        | Create production build                  |
| `npm start`            | Start production server                  |
| `npm run lint`         | Run ESLint                               |
| `npm run lint:fix`     | Run ESLint with auto-fix                 |
| `npm run format`       | Format all source files with Prettier    |
| `npm run format:check` | Check formatting without writing         |

---

## Architecture

This project follows **feature-based architecture** aligned with **SOLID principles** and **Clean Architecture** patterns — designed for long-term maintainability (10+ years).

### Folder Structure

```
src/
├── app/                     # Next.js App Router (routes & pages)
│   ├── layout.js            # Root layout (ThemeProvider, fonts, metadata)
│   ├── page.js              # Home page
│   ├── not-found.js         # Custom 404 page
│   ├── globals.css          # Tailwind v4 + shadcn/ui design tokens
│   └── (docs)/              # Route group for documentation (future)
│
├── components/              # Shared, reusable UI components
│   ├── ui/                  # shadcn/ui primitives (owned, not imported)
│   ├── layout/              # App shell: Navbar, Sidebar, Footer, PageLayout
│   └── common/              # Generic components: Logo, Icons, etc.
│
├── features/                # Feature modules (self-contained)
│
├── hooks/                   # Custom React hooks
│
├── lib/                     # Pure utility functions
│   ├── utils.js             # cn() class merge helper
│   └── constants.js         # Frozen app-wide constants
│
├── services/                # External API / data-fetching layer
│
├── providers/               # React context providers
│   └── theme-provider.jsx   # next-themes wrapper (client boundary)
│
└── config/                  # Application configuration
    ├── site.js              # Site metadata, nav items, external links
    └── env.js               # Validated environment variable accessors
```

### Why This Structure?

| Directory            | Responsibility                                                                                                      | SOLID Principle                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `app/`               | Routing & page-level concerns **only** — pages are thin shells that compose layout + feature components             | **Single Responsibility**                                                     |
| `components/ui/`     | shadcn/ui primitives — copied into the project (not imported from `node_modules`) so you own and can customize them | **Open/Closed** — extend without modifying the source                         |
| `components/layout/` | Application shell structure (Navbar, Sidebar, Footer) — separated from business logic                               | **Single Responsibility**                                                     |
| `features/`          | Self-contained feature modules — each feature owns its components, hooks, and utils                                 | **SRP + Interface Segregation** — each feature is its own bounded context     |
| `hooks/`             | Reusable stateful logic abstracted from components                                                                  | **Dependency Inversion** — components depend on hook abstractions             |
| `lib/`               | Pure functions with zero side effects or coupling                                                                   | **Single Responsibility**                                                     |
| `services/`          | External I/O boundary (API calls, GitHub content fetching)                                                          | **Dependency Inversion** — invert data dependencies behind service interfaces |
| `providers/`         | React context wrappers that compose without requiring layout changes                                                | **Open/Closed**                                                               |
| `config/`            | Centralized, single source of truth for all settings                                                                | **Single Responsibility**                                                     |

### Key Design Decisions

1. **Pages are thin shells**: Route files in `app/` only compose layout + feature components. They never contain business logic directly.

2. **Feature isolation**: Each future feature (docs, search, auth) lives in `features/` as a self-contained module with its own components, hooks, and services.

3. **Client boundary isolation**: The `ThemeProvider` is the only client component in the layout chain. The root layout remains a server component for optimal SSR performance.

4. **Environment validation**: All `process.env` access is centralized through `config/env.js` with getter-based lazy evaluation. Missing required vars fail fast with clear error messages.

5. **Barrel exports**: Layout components and hooks use barrel exports (`index.js`) for clean imports. Consumers import from the directory, not individual files.

---

## Theme System

The app supports **three theme modes**: Light, Dark, and System (auto-detect OS preference).

- **Implementation**: `next-themes` with `attribute="class"` strategy
- **CSS Variables**: HSL-based design tokens defined in `globals.css`
- **Dark mode**: Tailwind v4 `@custom-variant dark` maps to the `.dark` class
- **No flash**: `suppressHydrationWarning` on `<html>` prevents FOUC

### Adding theme tokens

Edit `src/app/globals.css` — add tokens to both `:root` (light) and `.dark` blocks, then map them in `@theme inline`.

---

## shadcn/ui

Components are installed via the CLI and live in `src/components/ui/`. You own these files — customize them freely.

### Adding new components

```bash
npx shadcn@latest add <component-name>
```

Configuration is in `components.json`:

- Style: `new-york`
- Base color: `zinc`
- CSS variables: `true`
- JavaScript mode: `tsx: false`

---

## Code Quality

### ESLint

ESLint v9 flat config (`eslint.config.mjs`) extends:

- `next/core-web-vitals` — Next.js best practices
- `eslint-config-prettier` — disables formatting rules that conflict with Prettier

Custom rules:

- `no-unused-vars`: warn (ignoring `_` prefixed args)
- `no-console`: warn
- `prefer-const`: error

### Prettier

Config in `.prettierrc`:

- Single quotes, trailing commas, 100-char line width
- Enforced via lint-staged on pre-commit

### Git Hooks (Husky)

- **pre-commit**: Runs `lint-staged` — lints and formats only staged files
- Fast feedback loop: no need to lint the entire codebase on every commit

---

## Environment Variables

| Variable                          | Required | Description                                                       |
| --------------------------------- | -------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | No       | Base URL for the deployed site (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_KNOWLEDGE_BASE_REPO` | No       | GitHub repo slug for content source (e.g., `user/knowledge-base`) |
| `NEXT_PUBLIC_GA_ID`               | No       | Google Analytics 4 measurement ID                                 |

Copy `.env.example` to `.env.local` to configure locally.

---

## Future Roadmap

- [ ] Documentation feature (MDX rendering from `knowledge-base` repo)
- [ ] Full-text search across all docs
- [ ] Table of contents (auto-generated from headings)
- [ ] Breadcrumb navigation
- [ ] Mobile-responsive sidebar (Sheet component)
- [ ] Theme toggle component (dropdown with Light/Dark/System)
- [ ] Analytics integration
- [ ] SEO sitemap generation
- [ ] RSS feed

---

## License

MIT — see [LICENSE](./LICENSE) for details.
