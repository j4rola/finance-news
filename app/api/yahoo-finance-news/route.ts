import { NextResponse } from 'next/server';

// Access the environment variable
const API_KEY = process.env.API_KEY;

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  source: string;
}

interface AlphaVantageResponse {
  feed: NewsItem[];
  items?: never;
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { message: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${API_KEY}&topics=financial_markets&sort=LATEST`,
      {
        next: {
          revalidate: 300 // Revalidate every 5 minutes
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Alpha Vantage');
    }

    const data: AlphaVantageResponse = await response.json();
    
    if (!data.feed) {
      throw new Error('Invalid response format');
    }

    const news = data.feed.map(item => ({
      title: item.title,
      summary: item.summary,
      link: item.url,
      published_at: new Date(item.time_published).getTime() / 1000,
      source: item.source
    }));

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
