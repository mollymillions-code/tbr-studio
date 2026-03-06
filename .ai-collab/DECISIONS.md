# TBR Studio Decisions

## 2026-03-06 17:38:23 IST | Collaboration scope

- Context: The workspace contains both `tbr-studio/` and `CMOv2/`, but the current review and workflow clarification target `tbr-studio`.
- Decision: Root the `.ai-collab` handoff set inside `tbr-studio/`.
- Why: Agents need one active source of truth for the system under discussion, without cross-repo drift.

## 2026-03-06 17:38:23 IST | Control plane

- Context: The user clarified that planning, execution, and human-in-the-loop steps should run from terminal/chat, not from the UI.
- Decision: Treat terminal/chat as the workflow control plane and the dashboard as a visibility and approval plane.
- Why: This matches the intended operator model and should guide future workflow, approval, and prompt design.

## 2026-03-06 17:38:23 IST | Approval gates

- Context: The user wants explicit approval before critical steps such as final storyboard lock, final asset selection, and social publishing.
- Decision: Future workflow changes should enforce explicit approval checkpoints before irreversible or externally visible actions.
- Why: This prevents silent progression to publish/finalization and keeps human sign-off auditable.

## 2026-03-06 17:38:23 IST | Missing skills

- Context: The user asked to initiate `engineering` and `Napkin`. They are not active in this session and are not listed in the curated installer catalog checked during this turn.
- Decision: Do not assume those skills exist for follow-on agents.
- Why: Hidden skill assumptions would create inconsistent behavior across agents and turns.

## 2026-03-06 18:00:36 IST | Review persistence

- Context: The user asked for the review output to live in a dedicated review folder and to be added to a reusable review skill for future agents.
- Decision: Store review artifacts under `reviews/` and use `skills/tbr-code-review/SKILL.md` as the repo-local review workflow reference.
- Why: This gives future agents both the concrete review outputs and a reusable process for how reviews should be done in this repo.

## 2026-03-06 18:05:58 IST | Workspace split

- Context: The user clarified that the overall folder contains two active TBR sub-projects and that three agents are working in the workspace.
- Decision: Treat `tbr-analytics-hub/` as the TBR data analysis hub and `tbr-studio/` as the TBR content studio. Always name the target sub-project explicitly in notes, reviews, and handoffs.
- Why: This prevents cross-project confusion and gives all agents a consistent workspace map.

## Pending operational decision | Shared approval state

- Context: The desired workflow requires approvals to be possible in chat or in the dashboard, with a shared record of what was reviewed and approved.
- Decision: Pending. Introduce a single approval/request record model that can be created by the runtime, surfaced in the dashboard, and resolved from either channel.
- Why: Without a shared approval primitive, terminal state and dashboard state will continue to drift.
