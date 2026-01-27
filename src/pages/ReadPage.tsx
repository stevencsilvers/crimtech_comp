/**
 * Read Page - Infinite Article Reader
 * 
 * This is your main page for the infinite scroll article reader.
 * 
 * TODO: Implement:
 * - Infinite scroll with IntersectionObserver
 * - Active article tracking
 * - Refresh resilience (localStorage/sessionStorage)
 * - Prefetch next page
 * - Search bar with debouncing
 * - Loading, error, and empty states
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticles } from '../api/client';
import type { ArticleListItem } from '../types';
import './ReadPage.css';

export default function ReadPage() {
  const { articleId } = useParams();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Implement infinite scroll
  // TODO: Implement active article tracking
  // TODO: Implement refresh resilience
  // TODO: Implement prefetch
  // TODO: Implement search with debouncing

  useEffect(() => {
    // Initial load
    loadArticles();
  }, []);

  const loadArticles = async (cursor: string | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchArticles({
        cursor,
        limit: 10,
        q: searchQuery || null,
      });
      
      setArticles(prev => cursor ? [...prev, ...response.items] : response.items);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="read-page">
      <header className="read-header">
        <h1>Article Reader</h1>
        {/* TODO: Add search bar */}
      </header>
      
      <main className="read-content">
        {loading && articles.length === 0 && (
          <div className="loading-state">Loading articles...</div>
        )}
        
        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => loadArticles()}>Retry</button>
          </div>
        )}
        
        {articles.length === 0 && !loading && !error && (
          <div className="empty-state">
            <p>No articles found.</p>
          </div>
        )}
        
        <div className="articles-list">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <h2>{article.title}</h2>
              <p className="article-dek">{article.dek}</p>
              <div className="article-meta">
                <span>By {article.author}</span>
                <span>•</span>
                <span>{article.readingTimeMins} min read</span>
                <span>•</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              {/* TODO: Render full article content */}
            </article>
          ))}
        </div>
        
        {/* TODO: Add sentinel element for IntersectionObserver */}
        {loading && articles.length > 0 && (
          <div className="loading-more">Loading more articles...</div>
        )}
        
        {!hasMore && articles.length > 0 && (
          <div className="end-state">You're all caught up!</div>
        )}
      </main>
    </div>
  );
}
