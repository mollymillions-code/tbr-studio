# Codex Review: Terminal-First Workflow

Date: 2026-03-06
Reviewer: Codex
Scope: terminal/chat as control plane, dashboard as visibility and approval surface

## User Requirement Captured

The intended operating model is:

- planning happens in terminal/chat
- execution happens in terminal/chat
- human prompts happen in terminal/chat
- dashboard is the visual overlay for awareness and direct approvals
- the runtime should provide clickable review links so the user can approve in chat or in the dashboard

## Current State

The repo matches this model only partially.

- Terminal/chat is already treated as the main execution surface.
- The dashboard is currently better at showing state than driving approval state back into the workflow.
- Critical actions are not consistently protected by enforced approval gates.

## Findings

### Critical

1. There is no shared approval state that records whether approval happened in chat or in the dashboard.
2. Human requests do not currently resume the workflow in a structured way after response.

### High

1. The dashboard detail pages are review surfaces, but not confirmed approval-action surfaces.
2. The terminal flow does not consistently hand back direct review links for the created entity.
3. Publishing can proceed without a hard approval check.

### Medium

1. Feedback status is visible, but the workflow does not clearly close the loop after changes are made.
2. Manual render and manual review steps are present but not always described as manual in the runtime behavior.

## Review Conclusion

The intended control model is sound.

The missing piece is a formal human-in-the-loop contract:

- create checkpoint
- present checkpoint in chat
- expose dashboard link
- accept approval from either channel
- resume with shared state

## Recommended Follow-Up

1. Introduce approval checkpoints before storyboard finalization, final asset selection, render finalization, and publish.
2. Add a shared request/approval record visible to both runtime and dashboard.
3. Make every reviewable entity return a dashboard detail URL in the terminal response.
