# Hollywood Crime Data Dashboard

A modern web application for analyzing LA City crime data in Hollywood reporting districts, built for the Central Hollywood Neighborhood Council (CHNC).

## Features

### 🎯 **Core Functionality**
- **Date Range Selection**: Automatically discovers available data ranges from the LA City API
- **Interactive Map**: Visual representation of the 7 Hollywood reporting districts
- **Real-time Data Fetching**: Robust pagination system handles datasets of any size
- **Comprehensive Reporting**: Both summary dashboard and detailed data views

### 📊 **Summary Dashboard**
- Key crime statistics and metrics
- Interactive charts showing crime type distribution
- Geographic breakdown by district
- Daily crime trends
- Special crime category tracking (domestic violence, gang-related, etc.)

### 📋 **Detailed Data Table**
- Sortable columns with visual indicators
- Advanced filtering by district, crime type, and status
- Full-text search across all fields
- Pagination with configurable page sizes
- Crime flag indicators (DV, Gang, Hate, Transit)

### 📁 **Export Options**
- CSV export with proper formatting
- JSON export for data analysis
- Automatic file naming with date ranges

## Technology Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **API**: LA City Open Data Portal (Socrata SODA API)
- **Deployment**: Optimized for Vercel

## Coverage Area

The dashboard covers 7 Hollywood LAPD reporting districts:
- **645**: Hollywood Core (Central entertainment district)
- **646**: Central Hollywood (High foot traffic area)
- **647**: Hollywood North (Residential with commercial mix)
- **666**: Hollywood West (Mixed residential/commercial)
- **663**: Hollywood East (Residential area)
- **656**: Hollywood South (Mixed-use area)
- **676**: Hollywood Fringe (Peripheral area)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chnc-crime-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## API Integration

The application integrates with the LA City Open Data Portal:
- **Dataset**: LAPD NIBRS Offenses Dataset
- **API Endpoint**: `https://data.lacity.org/resource/y8y3-fqfu.json`
- **Documentation**: [LA City Data Portal](https://data.lacity.org/api/v3/views/y8y3-fqfu)

### Robust Data Handling
- Automatic pagination for datasets > 1000 records
- Fallback mechanisms for API limits
- Error handling and user feedback
- Progress tracking for large queries

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Deploy

The application is optimized for Vercel's serverless functions and edge runtime.

### Environment Variables

No environment variables are required for basic functionality. The application uses public LA City APIs.

## Usage

1. **Select Date Range**: Choose from preset ranges or custom dates
2. **View Coverage**: See the Hollywood districts map
3. **Generate Report**: Click to fetch and analyze crime data
4. **Explore Data**: Switch between Summary and Detailed views
5. **Export Results**: Download data in CSV or JSON format

## Data Sources

- **LA City Open Data Portal**: Real-time crime data
- **LAPD NIBRS System**: Standardized crime reporting
- **Coverage**: March 2024 onwards (when LAPD switched to NIBRS)

## Contributing

This project is maintained for the Central Hollywood Neighborhood Council. For questions or contributions, please contact the CHNC.

## License

Built for public use by the Central Hollywood Neighborhood Council.

---

**Note**: This application provides crime data for informational purposes. For emergencies, always call 911. For non-emergency police matters, contact LAPD at (877) ASK-LAPD.
