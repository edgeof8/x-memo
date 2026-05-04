**✅ PRD: x-memo**  
**X/Twitter Thread → Clean Markdown Bookmarklet**

**Version**: 0.1  
**Date**: May 4, 2026  
**Author**: edgeof8 (inspired by bttn + md-memo)  
**Status**: Draft – Ready for implementation

---

### 1. Executive Summary

**x-memo** is a lightweight, zero-install bookmarklet that exports any X/Twitter thread (including long conversations) directly to clean, well-structured Markdown with YAML frontmatter — ready for Obsidian, Notion, Logseq, or any PKM tool.

It completes the **Edge Toolkit** suite by adding the missing social layer to the existing capture tools:
- `bttn` → AI conversations
- `md-memo` → articles
- `x-memo` → X/Twitter threads

**One click. Full thread. Perfect Markdown. No accounts. No extensions. No data leaves your browser.**

---

### 2. Problem Statement

X/Twitter threads are one of the richest sources of information on the internet, yet saving them is painful:

- Manual copy-paste is slow and loses formatting, usernames, and structure
- Existing solutions require Chrome extensions, API keys, or paid tools
- Most exporters are heavy or break when X changes their DOM
- People want threads in their personal knowledge base in clean Markdown (with proper attribution)

**x-memo solves this** with the same philosophy as the rest of the suite: **dead simple, privacy-first, and stupidly reliable**.

---

### 3. Goals

**Primary Goal**  
Export any visible X thread to high-quality Markdown in under 3 seconds with one click.

**Secondary Goals**
- Match the quality and consistency of `bttn` and `md-memo` output
- Be extremely robust against X DOM changes
- Feel native to the existing Edge Toolkit brand

**Success Metrics (MVP)**
- Works on 95%+ of public threads (logged-in or not)
- Produces clean, readable Markdown on first try
- < 2.5 KB minified bookmarklet size
- Zero external dependencies (or optional CDN like md-memo)

---

### 4. Target Users

- Researchers & writers who save threads for later reference
- PKM power users (Obsidian/Notion/Logseq)
- AI enthusiasts who want to feed threads into LLMs
- Journalists and content creators
- Anyone who hates losing great threads in their timeline

---

### 5. Key Features (MVP)

| Feature                        | Description                                                                 | Priority |
|--------------------------------|-----------------------------------------------------------------------------|----------|
| **Thread Detection**           | Automatically detects when user is on a thread (single tweet or full thread) | P0      |
| **Full Thread Extraction**     | Walks the entire visible thread (main post + all replies in the conversation) | P0      |
| **Clean Markdown Output**      | Proper formatting: bold, italics, code blocks, lists, quotes, links         | P0      |
| **YAML Frontmatter**           | `title`, `author`, `source`, `clipped`, `thread_length`                     | P0      |
| **Username & Attribution**     | `@username` with display name and timestamp                                 | P0      |
| **Media Handling**             | Notes images/videos with alt text or links (no downloading)                 | P0      |
| **Quoted Tweets**              | Properly includes quoted tweets with clear formatting                       | P1      |
| **Toast + Title Feedback**     | “✓ Copied thread (12 tweets)” + tab title flash (consistent with bttn)      | P0      |
| **Deduplication**              | Avoids duplicate posts in long or branched threads                          | P1      |

**Nice-to-have (Post-MVP)**
- Option to include engagement metrics (likes, reposts, views)
- “Condensed mode” (header once, then just tweet bodies)
- Support for polls and long-form posts
- Keyboard shortcut hint

---

### 6. User Flow

1. User is on any X/Twitter thread (x.com or twitter.com)
2. Clicks **x-memo** bookmark
3. Bookmarklet:
   - Detects platform and thread container
   - Scrolls if needed to load more replies (smart, limited)
   - Extracts all posts in the thread
   - Converts to clean Markdown + YAML
   - Copies to clipboard
4. User sees toast: `✓ Copied 14-tweet thread by @username`
5. Tab title briefly shows `✓ Copied`

**Edge case handling**:
- Single tweet (not a thread) → still works, exports as single post
- Thread behind login wall → extracts whatever is visible
- Very long threads → graceful degradation with warning

---

### 7. Technical Requirements

- **Pure client-side JavaScript** (ES6+)
- **No permanent dependencies** (optional CDN load for Turndown if needed, like md-memo)
- **Robust DOM selectors** using `data-testid`, ARIA roles, and class patterns (similar to bttn’s platform handlers)
- **Platform detection**: `x.com`, `twitter.com`, and future subdomains
- **Clipboard API** + fallback
- **Minified size** target: < 3 KB
- **Works on**: Chrome, Edge, Firefox, Safari (desktop + mobile bookmarks menu)

**Key Technical Challenges & Solutions**
- X uses heavy virtualization → use `MutationObserver` + smart scrolling
- Frequent DOM changes → multiple fallback selectors + feature detection
- Thread structure changes → recursive walker with seen Set (like bttn)

---

### 8. Non-Functional Requirements

- **Privacy**: 100% local. No analytics, no external calls except optional CDN
- **Performance**: < 2 seconds on typical threads
- **Reliability**: Works even on slow connections or partially loaded pages
- **Accessibility**: Proper ARIA feedback, keyboard accessible
- **Maintainability**: Clean, well-commented code with clear platform handler pattern

---

### 9. Scope

**In Scope (MVP)**
- Public and logged-in threads
- Text, links, basic formatting, images (as links + alt), code blocks
- Replies visible in the conversation view

**Out of Scope (MVP)**
- Downloading images/videos
- Private/protected accounts (only visible content)
- Bookmarks page export (future idea)
- API usage (we stay DOM-only for simplicity and reliability)

---

### 10. Success Criteria

**Launch Criteria**
- Successfully exports 20 different real-world threads without manual intervention
- Output passes Markdown linting and looks great in Obsidian/Notion
- Matches visual and UX quality of `bttn` and `md-memo`

**Post-Launch**
- Positive feedback from early users
- < 5% failure rate on popular threads over 30 days

---

### 11. Risks & Mitigations

| Risk                        | Likelihood | Impact | Mitigation |
|-----------------------------|------------|--------|----------|
| X changes DOM frequently    | High       | High   | Multiple selector fallbacks + easy update path |
| Very long threads (100+ tweets) | Medium  | Medium | Smart loading + user warning + pagination note |
| Login wall / rate limiting  | Medium     | Low    | Extract only visible content + clear messaging |
| CSP blocking on x.com       | Low        | Medium | Pure JS, no external scripts in MVP |

---

### 12. Future Roadmap (Post-MVP)

- **v0.2**: Bookmarks page exporter (`x-memo-bookmarks`)
- **v0.3**: Support for X Spaces summaries (when transcript available)
- **v0.4**: “Stitch mode” — combine multiple threads into one note
- **v0.5**: Integration with `bttn` (export AI discussion about a thread)
