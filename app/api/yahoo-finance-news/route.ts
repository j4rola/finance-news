import { NextResponse } from 'next/server';

// Types for the Yahoo Finance API response
interface YahooFinanceApiItem {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
}

interface YahooFinanceApiResponse {
  items: YahooFinanceApiItem[];
}

export async function GET() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v2/finance/news',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: {
          revalidate: 300 // Revalidate every 5 minutes
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Yahoo Finance');
    }

    const data: YahooFinanceApiResponse = await response.json();
    
    const news = data.items.map(item => ({
      title: item.title,
      summary: item.summary,
      link: item.link,
      published_at: new Date(item.pubDate).getTime() / 1000,
      source: item.source
    }));

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
