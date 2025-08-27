import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { format } from 'date-fns';

// Chart.js configuration
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width: 800, 
  height: 400,
  backgroundColour: 'white'
});

interface CrimeData {
  date_rptd: string;
  crm_cd_desc: string;
  area_name: string;
  rpt_dist_no: string;
  [key: string]: any;
}

interface PDFRequest {
  crimeData: CrimeData[];
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalIncidents: number;
    topCrimeTypes: Array<{ type: string; count: number }>;
    districtBreakdown: Array<{ district: string; count: number }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { crimeData, dateRange, summary }: PDFRequest = await request.json();

    // Generate charts
    const trendsChart = await generateTrendsChart(crimeData);
    const districtChart = await generateDistrictChart(summary.districtBreakdown);

    // Generate HTML template
    const htmlContent = generateHTMLTemplate({
      crimeData,
      dateRange,
      summary,
      trendsChart: trendsChart.toString('base64'),
      districtChart: districtChart.toString('base64'),
    });

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

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

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CHNC-Crime-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generateTrendsChart(crimeData: CrimeData[]): Promise<Buffer> {
  // Group data by month
  const monthlyData = crimeData.reduce((acc, crime) => {
    const month = format(new Date(crime.date_rptd), 'yyyy-MM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedMonths = Object.keys(monthlyData).sort();
  const counts = sortedMonths.map(month => monthlyData[month]);

  const configuration = {
    type: 'line' as const,
    data: {
      labels: sortedMonths.map(month => format(new Date(month + '-01'), 'MMM yyyy')),
      datasets: [{
        label: 'Crime Incidents',
        data: counts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Crime Trends Over Time',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Incidents'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function generateDistrictChart(districtData: Array<{ district: string; count: number }>): Promise<Buffer> {
  const configuration = {
    type: 'bar' as const,
    data: {
      labels: districtData.map(d => `District ${d.district}`),
      datasets: [{
        label: 'Incidents',
        data: districtData.map(d => d.count),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#8b5cf6', 
          '#3b82f6', '#22c55e', '#ec4899'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Incidents by District',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Incidents'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

function generateHTMLTemplate(data: {
  crimeData: CrimeData[];
  dateRange: { start: string; end: string };
  summary: any;
  trendsChart: string;
  districtChart: string;
}): string {
  const { crimeData, dateRange, summary, trendsChart, districtChart } = data;
  
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

        <div class="chart-container">
          <img src="data:image/png;base64,${trendsChart}" alt="Crime Trends Chart" />
        </div>

        <div class="chart-container">
          <img src="data:image/png;base64,${districtChart}" alt="District Distribution Chart" />
        </div>

        <h2 class="section-title">Top Crime Types</h2>
        <div class="top-crimes">
          <div class="crime-list">
            <h4 style="margin-top: 0;">Most Common Incidents</h4>
            ${summary.topCrimeTypes.slice(0, 5).map((crime: any, index: number) => `
              <div class="crime-item">
                <span>${index + 1}. ${crime.type}</span>
                <strong>${crime.count}</strong>
              </div>
            `).join('')}
          </div>
          <div class="crime-list">
            <h4 style="margin-top: 0;">District Breakdown</h4>
            ${summary.districtBreakdown.slice(0, 5).map((district: any, index: number) => `
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
