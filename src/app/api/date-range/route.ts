import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://data.lacity.org/resource/y8y3-fqfu.json';
  const districts = ['645', '646', '647', '666', '663', '656', '676'];
  const districtList = districts.map(d => `'${d}'`).join(', ');
  const whereClause = `rpt_dist_no IN (${districtList})`;

  try {
    // Get the earliest date
    const minParams = new URLSearchParams({
      '$select': 'MIN(date_occ) as min_date',
      '$where': whereClause
    });

    // Get the latest date
    const maxParams = new URLSearchParams({
      '$select': 'MAX(date_occ) as max_date',
      '$where': whereClause
    });

    const [minResponse, maxResponse] = await Promise.all([
      fetch(`${baseUrl}?${minParams}`, {
        headers: { 'Accept': 'application/json' }
      }),
      fetch(`${baseUrl}?${maxParams}`, {
        headers: { 'Accept': 'application/json' }
      })
    ]);

    if (!minResponse.ok || !maxResponse.ok) {
      throw new Error('Failed to fetch date range');
    }

    const [minData, maxData] = await Promise.all([
      minResponse.json(),
      maxResponse.json()
    ]);

    const minDate = minData[0]?.min_date;
    const maxDate = maxData[0]?.max_date;

    if (!minDate || !maxDate) {
      throw new Error('No date data available');
    }

    // Format dates to YYYY-MM-DD
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    return NextResponse.json({
      success: true,
      dateRange: {
        minDate: formatDate(minDate),
        maxDate: formatDate(maxDate)
      },
      districts: districts
    });

  } catch (error) {
    console.error('Date range API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch date range', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
