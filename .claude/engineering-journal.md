# Engineering Journal — TBR Studio

Technical decisions, build notes, and architecture evolution. Read every session. Write as you work.

## Active Architecture

- Next.js 16 + React 19 + Tailwind CSS 4
- Prisma 5 + SQLite (local dev) / Static JSON (Vercel)
- Remotion 4 for video rendering (CompositionSpec JSON -> MP4)
- MCP server with 19 tools for Claude Code
- Knowledge base: filesystem-based markdown intelligence
- Postiz for social publishing

## Build Notes

### 2026-03-06 — Vercel Deployment

- Pages refactored to use `src/lib/api.ts` abstraction layer
- `NEXT_PUBLIC_STATIC_DATA=true` triggers static JSON fallback
- `tsconfig.json` excludes `mcp/` and `scripts/` from build (they import MCP SDK not in root deps)
- Implicit `any` errors from api.ts return types fixed with explicit `: any` annotations in .map() callbacks

### 2026-03-06 — Remotion Pipeline

- Remotion project lives in `/remotion/` (separate package.json, not part of Next.js build)
- `remotion/src/types.ts` defines CompositionSpec contract between MCP tool and renderer
- MCP tool `tbr_remotion_render` generates spec JSON, returns render command
- Render: `cd remotion && npx tsx src/render.ts --spec /path/to/spec.json`
- Dependencies NOT yet installed (`npm install` in `/remotion/` still pending)

### 2026-03-06 — Knowledge Base

- All markdown files in `/knowledge/`
- Timeline is append-only chronological log
- Character files are living documents updated after each content session
- Uploads directory for human to drop files for ingestion

## Technical Debt

- [ ] Remotion dependencies not installed yet
- [ ] Static JSON data files need regeneration when DB changes (no auto-sync)
- [ ] No automated tests for MCP tools
- [ ] No CI/CD pipeline beyond Vercel auto-deploy

## Watch Out For

- tsconfig.json `exclude` array — if new directories with TypeScript are added, they may get picked up by Next.js build and cause errors if they import packages not in root
- Prisma client generation runs in postinstall — Vercel build depends on this
- MCP server runs as a separate process, not part of Next.js — changes to MCP need separate testing
