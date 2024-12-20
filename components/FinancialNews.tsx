'use client';

import React, { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  published_at: number;
  source: string;
}

interface StockMove {
  symbol: string;
  name: string;
  change: number;
  price: string;
  change_percent: string;
  volume?: string;
  google_finance_url: string;
}

interface NewsApiResponse {
  news: NewsItem[];
}

interface TopMoversResponse {
  gainers: StockMove[];
  losers: StockMove[];
}

const FinancialNews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'movers'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [movers, setMovers] = useState<TopMoversResponse>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'news') {
          const response = await fetch('/api/financial-news');
          if (!response.ok) throw new Error('Failed to fetch news');
          const data: NewsApiResponse = await response.json();
          setNews(data.news);
        } else {
          const response = await fetch('/api/top-movers');
          if (!response.ok) throw new Error('Failed to fetch top movers');
          const data: TopMoversResponse = await response.json();
          setMovers(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTabs = () => (
    <div className="flex space-x-1 border-b mb-6">
      <button
        onClick={() => setActiveTab('news')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'news'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        News
      </button>
      <button
        onClick={() => setActiveTab('movers')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'movers'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Top Gainers & Losers
      </button>
    </div>
  );

  const renderMovers = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Gainers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-600">Top Gainers</h3>
        {movers.gainers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500">No gainers data available</p>
          </div>
        ) : (
          movers.gainers.map((stock) => (
            <div key={stock.symbol} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <a 
                    href={stock.google_finance_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h4 className="font-semibold group-hover:text-blue-600 flex items-center gap-1">
                      {stock.symbol}
                      <span className="text-xs opacity-0 group-hover:opacity-100">↗</span>
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{stock.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Volume: {stock.volume || 'N/A'}</p>
                  </a>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">${stock.price}</p>
                  <p className="text-sm text-green-600">{stock.change_percent}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Losers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-600">Top Losers</h3>
        {movers.losers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500">No losers data available</p>
          </div>
        ) : (
          movers.losers.map((stock) => (
            <div key={stock.symbol} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <a 
                    href={stock.google_finance_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h4 className="font-semibold group-hover:text-blue-600 flex items-center gap-1">
                      {stock.symbol}
                      <span className="text-xs opacity-0 group-hover:opacity-100">↗</span>
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{stock.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Volume: {stock.volume || 'N/A'}</p>
                  </a>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">${stock.price}</p>
                  <p className="text-sm text-red-600">{stock.change_percent}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="w-full rounded-lg bg-red-50 p-6">
        <p className="text-red-600">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-lg bg-white shadow p-6">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        {renderTabs()}
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
      ) : activeTab === 'news' ? (
        news.map((item) => (
          <div key={item.link} className="w-full rounded-lg bg-white shadow hover:shadow-lg transition-shadow duration-200 p-6">
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
      ) : (
        renderMovers()
      )}
    </div>
  );
};

export default FinancialNews;
