# Napkin — TBR Studio

Mistakes, corrections, and what works. Read this every session.

## What Works

- Volume-first content strategy: high frequency beats perfection
- Virat imagery as structural hook in all content formats (not just videos)
- Narrative hammering: pick a storyline, reinforce across many pieces
- Nested loop architecture: Mega Cycle > Cycle > Microcycle
- Knowledge base as filesystem (markdown files, not database)
- Dual-mode data access for Vercel deployment (Prisma locally, static JSON on Vercel)

## Mistakes Made

- Initially wrote virat.md as "max 2-3 pieces/season" without distinguishing imagery-as-hook from dedicated content. User corrected: his IMAGE is used frequently, his DIRECT INVOLVEMENT is rare.
- Initially built a flat 15-step loop. User showed nested Mega Cycle / Cycle / Microcycle diagram. Restructured.
- tsconfig.json was picking up mcp/ directory during Next.js build, causing module resolution errors. Fixed by adding to exclude array.
- Autocorrect changed "Remotion" to "re-motivation" in user message. Caused confusion. Always verify unclear terms.
- Vercel env variable NEXT_PUBLIC_STATIC_DATA had a trailing newline ("true\n" !== "true"). Always .trim() env vars before comparison.
- Removed output: "standalone" from next.config.ts but that alone didn't fix dynamic pages. The real issue was the env var newline.
- fs.readFileSync doesn't reliably work on Vercel serverless for project files. Switched to direct JSON imports which get bundled by the compiler.
- Git-triggered Vercel deploys fail intermittently. Manual `vercel --prod` is more reliable.

## Corrections from User

- Virat imagery is a hook technique, not "Virat content". Use frequently in videos, carousels, posts, posters.
- Adi K. Mishra must be highlighted monthly in "Full TBR" team content. He is an equal co-owner, not secondary.
- Both Virat and Adi are co-owners. Content should reflect partnership, not hierarchy.
- Volume comes from a logical standpoint: every piece reinforces a narrative or proves a point.

## Patterns to Remember

- User prefers seeing diagrams and visual architecture (loop diagram was a screenshot)
- User thinks in terms of proven patterns, not theories. Always ask "what has worked?"
- User wants skills preloaded globally across all sessions (terminal + VS Code)
