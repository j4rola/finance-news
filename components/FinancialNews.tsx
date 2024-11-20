'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink, Tag } from 'lucide-react';
import type { NewsItem, NewsApiResponse } from '@/types/news';

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
      <Card className="w-full bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading news: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Financial News</CardTitle>
          <CardDescription>Latest updates from Yahoo Finance</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        Array(3).fill(null).map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        news.map((item, index) => (
          <Card key={index} className="w-full hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 flex items-center gap-2">
                  {item.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </a>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {item.summary}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(item.published_at)}
                </div>
                {item.source && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {item.source}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default FinancialNews;
