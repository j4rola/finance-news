import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;

interface TopMoverItem {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

interface CompanyOverview {
  Name: string;
  Description: string;
  Sector: string;
}

interface AlphaVantageTopMoversResponse {
  metadata: string;
  last_updated: string;
  top_gainers: TopMoverItem[];
  top_losers: TopMoverItem[];
  most_actively_traded: TopMoverItem[];
}

async function getCompanyName(symbol: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
    );
    if (!response.ok) return symbol;
    
    const data: CompanyOverview = await response.json();
    return data.Name || symbol;
  } catch {
    // If there's any error, return the symbol as fallback
    return symbol;
  }
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

    // Get company names for all symbols
    const gainersPromises = (data.top_gainers || []).map(async (item) => {
      const companyName = await getCompanyName(item.ticker, API_KEY);
      return {
        symbol: item.ticker,
        name: companyName,
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage,
        volume: item.volume,
        google_finance_url: `https://www.google.com/finance/quote/${item.ticker}`
      };
    });

    const losersPromises = (data.top_losers || []).map(async (item) => {
      const companyName = await getCompanyName(item.ticker, API_KEY);
      return {
        symbol: item.ticker,
        name: companyName,
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage,
        volume: item.volume,
        google_finance_url: `https://www.google.com/finance/search?q=${item.ticker}`
      };
    });

    const [gainers, losers] = await Promise.all([
      Promise.all(gainersPromises),
      Promise.all(losersPromises)
    ]);

    return NextResponse.json({
      gainers,
      losers
    });
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch top movers' },
      { status: 500 }
    );
  }
}
