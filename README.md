# Frontend Take-Home: Infinite Article Reader

## Overview

Build an "infinite" article reader that loads articles from a provided mock API and appends them as the user scrolls. Since this is a frontend-heavy deliverable we will also consider the styling. It should look clean and intentional (spacing, typography, loading states, empty states, etc).

**Time expectation:** ~8–10 hours  
**Focus:** frontend engineering (state, performance, UX, reliability)

---

## What we provide

### Mock API Server

A mock API server is included in the `api-server/` directory. This provides all the endpoints you need for local development.

**Base URL:** `http://localhost:3001/api`

The API client is already configured to use this URL. Just start the mock API server and you're ready to go.

**What the API does:**

The mock API provides a paginated article feed with search capabilities. It generates 150 mock articles covering various topics (Technology, Science, Business, Health, Culture, Politics, Environment, Education). The API simulates real-world behavior with network latency (100-500ms) to test your loading states and error handling.

**Important:** The list endpoint (`GET /articles`) returns **full article content** including `contentHtml`, so you can render complete articles directly from the list response. You typically don't need to fetch individual article details unless you're implementing a separate detail view.

**How pagination works:**

The API uses cursor-based pagination. When you request articles, you get:
- A list of articles (`items`)
- A `nextCursor` value (a string like `"10"`, `"20"`, etc.) that you use to fetch the next page
- A `hasMore` boolean indicating if there are more articles

To get the first page, don't include a cursor (or pass `null`). To get subsequent pages, use the `nextCursor` value from the previous response.

**Example flow:**
1. First request: `GET /api/articles?limit=10` → returns articles 0-9, `nextCursor: "10"`, `hasMore: true`
2. Second request: `GET /api/articles?cursor=10&limit=10` → returns articles 10-19, `nextCursor: "20"`, `hasMore: true`
3. Continue until `hasMore: false`

### Endpoints

#### 1) List / pagination

```
GET /articles?cursor=<string|null>&limit=10&q=<string|null>
```

Fetches a paginated list of articles. Supports search filtering via the `q` parameter.

**Query Parameters:**
- `cursor` (optional): A string cursor from the previous response's `nextCursor`. Use `null` or omit for the first page.
- `limit` (optional): Number of articles per page. Default is 10.
- `q` (optional): Search query string. Filters articles by matching against title, dek (summary), and author fields. Use `null` or omit for no filtering.

**Returns:**

```json
{
  "items": [
    {
      "id": "a_123",
      "title": "Example title",
      "dek": "Short summary",
      "author": "Name",
      "publishedAt": "2026-01-20T12:00:00Z",
      "readingTimeMins": 6,
      "imageUrl": "https://...",
      "contentHtml": "<p>Full article content as HTML...</p>"
    }
  ],
  "nextCursor": "opaque_cursor_or_null",
  "hasMore": true
}
```

**Response fields:**
- `items`: Array of article objects with full content:
  - `id`: Article identifier
  - `title`: Article title
  - `dek`: Short summary/description
  - `author`: Author name
  - `publishedAt`: ISO 8601 timestamp
  - `readingTimeMins`: Estimated reading time in minutes
  - `imageUrl`: URL to article image
  - `contentHtml`: Full article body as HTML (you can render this directly)
- `nextCursor`: String cursor to use for the next page, or `null` if no more pages
- `hasMore`: Boolean indicating if more articles are available

**Example requests:**
- First page: `GET /api/articles?limit=10`
- Next page: `GET /api/articles?cursor=10&limit=10`
- Search: `GET /api/articles?q=technology&limit=10`
- Search next page: `GET /api/articles?cursor=10&limit=10&q=technology`

#### 2) Article detail (optional)

```
GET /articles/:id
```

Fetches a single article by its ID. **Note:** The list endpoint already includes full article content (`contentHtml`), so you typically don't need this endpoint for the infinite scroll feed. You might use it if you want to implement a separate detail view or refresh a single article.

**Returns:**

```json
{
  "id": "a_123",
  "title": "Example title",
  "author": "Name",
  "publishedAt": "2026-01-20T12:00:00Z",
  "contentHtml": "<p>Full article content as HTML...</p>"
}
```

**Response fields:**
- `id`: Article identifier
- `title`: Article title
- `author`: Author name
- `publishedAt`: ISO 8601 timestamp
- `contentHtml`: Full article body as HTML (you can render this with `dangerouslySetInnerHTML` or a sanitizer)

**Note:** If the API is unavailable, your app should show a clear error state and a retry path.

---

## Core requirements (must-have)

### A) Article scrolling with pagination (feed of full articles)

Your `/read` page must implement **pagination/infinite scroll** - you cannot just fetch all articles at once.

