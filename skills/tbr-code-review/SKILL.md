# TBR Code Review

Review architecture, workflow wiring, MCP integration, and code changes for TBR Studio.

## When to Activate

Activate this skill when:

- The user asks for a review, audit, critique, or assessment
- The task is to inspect workflow structure, skill graph design, or system wiring
- The task is to review MCP tools, dashboard linkage, approval flow, or status handling
- Another agent needs a written review artifact in `/reviews/`

## Review Standard

This is a findings-first review skill.

- Start with concrete findings ordered by severity
- Prioritize bugs, dead ends, approval gaps, workflow regressions, and missing state transitions
- Cite exact files and lines when possible
- Keep summaries brief and secondary
- If there are no findings, say so explicitly and mention residual risks or testing gaps

## TBR-Specific Review Priorities

Check these before anything else:

1. Terminal/chat remains the control plane
2. Dashboard remains the visibility and approval plane
3. Human-in-the-loop steps are explicit and resumable
4. Critical publish/finalize actions require approval
5. Storyboard, post, and video routes are linkable from terminal outputs
6. MCP tool behavior matches the skill and runtime docs
7. Manual edges are clearly identified when automation is incomplete

## Required Review Artifact

For meaningful reviews, write a markdown note under `/reviews/` using this pattern:

`YYYY-MM-DD-<agent>-<topic>-review.md`

Each review note should include:

- date
- reviewer
- scope
- summary
- findings
- review conclusion
- recommended follow-up

## Current Review References

Use these as baseline examples for TBR Studio review expectations:

- `/reviews/2026-03-06-codex-skill-graph-review.md`
- `/reviews/2026-03-06-codex-terminal-first-workflow-review.md`

## Coordination

After a meaningful review, update `.ai-collab/` so other agents inherit:

- what was reviewed
- what was found
- what operating assumptions were clarified
- what follow-up work is now expected
