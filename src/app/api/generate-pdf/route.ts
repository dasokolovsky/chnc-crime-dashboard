import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { format } from 'date-fns';

// Chart generation temporarily disabled - will be re-implemented with alternative solution

interface CrimeData {
  date_rptd: string;
  crm_cd_desc: string;
  area_name: string;
  rpt_dist_no: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface PDFSummary {
  totalIncidents: number;
  topCrimeTypes: Array<{ type: string; count: number }>;
  districtBreakdown: Array<{ district: string; count: number }>;
}

interface PDFRequest {
  crimeData: CrimeData[];
  dateRange: {
    start: string;
    end: string;
  };
  summary: PDFSummary;
}

export async function POST(request: NextRequest) {
  try {
    console.log('PDF generation started');
    const { crimeData, dateRange, summary }: PDFRequest = await request.json();
    console.log('Request data parsed:', {
      crimeDataLength: crimeData.length,
      dateRange,
      summaryKeys: Object.keys(summary)
    });

    // Temporarily disable charts due to ChartJSNodeCanvas compatibility issues
    console.log('Skipping chart generation (temporarily disabled)');
    const trendsChart = '';
    const districtChart = '';

    // Generate HTML template
    console.log('Generating HTML template...');
    const htmlContent = generateHTMLTemplate({
      crimeData,
      dateRange,
      summary,
      trendsChart,
      districtChart,
    });
    console.log('HTML template generated');

    // Generate PDF using Puppeteer
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    console.log('Puppeteer launched');

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Convert buffer to Uint8Array for Response
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CHNC-Crime-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Chart generation functions temporarily removed
// Will be re-implemented with alternative chart solution

function generateHTMLTemplate(data: {
  crimeData: CrimeData[];
  dateRange: { start: string; end: string };
  summary: PDFSummary;
  trendsChart: string;
  districtChart: string;
}): string {
  const { dateRange, summary, trendsChart, districtChart } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CHNC Crime Report</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #1f2937;
          line-height: 1.6;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-card .value {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        .chart-container {
          margin: 30px 0;
          text-align: center;
        }
        .chart-container img {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          margin: 30px 0 15px 0;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 5px;
        }
        .top-crimes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .crime-list {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
        }
        .crime-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .crime-item:last-child {
          border-bottom: none;
        }
        .footer {
          background: #f1f5f9;
          padding: 20px 30px;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CHNC Crime Dashboard Report</h1>
        <p>Hollywood LAPD Districts • ${format(new Date(dateRange.start), 'MMM d, yyyy')} - ${format(new Date(dateRange.end), 'MMM d, yyyy')}</p>
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
      </div>

      <div class="content">
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Incidents</h3>
            <p class="value">${summary.totalIncidents.toLocaleString()}</p>
          </div>
          <div class="summary-card">
            <h3>Date Range</h3>
            <p class="value">${Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24))}</p>
            <p style="font-size: 12px; margin-top: 5px;">Days</p>
          </div>
          <div class="summary-card">
            <h3>Districts Covered</h3>
            <p class="value">${summary.districtBreakdown.length}</p>
          </div>
        </div>

        ${trendsChart ? `
        <div class="chart-container">
          <img src="data:image/png;base64,${trendsChart}" alt="Crime Trends Chart" />
        </div>
        ` : '<div class="chart-container"><p style="text-align: center; color: #666;">Crime trends chart unavailable</p></div>'}

        ${districtChart ? `
        <div class="chart-container">
          <img src="data:image/png;base64,${districtChart}" alt="District Distribution Chart" />
        </div>
        ` : '<div class="chart-container"><p style="text-align: center; color: #666;">District chart unavailable</p></div>'}

        <h2 class="section-title">Top Crime Types</h2>
        <div class="top-crimes">
          <div class="crime-list">
            <h4 style="margin-top: 0;">Most Common Incidents</h4>
            ${summary.topCrimeTypes.slice(0, 5).map((crime, index: number) => `
              <div class="crime-item">
                <span>${index + 1}. ${crime.type}</span>
                <strong>${crime.count}</strong>
              </div>
            `).join('')}
          </div>
          <div class="crime-list">
            <h4 style="margin-top: 0;">District Breakdown</h4>
            ${summary.districtBreakdown.slice(0, 5).map((district, index: number) => `
              <div class="crime-item">
                <span>${index + 1}. District ${district.district}</span>
                <strong>${district.count}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Data Source:</strong> LA City Open Data Portal (data.lacity.org)</p>
        <p><strong>Report Generated By:</strong> CHNC Crime Dashboard</p>
        <p><strong>Coverage Area:</strong> Hollywood area (LAPD Area 6) within CHNC boundaries</p>
        <p><strong>Note:</strong> This report includes all LAPD-reported incidents within the specified date range and geographic boundaries.</p>
      </div>
    </body>
    </html>
  `;
}
