# Lattice Mobile App - UI Guide

## Overview
Lattice is a simple educational feed app that displays AI-generated learning content from your backend. This guide describes what you see and how to use it.

---

## 🏠 Feed Screen

### What You See

**Header:**
- **Title**: "Lattice Feed" at the top
- **Refresh Icon** (↻): Top-right - tap to reload the feed from backend

**Content Feed:**
A scrollable list of content cards. Each card shows:

**Card Header:**
- **Category Badge** (top-left): Blue pill showing "SOFTWARE_ENGINEERING", "DATA_SCIENCE", etc.
- **Read Time** (top-right): Gray text showing "3m read", "5m read", etc.

**Card Body:**
- **Content Preview**: First 200 characters of the article
- Shows basic Markdown formatting (headings, bold text)
- **"Tap to read more..."** link at the bottom

**Card Footer:**
- Three feedback buttons:
  - **👍 Helpful**: Mark content as useful
  - **🧠 Challenging**: Flag as difficult  
  - **🔖 Save**: Bookmark for later
- Buttons turn blue when tapped
- Shows brief "Helpful tracked!" message

**Loading State:**
- Circular spinner while fetching from backend

**Error State:**
- Red error icon
- "Could not reach backend" message
- **Retry** button

---

## 📖 Content Detail Screen

### How to Get There
Tap any content card

### What You See

**Header:**
- **Back Arrow** (←): Returns to feed
- **Category Title**: Shows the category name
- **Bookmark Icon** (🔖): Top-right - save this content
- **Share Icon** (↗️): Top-right (future feature)

**Content Header:**
- **Difficulty Badge**: Colored pill
  - Green = Beginner
  - Orange = Intermediate
  - Red = Advanced
- **Read Time**: "3 min read" next to difficulty

**Tags:**
- Gray chips showing content tags
- Examples: "nestjs", "typescript", "api-design"

**Main Content:**
- Full Markdown rendering with:
  - Large headings
  - Code blocks with gray background
  - Blockquotes with blue border
  - Selectable text (long-press to copy)

**Footer:**
- "Was this content helpful?"
- **👍 Helpful** and **🧠 Challenging** buttons

**Automatic Tracking:**
- Opening this screen logs `CONTENT_VIEWED`
- Tapping bookmark logs `CONTENT_SAVED`

---

## 🔄 How It Works

### Backend Integration
- Feed fetches from `GET /feed?interests=X&targetDifficulty=Y`
- Uses your saved interests and difficulty from `SharedPreferences`
- Content is ranked by the backend's deterministic algorithm

### Offline Support
- Last fetched feed is cached locally
- If backend is unreachable, shows cached content
- Can still read Detail View offline

### Interaction Tracking
- All button taps send events to `POST /interactions/track`
- Backend aggregates these asynchronously via BullMQ
- Future feeds improve based on your feedback

---

## ⚙️ Settings (Future)

Currently, interests and difficulty are set via `SharedPreferences` defaults:
- **Default Interest**: Software Engineering
- **Default Difficulty**: 0.5 (Intermediate)

**Future enhancement**: Add a Settings screen to change these preferences.

---

## 🐛 Troubleshooting

### "Could not reach backend"
- Check backend is running at `http://10.100.173.88:3000`
- Verify your device is on the same network
- If offline, you'll see cached content

### No content showing
- Backend may not have generated content yet
- Admin should run: `POST /ai-orchestrator/generate-batch`
- Refresh the feed after generation completes

### Feedback buttons not working
- Check backend logs for `POST /interactions/track` errors
- Ensure `InteractionsModule` is properly configured

---

## 🚀 What's Next

This is a minimal viable product. Future enhancements:
- **Settings screen** for interests and difficulty
- **Bookmarks tab** to view saved content
- **Search** by tags or keywords
- **Pull-to-refresh** gesture
- **Dark mode**
