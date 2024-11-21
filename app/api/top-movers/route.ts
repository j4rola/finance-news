import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY;

interface TopMoverItem {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
  exchange?: string;  // Some APIs include this
}

interface CompanyOverview {
  Name: string;
  Exchange: string;
}

interface AlphaVantageTopMoversResponse {
  metadata: string;
  last_updated: string;
  top_gainers: TopMoverItem[];
  top_losers: TopMoverItem[];
  most_actively_traded: TopMoverItem[];
}

async function getCompanyInfo(symbol: string, apiKey: string): Promise<{ name: string; exchange: string }> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
    );
    if (!response.ok) return { name: symbol, exchange: 'NASDAQ' }; // Default to NASDAQ if we can't get info
    
    const data: CompanyOverview = await response.json();
    return {
      name: data.Name || symbol,
      exchange: data.Exchange || 'NASDAQ' // Default to NASDAQ if exchange info is missing
    };
  } catch {
    return { name: symbol, exchange: 'NASDAQ' }; // Default to NASDAQ on error
  }
}

function getGoogleFinanceUrl(symbol: string, exchange: string): string {
  // Handle different exchanges
  if (exchange.includes('NYSE')) {
    return `https://www.google.com/finance/quote/${symbol}:NYSE`;
  } else if (exchange.includes('NASDAQ')) {
    return `https://www.google.com/finance/quote/${symbol}:NASDAQ`;
  } else {
    // If we're not sure about the exchange, use the search URL
    return `https://www.google.com/finance/search?q=${symbol}`;
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

    // Get company names and exchange info for all symbols
    const gainersPromises = (data.top_gainers || []).map(async (item) => {
      const companyInfo = await getCompanyInfo(item.ticker, API_KEY);
      return {
        symbol: item.ticker,
        name: companyInfo.name,
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage,
        volume: item.volume,
        google_finance_url: getGoogleFinanceUrl(item.ticker, companyInfo.exchange)
      };
    });

    const losersPromises = (data.top_losers || []).map(async (item) => {
      const companyInfo = await getCompanyInfo(item.ticker, API_KEY);
      return {
        symbol: item.ticker,
        name: companyInfo.name,
        change: parseFloat(item.change_amount),
        price: item.price,
        change_percent: item.change_percentage,
        volume: item.volume,
        google_finance_url: getGoogleFinanceUrl(item.ticker, companyInfo.exchange)
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
