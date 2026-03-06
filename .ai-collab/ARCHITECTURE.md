# TBR Studio Architecture

Last synced: 2026-03-06 18:05:58 IST

## Scope

- This `.ai-collab` set tracks `tbr-studio/`.
- The workspace also contains `CMOv2/`, but it is a separate repo and should not be mixed into `tbr-studio` operational assumptions.
- The workspace also contains `tbr-analytics-hub/`, which is the TBR data analysis hub and should not be conflated with `tbr-studio/`.
- There are three agents working in the overall workspace, so path-level clarity matters.

## Stack Facts

- App runtime: Next.js `16.1.6` with React `19.2.4` in `tbr-studio/package.json`
- Data layer: Prisma `5.22.0` with SQLite at `tbr-studio/prisma/dev.db`
- MCP server: `tbr-studio/mcp/tbr-studio-mcp` using `@modelcontextprotocol/sdk` `1.12.1`
- Video renderer: Remotion `4.0.0` in `tbr-studio/remotion/package.json`
- Skill docs currently present in repo: `skills/tbr-director`, `skills/tbr-post-creator`, `skills/tbr-video-producer`, `skills/tbr-code-review`
- Review artifacts directory: `tbr-studio/reviews/`

## Runtime Topology

- Primary operator surface is terminal/VS Code chat. This is the intended control plane per the user's stated workflow.
- The dashboard pages in `src/app/(studio)/...` are the visual overlay for current state:
  - `/storyboard/[id]`
  - `/posts/[id]`
  - `/videos/[id]`
- MCP tools create and update records for:
  - storyboards
  - posts
  - video projects
  - feedback reads
  - human requests
  - publishing

## Current Execution Flow

- Storyboard, post, and video entities are written into SQLite through the MCP server and CLI helpers.
- The dashboard reads those entities directly and renders status/detail pages.
- `tbr_remotion_render` writes a Remotion composition spec and returns a shell command; it does not complete the render itself.
- `tbr_request_from_human` writes JSON files under `assets/requests` and returns a chat-facing message.
- `tbr_postiz_publish` shells out to Postiz and can publish or schedule directly.

## Current Gaps Relevant To Other Agents

- There is no first-class approval object or approval API in `tbr-studio`.
- There is no app API layer under `tbr-studio/src/app/api` for requests, approvals, or workflow resumption.
- Dashboard detail pages are currently inspection surfaces, not confirmed approval-action surfaces.
- The MCP layer does not currently return dashboard review URLs even though stable detail routes exist.
- Status fields are plain strings and are not guarded by a state machine.
- `engineering` and `Napkin` are not available session skills and are not in the curated install list checked during this turn.

## Review Coordination Conventions

- Review notes should be written under `reviews/`.
- The current repo-local review skill is `skills/tbr-code-review/SKILL.md`.
- Review work is expected to stay findings-first and to update `.ai-collab/` after meaningful audits.

## Required Operating Model From User

- Planning, execution, and workflow loops happen in terminal/chat.
- The dashboard is a secondary visibility surface plus approval surface.
- When human input is needed, the runtime should ask in chat and provide a clickable route for direct review.
- Human approvals should be possible either in chat or through the dashboard, with shared state so other agents know what happened and where.
- Critical actions should require explicit human approval before continuing.
- All agents should explicitly distinguish the content studio (`tbr-studio/`) from the data analysis hub (`tbr-analytics-hub/`) when documenting or executing work.
