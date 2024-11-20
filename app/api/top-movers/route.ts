import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;

interface TopMoverItem {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

interface AlphaVantageTopMoversResponse {
  metadata: string;
  last_updated: string;
  top_gainers: TopMoverItem[];
  top_losers: TopMoverItem[];
  most_actively_traded: TopMoverItem[];
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
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`,
      {
        next: {
          revalidate: 300 // Revalidate every 5 minutes
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Alpha Vantage');
    }

    const data: AlphaVantageTopMoversResponse = await response.json();
    
    // Log the response for debugging
    console.log('Alpha Vantage Response:', JSON.stringify(data, null, 2));

    // Transform the data to a cleaner format
    const transformed = {
      gainers: (data.top_gainers || []).map(item => ({
        symbol: item.ticker,
        name: item.ticker, // Alpha Vantage doesn't provide company names in this endpoint
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage
      })),
      losers: (data.top_losers || []).map(item => ({
        symbol: item.ticker,
        name: item.ticker, // Alpha Vantage doesn't provide company names in this endpoint
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage
      }))
    };

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch top movers' },
      { status: 500 }
    );
  }
}
