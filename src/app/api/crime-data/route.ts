import { NextRequest, NextResponse } from 'next/server';

interface CrimeRecord {
  area: string;
  area_name: string;
  caseno: string;
  crime_against: string;
  date_occ: string;
  date_rptd: string;
  domestic_violence_crime: string;
  gang_related_crime: string;
  group: string;
  hate_crime: string;
  homeless_arrestee_crime: string;
  homeless_suspect_crime: string;
  homeless_victim_crime: string;
  nibr_code: string;
  nibr_description: string;
  premis_cd: string;
  premis_desc: string;
  rpt_dist_no: string;
  status: string;
  status_desc: string;
  time_occ: string;
  totaloffensecount: string;
  totalvictimcount: string;
  transit_related_crime: string;
  uniquenibrno: string;
  victim_shot: string;
  weapon_desc?: string;
  weapon_used_cd?: string;
}

class LACrimeDataQuerier {
  private baseUrl = 'https://data.lacity.org/resource/y8y3-fqfu.json';
  private districts = ['645', '646', '647', '666', '663', '656', '676'];

  private buildWhereClause(startDate: string, endDate: string): string {
    const districtList = this.districts.map(d => `'${d}'`).join(', ');
    return `rpt_dist_no IN (${districtList}) AND date_occ >= '${startDate}' AND date_occ <= '${endDate}'`;
  }

  async getTotalCount(startDate: string, endDate: string): Promise<number> {
    const whereClause = this.buildWhereClause(startDate, endDate);
    const params = new URLSearchParams({
      '$select': 'count(*)',
      '$where': whereClause
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return parseInt(data[0]?.count || '0');
    } catch (error) {
      console.error('Error getting count:', error);
      return 0;
    }
  }

  async queryWithPagination(
    startDate: string, 
    endDate: string, 
    onProgress?: (current: number, total: number) => void
  ): Promise<CrimeRecord[]> {
    const whereClause = this.buildWhereClause(startDate, endDate);
    const totalCount = await this.getTotalCount(startDate, endDate);
    
    if (totalCount === 0) {
      return [];
    }

    const allRecords: CrimeRecord[] = [];
    const limitPerPage = 1000;
    let offset = 0;

    while (offset < totalCount) {
      const params = new URLSearchParams({
        '$where': whereClause,
        '$order': 'date_occ DESC',
        '$limit': limitPerPage.toString(),
        '$offset': offset.toString()
      });

      try {
        const response = await fetch(`${this.baseUrl}?${params}`, {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const pageData: CrimeRecord[] = await response.json();
        
        if (!pageData || pageData.length === 0) {
          break;
        }

        allRecords.push(...pageData);
        offset += limitPerPage;

        // Report progress
        if (onProgress) {
          onProgress(allRecords.length, totalCount);
        }

        // Small delay to be API-friendly
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error fetching page at offset ${offset}:`, error);
        break;
      }
    }

    return allRecords;
  }

  async queryWithHighLimit(startDate: string, endDate: string): Promise<CrimeRecord[]> {
    const whereClause = this.buildWhereClause(startDate, endDate);
    const params = new URLSearchParams({
      '$where': whereClause,
      '$order': 'date_occ DESC',
      '$limit': '50000'
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CrimeRecord[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error with high limit query:', error);
      return [];
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const method = searchParams.get('method') || 'auto';

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate parameters are required' },
      { status: 400 }
    );
  }

  const querier = new LACrimeDataQuerier();

  try {
    let data: CrimeRecord[];

    if (method === 'pagination') {
      data = await querier.queryWithPagination(startDate, endDate);
    } else if (method === 'high-limit') {
      data = await querier.queryWithHighLimit(startDate, endDate);
    } else {
      // Auto method: try high limit first, fall back to pagination
      data = await querier.queryWithHighLimit(startDate, endDate);
      if (data.length === 50000) {
        // Might be truncated, use pagination for complete data
        data = await querier.queryWithPagination(startDate, endDate);
      }
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data: data,
      dateRange: { startDate, endDate },
      districts: querier['districts']
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, method = 'auto' } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const querier = new LACrimeDataQuerier();
    let data: CrimeRecord[];

    if (method === 'pagination') {
      data = await querier.queryWithPagination(startDate, endDate);
    } else if (method === 'high-limit') {
      data = await querier.queryWithHighLimit(startDate, endDate);
    } else {
      data = await querier.queryWithHighLimit(startDate, endDate);
      if (data.length === 50000) {
        data = await querier.queryWithPagination(startDate, endDate);
      }
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data: data,
      dateRange: { startDate, endDate },
      districts: querier['districts']
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
