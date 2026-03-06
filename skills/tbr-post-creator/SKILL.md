# TBR Post Creator

Generate social media posts for Team Blue Rising across all platforms.

## When to Activate

- Creating any social post (carousel, single image, text, story, reel)
- The TBR Director skill hands off post creation
- User asks to "create a post", "make a carousel", "draft a caption"

## Platform Specifications

| Platform | Post Types | Aspect Ratio | Caption Limit | Hashtag Limit |
|----------|-----------|--------------|---------------|---------------|
| Instagram | Carousel (up to 10 slides), Single Image, Reel, Story | 1:1, 4:5, 9:16 | 2,200 chars | 30 (use 5-8) |
| Twitter/X | Image + text, Thread, Video clip | 16:9, 1:1 | 280 chars | 2-3 |
| LinkedIn | Image + text, Carousel PDF, Video | 1:1, 16:9 | 3,000 chars | 3-5 |
| YouTube | Shorts (9:16), Video | 9:16, 16:9 | 5,000 chars | 15 |
| TikTok | Video, Photo carousel | 9:16 | 2,200 chars | 5-8 |

## Carousel Architecture

A TBR carousel tells a story in frames.

### Structure
```
Slide 1: THE HOOK — Bold visual + short text. This is what stops the scroll.
Slide 2-N: THE STORY — One beat per slide. Progress the narrative.
Final Slide: THE CLOSE — CTA, logo, or emotional resolution.
```

### Slide Design Direction
- Background: Use real photography when available. Dark overlay for text legibility.
- Text: Bold, short (max 8 words per slide). White or TBR blue on dark background.
- Typography: Clean sans-serif. No decorative fonts.
- Layout: Text centered or bottom-third. Never top-left (gets cut by profile pic).

### Caption Approach
The caption extends the story, it does not repeat it.
- First line: Hook that works independently (this shows in the preview).
- Body: Context, backstory, the "why" behind the post.
- Close: Question or CTA to drive engagement.
- Hashtags: Separate block at the end or in first comment.

## Post Types

### Race Result Post
```yaml
type: single_image or carousel
tone: triumphant or reflective (based on result)
structure:
  - Hero image from the race
  - Result graphic (position, time, gap)
  - Key moment from the race
  - Next race teaser
caption: Start with result. Add context. What this means for the championship.
```

### Behind-the-Scenes Post
```yaml
type: carousel or reel
tone: documentary, intimate
structure:
  - Candid moment (preparation, travel, downtime)
  - Process shots (engineering, strategy, practice)
  - Human moments (laughter, focus, teamwork)
caption: Let the viewer feel like an insider. First-person or close-third perspective.
```

### Character Introduction Post
```yaml
type: carousel
tone: respectful, anticipatory
structure:
  - Slide 1: Silhouette or dramatic portrait + "Meet [Name]"
  - Slide 2: Background/origin
  - Slide 3: What they bring to TBR
  - Slide 4: In their own words (quote)
  - Slide 5: "Welcome to Team Blue Rising"
caption: Their story. Why TBR. What is next.
```

### Conservation/Mission Post
```yaml
type: single_image or carousel
tone: grounded, purposeful
structure:
  - Powerful ocean/marine visual
  - The problem (rising sea levels, marine pollution)
  - What TBR stands for
  - How electric racing connects to the mission
caption: Facts, not platitudes. Connect racing to purpose.
```

## Creating Posts via CLI

```bash
npx tsx scripts/db-writer.ts add-post \
  --title "<title>" \
  --postType "<single_image|carousel|text|video_clip|story|reel>" \
  --platform "<instagram|twitter|linkedin|youtube|tiktok>" \
  --caption "<full caption text>" \
  --hashtags '<JSON array of hashtags>' \
  --slides '<JSON array of slide objects for carousels>' \
  --storyboardId "<optional storyboard link>"
```

## Attaching Media

```bash
npx tsx scripts/db-writer.ts link-post-media \
  --postId "<post-id>" \
  --mediaFileId "<media-id>" \
  --order 1 \
  --role "slide_1"
```

## Publishing via Postiz

Once a post is approved:
1. Use the Postiz MCP to schedule or publish immediately.
2. Update the post record with the Postiz job ID.
3. Update status to SCHEDULED or PUBLISHED.

## Caption Writing Rules

1. First line must work on its own (it is the preview in the feed).
2. No em dashes. No emojis.
3. Short sentences. Punchy rhythm.
4. Break long captions into paragraphs with line breaks.
5. End with a question or clear CTA to drive engagement.
6. Hashtags: relevant, not spammy. Mix broad (#ElectricRacing) with specific (#E1Series #TeamBlueRising).
7. Never use: "game-changer", "unleash", "elevate", "revolutionize".
8. Always connect to a pillar: Racing, Conservation, Innovation.