**Requirements:**
- Load the first page of articles (use `limit=10` or similar, don't fetch everything).
- Render full articles (title + metadata + HTML body) from the list response.
- As the user scrolls near the bottom, load the next page using the `nextCursor` and append new articles.
- Stop when `hasMore=false` and show a clear "You're all caught up" end state.

**Note on prefetching:** Basic pagination means loading when the sentinel becomes visible. Prefetching (optional feature E) means loading earlier (e.g., 1-2 viewport heights before the bottom) so content is ready when the user arrives - this is a performance optimization, not a core requirement.


## Recommended additional features 

These features improve the user experience and further demonstrate your frontend engineering skills.

### Active article tracking

As the user scrolls, track which article is currently "active" (most visible in the viewport).

Use this to drive at least one of the following (your choice, but pick one and do it well):

- Update the URL using History API (e.g., `/read/a_123`) without jumping the scroll, OR
- Highlight the active article in a sidebar/mini-nav, OR
- Display an "Now reading: …" sticky header.

### Search bar

Add a search bar that filters articles by keyword using the `q` parameter.

**Requirements:**

- Search is applied to the API list endpoint (not just client-side filtering).
- Debounce input (e.g., ~300ms) to avoid excessive API calls.
- When the query changes:
  - reset pagination,
  - clear old results,
  - fetch from the beginning with the new query,
  - handle "no results" state cleanly.

### Category filtering

Add category-based filtering to allow users to filter articles by topic (Technology, Science, Business, Health, Culture, Politics, Environment, Education).

**Implementation:**
- You can implement this client-side by filtering the articles based on keywords in the title/dek, OR
- Use the search API with category-specific keywords (e.g., `q=technology`).
- Display category buttons/chips that users can click to filter.
- When a category is selected, reset pagination and show only articles from that category.

### Refresh resilience (keep your spot)

If the user refreshes the page, restore them to approximately the same place in the feed.

**At minimum, persist:**
- loaded article IDs (or cursors/pages),
- active article ID,
- scroll position (or anchor + offset),
- current search query.

You may use `localStorage` or `sessionStorage`. Explain your approach in the README.

### Prefetch the next page (performance optimization)

**What's the difference from basic pagination?**

- **Basic pagination (required):** Load the next page when the sentinel element becomes visible (user reaches the bottom).
- **Prefetching (optional):** Load the next page earlier (e.g., 1-2 viewport heights before the bottom) so content is already loaded when the user arrives - eliminates loading delays.

**Implementation:**
- When the user is within ~1–2 viewport heights of the bottom, start fetching the next page.
- Only one in-flight pagination request at a time.
- Cancel stale requests if the search query changes.

This makes scrolling feel smoother with no loading pauses, but basic pagination (loading when sentinel is visible) is sufficient for the core requirement.

## Styling / Layout

You can decide the overall layout as long as it's professional. Examples:

- Two-column layout with a "Loaded articles" mini-nav
- Sticky header showing active article + search
- Reading-mode toggle (font size/line height)

---

## Optional features (nice to have)

These are bonus features that demonstrate extra polish and engineering thought. Pick any 1–3 if time allows:

- Virtualized rendering / windowing after N articles (for handling very long feeds)
- Scroll-to-article from a sidebar list
- "Back to top" button that appears after scrolling
- Theme toggle (light/dark) with persistence
- Offline banner + auto-retry on reconnect
- Reading progress indicator
- Article bookmarking/favorites

---

## Optional features (nice to have)

These are bonus features that demonstrate extra polish and engineering thought. Pick any 1–3 if time allows:

- Virtualized rendering / windowing after N articles (for handling very long feeds)
- Scroll-to-article from a sidebar list
- "Back to top" button that appears after scrolling
- Theme toggle (light/dark) with persistence
- Offline banner + auto-retry on reconnect
- Reading progress indicator
- Article bookmarking/favorites

---


## How to run locally

1. **Start the mock API server** (in a separate terminal):
   ```bash
   cd api-server
   npm install
   npm run dev
   ```
   The mock API will run on `http://localhost:3001`

2. **Start the frontend** (in the project root, in a new terminal):
   ```bash
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

3. Navigate to `http://localhost:5173/read` to see the article reader page.

The API client is already configured to use `http://localhost:3001/api` by default.

---

## Project structure

```
.
├── api-server/            # Mock API server
│   ├── src/
│   │   ├── server.ts      # Express server with API endpoints
│   │   └── mockData.ts    # Mock article data generator
│   └── package.json
├── src/
│   ├── api/
│   │   └── client.ts      # API client wrapper (auto-configures to mock API)
│   ├── pages/
│   │   ├── ReadPage.tsx   # Main /read route component
│   │   └── ReadPage.css   # Styles for ReadPage
│   ├── types.ts           # TypeScript type definitions for API responses
│   ├── App.tsx            # Root component with routing
│   ├── App.css            # Global app styles
│   ├── main.tsx           # Entry point
│   └── index.css          # Base styles
└── package.json
```

---

## Architecture overview

This starter repo provides:

- **React + TypeScript + Vite** for fast development
- **React Router** for client-side routing
- **API client wrapper** (`src/api/client.ts`) configured to use the local mock API
- **Type definitions** (`src/types.ts`) matching the API response shapes
- **Basic `/read` route scaffold** with placeholder structure

The starter includes:
- Basic routing setup with `/read` and `/read/:articleId` routes
- Skeleton component structure with TODO comments
- Type-safe API client functions
- Basic styling scaffold

**What you need to implement:**

- Infinite scroll with IntersectionObserver
- Active article tracking
- Refresh resilience (localStorage/sessionStorage)
- Prefetch logic
- Search with debouncing
- Loading, error, and empty states
- Full article content rendering (using `fetchArticle` for detail view if needed)

---



## Submission

Provide:

1. A GitHub repo link
2. A README containing (you can change this readme):
   - how to run locally,
   - a brief architecture overview,
   - tradeoffs + what you'd improve next,
   - any known issues.

---

---

## Getting started

1. Clone this repository
2. **Start the mock API server** (in one terminal):
   ```bash
   cd api-server
   npm install
   npm run dev
   ```
   Keep this running in the background.
3. **Start the frontend** (in another terminal):
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173/read` in your browser
5. Start implementing the requirements!
6. Good luck! 
