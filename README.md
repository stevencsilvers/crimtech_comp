# Frontend Take-Home: Paginated Article Reader

## Overview

Build an infinite-scrolling article reader backed by a paginated mock API that loads and appends articles as the user scrolls.

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


#### 2) Article detail (optional)

```
GET /articles/:id
```

Fetches a single article by its ID. **Note:** The list endpoint already includes full article content (`contentHtml`), so you typically don't need this endpoint for the infinite scroll feed. You might use it if you want to implement a separate detail view or refresh a single article.


**Response fields:**
- `id`: Article identifier
- `title`: Article title
- `author`: Author name
- `publishedAt`: ISO 8601 timestamp
- `contentHtml`: Full article body as HTML (you can render this with `dangerouslySetInnerHTML` or a sanitizer)

---

## Requirement

### Article scrolling with pagination (feed of full articles)

Implement pagination/infinite scroll (Important note: don't fetch all articles at once - please console log the api requests being made):
- Load first page (`limit=10`)
- Render full articles (title + metadata + HTML body)
- Load next page using `nextCursor` when user scrolls near bottom
- Show "You're all caught up" when `hasMore=false`


### Optional features
You can (and are encouraged to) add additional features. Below are a few suggested ideas—feel free to come up with your own.

- **Active article tracking:** Track the most visible article and update URL/highlight/sidebar accordingly.
- **Search bar:** Filter articles using `q` parameter. Debounce input (~300ms), reset pagination on query change, handle empty states.
- **Category filtering:** Filter by topic (Technology, Science, Business, Health, Culture, Politics, Environment, Education). Can use search API or client-side filtering.
- **Refresh resilience:** Restore scroll position, loaded articles, and search query on page refresh using `localStorage`/`sessionStorage`.
- **Try new layouts** Examples: Two-column with mini-nav, sticky header, reading-mode toggle. Focus on clean typography, spacing, and professional design.


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


## Submission

Provide:

Please submit on Google classroom:
1. A GitHub repo link
2. A screen recording of your code running / working. No need to voiceover or explain anything - we will ask about your code during final interviews.

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
