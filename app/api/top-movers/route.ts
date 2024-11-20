import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;

interface TopMoverItem {
  '1. symbol': string;
  '2. name': string;
  '3. change': string;
  '4. price': string;
  '5. change percent': string;
}

interface AlphaVantageTopMoversResponse {
  'top gainers': TopMoverItem[];
  'top losers': TopMoverItem[];
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
    
    // Transform the data to a cleaner format
    const transformed = {
      gainers: (data['top gainers'] || []).map(item => ({
        symbol: item['1. symbol'],
        name: item['2. name'],
        change: parseFloat(item['3. change']),
        price: item['4. price'],
        change_percent: item['5. change percent']
      })),
      losers: (data['top losers'] || []).map(item => ({
        symbol: item['1. symbol'],
        name: item['2. name'],
        change: parseFloat(item['3. change']),
        price: item['4. price'],
        change_percent: item['5. change percent']
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
