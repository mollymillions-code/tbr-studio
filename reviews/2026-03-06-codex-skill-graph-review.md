# Codex Review: Skill Graph Structure

Date: 2026-03-06
Reviewer: Codex
Scope: `tbr-studio` skill graph, MCP workflow edges, dashboard linkage

## Summary

The top-level skill split is directionally good:

- `tbr-director` as orchestrator
- `tbr-post-creator` and `tbr-video-producer` as executors
- MCP tools as the runtime surface beneath them

The main weakness is graph integrity. Several important edges are described in docs but are incomplete or manual in code.

## Findings

### Critical

1. Render is documented like an automatic workflow edge, but the current implementation stops after writing a Remotion spec and returning a shell command.
2. Human request and approval flow is not a real stateful workflow. Requests are logged to disk, but there is no shared approval object or resume path.

### High

1. Feedback can be read, but there is no complete loop for resolving it and marking work as actioned through the runtime.
2. AI video generation is described in the skill graph, but only AI image generation is actually exposed as a concrete tool.
3. The graph depends on prose more than enforced transitions. Status fields are free-form strings rather than guarded state transitions.

### Medium

1. The dashboard has stable detail pages for storyboards, posts, and videos, but the MCP layer does not return those review URLs to the terminal flow.
2. There is naming drift in docs and UI, which weakens trust in the graph as a single source of truth.

## Review Conclusion

This is a good architecture direction with incomplete workflow closure.

The repo already has the right node types. What it still needs is a stricter control layer between:

- terminal execution
- approval checkpoints
- dashboard review links
- resumable state after human action

## Recommended Follow-Up

1. Add a first-class approval/request model shared by terminal and dashboard.
2. Return review URLs from create/review MCP calls.
3. Enforce publish/finalization gates in code, not only in instructions.
4. Make manual workflow edges explicit where automation is not yet implemented.
