# Knowledge Uploads

Drop files here that should feed into the agent's context for storyline creation.

## What to Upload
- Team press releases
- Race reports and results
- Interview transcripts
- Meeting notes
- Strategy documents
- External articles about TBR or E1
- Pilot bios and background info
- Engineering specs or updates
- Conservation partnership details
- Any document that adds context for content creation

## How the Agent Processes Uploads
1. The agent reads files from this directory when building storylines
2. Key information is extracted and added to the relevant knowledge files:
   - Team info → `/knowledge/arcs/characters/`
   - Race info → `/knowledge/arcs/race-arcs/`
   - Timeline events → `/knowledge/season/timeline.md`
   - Cultural context → `/knowledge/intelligence/live-context.md`
3. The original file stays here as a reference

## File Naming Convention
Use: `YYYY-MM-DD_description.ext`
Example: `2025-03-15_masha-interview-transcript.txt`
