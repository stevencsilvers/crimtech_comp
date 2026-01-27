# Mock API Server

This is a simple mock API server for the Infinite Article Reader assignment. It provides the endpoints needed for development and testing.

## Setup

1. Install dependencies:
   ```bash
   cd api-server
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## Endpoints

- `GET /api/articles?cursor=<string>&limit=10&q=<string>` - List articles with pagination and search
- `GET /api/articles/:id` - Get a single article by ID

## Features

- Simulates network latency (100-500ms)
- Generates 150 mock articles
- Supports pagination via cursor
- Supports search filtering
- Returns article details with HTML content

## Usage

Update the API base URL in `src/api/client.ts` to:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

Or use environment variables to switch between local and production APIs.
