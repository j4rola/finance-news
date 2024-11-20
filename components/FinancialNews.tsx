'use client';

import React, { useState, useEffect } from 'react';

// Types defined within the component file
interface NewsItem {
  title: string;
  summary: string;
  link: string;
  published_at: number;
  source: string;
}

interface NewsApiResponse {
  news: NewsItem[];
}

const FinancialNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/yahoo-finance-news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data: NewsApiResponse = await response.json();
        setNews(data.news);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="w-full rounded-lg bg-red-50 p-6">
        <p className="text-red-600">Error loading news: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-lg bg-white shadow p-6">
        <h2 className="text-2xl font-bold">Financial News</h2>
        <p className="text-gray-600">Latest updates from Yahoo Finance</p>
      </div>

      {loading ? (
        Array(3).fill(null).map((_, i) => (
          <div key={i} className="w-full rounded-lg bg-white shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))
      ) : (
        news.map((item, index) => (
          <div key={index} className="w-full rounded-lg bg-white shadow hover:shadow-lg transition-shadow duration-200 p-6">
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 flex items-center gap-2">
                {item.title}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗
                </span>
              </h3>
            </a>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {item.summary}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>🕒</span>
                {formatDate(item.published_at)}
              </div>
              {item.source && (
                <div className="flex items-center gap-1">
                  <span>📰</span>
                  {item.source}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FinancialNews;
