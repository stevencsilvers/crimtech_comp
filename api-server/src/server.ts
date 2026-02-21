import express from 'express';
import cors from 'cors';
import { generateMockArticles, getArticleById } from './mockData.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simulate network latency (100-500ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * 400) + 100);

// GET /articles - List articles with pagination and search
app.get('/api/articles', async (req, res) => {
  await randomDelay(); // Simulate network latency

  try {
    const cursor = req.query.cursor as string | null | undefined;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = (req.query.q as string) || null;

    const allArticles = generateMockArticles();
    
    // Apply search filter if query provided
    let filteredArticles = allArticles;
    if (query) {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      filteredArticles = allArticles.filter(article => {
        const haystack = `${article.title} ${article.dek} ${article.author} ${article.contentHtml}`.toLowerCase();
        return terms.every(term => haystack.includes(term));
      });
    }

    // Parse cursor to get starting index
    let startIndex = 0;
    if (cursor) {
      const parsed = parseInt(cursor);
      if (!isNaN(parsed)) {
        startIndex = parsed;
      }
    }

    // Get the page of articles
    const endIndex = startIndex + limit;
    const items = filteredArticles.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredArticles.length;
    const nextCursor = hasMore ? endIndex.toString() : null;

    res.json({
      items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /articles/:id - Get single article detail
app.get('/api/articles/:id', async (req, res) => {
  await randomDelay(); // Simulate network latency

  try {
    const { id } = req.params;
    const article = getArticleById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
