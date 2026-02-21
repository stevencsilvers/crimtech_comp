/**
 * Read Page - Infinite Article Reader
 * 
 * Features implemented:
 * - Infinite scroll with IntersectionObserver
 * - Active article tracking
 * - Refresh resilience (localStorage/sessionStorage)
 * - Search bar with debouncing (300ms)
 * - Loading, error, and empty states
 * - Full article content rendering
 */

import { useState, useEffect, useRef } from 'react';
import { fetchArticles } from '../api/client';
import type { ArticleListItem } from '../types';
import './ReadPage.css';

export default function ReadPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const buildApiQuery = (category: string | null, query: string) => {
    const parts = [category, query].filter(Boolean);
    return parts.join(' ').trim();
  };

  // Load articles on mount based on c/q params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('c');
    const q = params.get('q') || '';
    setSearchQuery(q);
    setActiveCategory(category);
    loadArticles(null, buildApiQuery(category, q));
  }, []);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('scrollPosition', String(window.scrollY));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMoreArticles();
        }
      },
      { rootMargin: '500px' } // Start loading 500px before reaching bottom
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, isLoadingMore, loading]);

  // Track active article (most visible)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const articleId = entry.target.getAttribute('data-article-id');
            setActiveArticleId(articleId);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-article-id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [articles]);

  const loadArticles = async (cursor: string | null = null, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 API Request: fetchArticles', { cursor, limit: 10, q: query || null });
      
      const response = await fetchArticles({
        cursor,
        limit: 10,
        q: query || null,
      });
      
      console.log('API Response:', { itemCount: response.items.length, hasMore: response.hasMore, nextCursor: response.nextCursor });
      
      setArticles(response.items);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      
      // Save to localStorage
      localStorage.setItem('articleReaderState', JSON.stringify({
        articles: response.items,
        nextCursor: response.nextCursor,
        searchQuery: query,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreArticles = async () => {
    if (!nextCursor || isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const apiQuery = buildApiQuery(activeCategory, searchQuery);

      console.log('📡 API Request: fetchArticles (load more)', { cursor: nextCursor, limit: 10, q: apiQuery || null });
      
      const response = await fetchArticles({
        cursor: nextCursor,
        limit: 10,
        q: apiQuery || null,
      });
      
      console.log('API Response:', { itemCount: response.items.length, hasMore: response.hasMore, nextCursor: response.nextCursor });
      
      setArticles(prev => [...prev, ...response.items]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      
      // Update localStorage
      localStorage.setItem('articleReaderState', JSON.stringify({
        articles: [...articles, ...response.items],
        nextCursor: response.nextCursor,
        searchQuery,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more articles');
      console.error('API Error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Debounced search handler (300ms debounce)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setArticles([]);
      setNextCursor(null);
      setHasMore(true);
      const params = new URLSearchParams(window.location.search);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      if (activeCategory) {
        params.set('c', activeCategory);
      } else {
        params.delete('c');
      }
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      loadArticles(null, buildApiQuery(activeCategory, query));
      sessionStorage.removeItem('scrollPosition');
    }, 300);
  };

  const handleNavClick = (category?: string) => {
    const nextCategory = category || null;
    const nextSearchQuery = category ? searchQuery : '';
    setActiveCategory(nextCategory);
    setSearchQuery(nextSearchQuery);
    setArticles([]);
    setNextCursor(null);
    setHasMore(true);
    const params = new URLSearchParams(window.location.search);
    if (nextCategory) {
      params.set('c', nextCategory);
    } else {
      params.delete('c');
    }
    if (nextSearchQuery) {
      params.set('q', nextSearchQuery);
    } else {
      params.delete('q');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
    loadArticles(null, buildApiQuery(nextCategory, nextSearchQuery));
    sessionStorage.removeItem('scrollPosition');
  };

  const getRelativeTime = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours === 0) {
      return 'JUST NOW';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'HOUR' : 'HOURS'} AGO`;
    } else if (diffDays === 1) {
      return 'YESTERDAY';
    } else if (diffDays <= 7) {
      return `${diffDays} DAYS AGO`;
    } else {
      const month = published.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      const day = published.getDate();
      const year = published.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <ul className="navbar-links">
            <li><a className="navbar-link" onClick={() => handleNavClick('Technology')}>Technology</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Science')}>Science</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Business')}>Business</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Health')}>Health</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Culture')}>Culture</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Politics')}>Politics</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Environment')}>Environment</a></li>
            <li><a className="navbar-link" onClick={() => handleNavClick('Education')}>Education</a></li>
            <li className="navbar-divider">|</li>
            <li><a className="navbar-link" onClick={() => handleNavClick()}>Home</a></li>
          </ul>
        </div>
      </nav>
      <div className="read-page">
      <header className="read-header">
        <h1>The Harvard Crimson</h1>
        <div className="header-meta">
          <span className="header-meta-left">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <span className="header-subtitle">The University Daily Est. 1873</span>
          <span className="header-meta-right">VOLUME CLIII</span>
        </div>
      </header>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>
      
      <main className="read-content">
        {loading && articles.length === 0 && (
          <div className="loading-state">Loading articles...</div>
        )}
        
        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => loadArticles(null, searchQuery)}>Retry</button>
          </div>
        )}
        
        {articles.length === 0 && !loading && !error && (
          <div className="empty-state">
            <p>No articles found.</p>
          </div>
        )}
        
        <div className="articles-list">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className={`article-card ${activeArticleId === article.id ? 'active' : ''}`}
              data-article-id={article.id}
            >
              <h2>{article.title}</h2>
              <p className="article-dek">{article.dek}</p>
              <div className="article-meta">
                <span className="article-author">
                  <span className="article-author-label">By</span> {article.author}
                </span>
                <span>•</span>
                <span>{article.readingTimeMins} min read</span>
                <span>•</span>
                <span>{getRelativeTime(article.publishedAt)}</span>
              </div>
              {article.imageUrl && (
                <img src={article.imageUrl} alt={article.title} className="article-image" />
              )}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            </article>
          ))}
        </div>
        
        {/* Sentinel element for IntersectionObserver */}
        <div ref={sentinelRef} className="sentinel" />
        
        {isLoadingMore && (
          <div className="loading-more">Loading more articles...</div>
        )}
        
        {!hasMore && articles.length > 0 && (
          <div className="end-state">You're all caught up!</div>
        )}
      </main>
    </div>
    </>
  );
}
