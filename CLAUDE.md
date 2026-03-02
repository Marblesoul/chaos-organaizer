# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chaos Organizer** — a diploma project for the "Advanced JavaScript in Browser" course (Netology). It's a bot-organizer chat application (think Telegram/WhatsApp/Slack) where users store information, and the bot handles search, reminders, and integrations.

The project is split into a **frontend** (GitHub Pages) and a **backend** (Heroku), both in this monorepo (or separate repos — architect as needed).

## Required Tech Stack

**Frontend:** Webpack, Babel, ESLint, AppVeyor CI
**Backend:** Koa (+ koa-router, koa-bodyparser, etc.), `http-event-stream` (SSE), `ws` (WebSockets)
**Data storage:** In-memory only (arrays, `Set`, `Map`) — no database required

## Commands

Commands will depend on the `package.json` scripts once set up. Typical setup:

```bash
npm install          # install dependencies
npm run dev          # start webpack dev server (frontend)
npm run build        # production build
npm run lint         # ESLint
npm start            # start Koa server (backend)
npm test             # run tests
```

## Architecture

### Frontend
- Single-page chat UI resembling Telegram/WhatsApp
- Communicates with backend via REST (messages, file upload) + WebSocket or SSE (real-time sync)
- Lazy loading: fetch last 10 messages on load, fetch next 10 on scroll up
- Drag & Drop and file input for media uploads (images, video, audio)
- Links (`http://`/`https://`) auto-detected and rendered as clickable anchors

### Backend (Koa)
- REST endpoints: get messages (paginated), post message, upload file, search, pin, favorites
- WebSocket (`ws`) for real-time multi-tab sync
- SSE (`http-event-stream`) as alternative for push events
- Files served statically; uploaded files stored in a directory (add `.gitkeep` so git tracks the folder)
- Demo/seed data hardcoded in memory so reviewers don't need to upload files manually

### Message Model (in-memory)
```js
{ id, type, content, timestamp, pinned, favorite }
// type: 'text' | 'image' | 'video' | 'audio' | 'file'
```

## Required Features (must implement all)

- Save text messages and links to history; render links as clickable
- Save images, video, audio via Drag & Drop and upload icon
- File download to user's computer
- Lazy loading (10 messages at a time, load more on scroll up)

## Optional Features (implement ≥ 5)

- Multi-tab sync via WebSocket/SSE
- Message search (UI + server-side)
- Record video/audio via browser MediaRecorder API
- Send geolocation
- Play video/audio in-browser
- Reminders via Notification API (`@schedule: HH:MM DD.MM.YYYY «text»`)
- Bot commands (`@chaos: weather` etc.) — at least 5 commands with random responses
- Pin one message (shown at top of page)
- Favorite messages with a view for favorites
- View attachments by category (audio / video / images / other)
- Offline mode with Service Worker caching
- Export/Import chat history
- Encrypted messages/files with password (counts as 2 optional features)
- File archiving/unarchiving (zip.js)
- Code block formatting (markdown-style triple backticks)
- Emoji support
- Sticker support

## Deployment Notes

- **Heroku** stops the app periodically — all in-memory data is lost on restart; uploaded files not in Git are deleted
- Use `.gitkeep` in upload directories to preserve folder structure in Git
- Hardcode demo data so the app has content after a restart
- Frontend deployed to **GitHub Pages**; include build badge and live link in README
