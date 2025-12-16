# Custom Date Filter System

## Overview
Sistem filter kustom untuk dashboard admin yang memungkinkan admin memilih tanggal, bulan, atau tahun tertentu untuk analisis data historis.

## Tanggal Implementasi
2025-12-13

## Features Added

### 1. 📆 Filter Tanggal Tertentu (Custom Date)
- **Input Type**: HTML5 Date Picker (`<input type="date">`)
- **Format**: YYYY-MM-DD
- **Grafik**: Per jam (00:00 - 23:00) - 24 data points
- **Use Case**: Analisis transaksi pada hari spesifik (misal: hari libur, event khusus)

### 2. 📅 Filter Bulan Tertentu (Custom Month)
- **Input Type**: HTML5 Month Picker (`<input type="month">`)
- **Format**: YYYY-MM
- **Grafik**: Per tanggal (01 - 31) - 28-31 data points
- **Use Case**: Perbandingan performa bulanan antar tahun

### 3. 📊 Filter Tahun Tertentu (Custom Year)
- **Input Type**: Number Input (`<input type="number">`)
- **Format**: YYYY
- **Range**: 2020 - 2099
- **Grafik**: Per bulan (Jan - Des) - 12 data points
- **Use Case**: Analisis trend tahunan historis

## Files Modified

### Frontend
**File**: [app/admin-dashboard/page.js](app/admin-dashboard/page.js)

**Changes**:
1. Added state variables:
   ```javascript
   const [customDate, setCustomDate] = useState("");
   const [customMonth, setCustomMonth] = useState("");
   const [customYear, setCustomYear] = useState("");
   ```

2. Updated `fetchMetrics()` to include custom parameters:
   ```javascript
   if (filter === "custom_date" && customDate) {
     url += `&date=${customDate}`;
   } else if (filter === "custom_month" && customMonth) {
     url += `&month=${customMonth}`;
   } else if (filter === "custom_year" && customYear) {
     url += `&year=${customYear}`;
   }
   ```

3. Updated useEffect dependencies:
   ```javascript
   }, [filter, customDate, customMonth, customYear]);
   ```

4. Added UI for custom filters with conditional rendering

### Backend
**File**: [app/api/admin-metric/route.js](app/api/admin-metric/route.js)

**Changes**:
1. Added parameter extraction:
   ```javascript
   const customDate = searchParams.get("date");
   const customMonth = searchParams.get("month");
   const customYear = searchParams.get("year");
   ```

2. Added date range calculation for custom filters:
   ```javascript
   // Custom Date
   else if (filter === "custom_date" && customDate) {
     const dateParts = customDate.split("-");
     const year = parseInt(dateParts[0]);
     const month = parseInt(dateParts[1]) - 1;
     const day = parseInt(dateParts[2]);
     startDate = new Date(year, month, day, 0, 0, 0);
     endDate = new Date(year, month, day, 23, 59, 59);
   }

   // Custom Month
   else if (filter === "custom_month" && customMonth) {
     const monthParts = customMonth.split("-");
     const year = parseInt(monthParts[0]);
     const month = parseInt(monthParts[1]) - 1;
     startDate = new Date(year, month, 1);
     endDate = new Date(year, month + 1, 0, 23, 59, 59);
   }

   // Custom Year
   else if (filter === "custom_year" && customYear) {
     const year = parseInt(customYear);
     startDate = new Date(year, 0, 1);
     endDate = new Date(year, 11, 31, 23, 59, 59);
   }
   ```

3. Updated graph data logic to support custom filters:
   ```javascript
   if (filter === "day" || filter === "custom_date") {
     // Grafik per jam
   } else if (filter === "month" || filter === "custom_month") {
     // Grafik per hari (with dynamic month/year)
   } else if (filter === "year" || filter === "custom_year") {
     // Grafik per bulan
   }
   ```

## UI Design

### Layout
- **Row 1**: Quick filters (Hari Ini, Bulan Ini, Tahun Ini) - Blue theme
- **Row 2**: Custom filters (Tanggal, Bulan, Tahun Tertentu) - Colored theme

### Color Coding
- **Quick Filters**: Blue (#3B82F6) when active
- **Custom Date**: Green (#059669) when active
- **Custom Month**: Purple (#9333EA) when active
- **Custom Year**: Orange (#EA580C) when active

### Conditional Rendering
Input fields only appear when their respective filter is active:
```javascript
{filter === "custom_date" && (
  <input type="date" value={customDate} onChange={...} />
)}
```

### Styling
- Dark background: `bg-[#2a2a2a]`
- Border: `border-gray-700`
- Text: White
- Focus border: Matches button color (green/purple/orange)

## User Experience

### Workflow Example: Analisis Tanggal Spesifik

1. **User clicks** "📆 Tanggal Tertentu"
   - Button turns green
   - Date picker appears next to button

2. **User selects date** from picker
   - `customDate` state updates (e.g., "2024-12-13")
   - useEffect triggers

3. **fetchMetrics() runs**
   - URL: `/api/admin-metric?filter=custom_date&date=2024-12-13`
   - Loading state shows

4. **API processes request**
   - Parses date: 2024-12-13
   - Sets date range: 2024-12-13 00:00:00 to 2024-12-13 23:59:59
   - Queries transactions in range
   - Generates hourly graph data

5. **Dashboard updates**
   - Metrics show data for that specific date
   - Graph shows hourly breakdown (00:00 - 23:00)

## API Examples

### Request URLs
```
GET /api/admin-metric?filter=custom_date&date=2024-08-17
GET /api/admin-metric?filter=custom_month&month=2024-12
GET /api/admin-metric?filter=custom_year&year=2023
```

### Response Format
Same as existing quick filters:
```json
{
  "totalProduk": 15,
  "totalOrder": 5,
  "totalSales": 150000,
  "produkTerlaris": "Nasi Goreng",
  "grafikData": [
    { "tanggal": "00:00", "total": 0 },
    { "tanggal": "01:00", "total": 0 },
    ...
    { "tanggal": "13:00", "total": 50000 },
    ...
    { "tanggal": "23:00", "total": 0 }
  ]
}
```

## Comparison: Quick vs Custom Filters

| Aspect | Quick Filters | Custom Filters |
|--------|--------------|----------------|
| **Input Required** | No | Yes |
| **Date Selection** | Automatic (system date) | Manual (user picks) |
| **Use Case** | Real-time monitoring | Historical analysis |
| **Speed** | Faster (1 click) | Slower (2 steps) |
| **Flexibility** | Limited to current period | Any past/future date |
| **Color Theme** | Blue | Green/Purple/Orange |

## Benefits

### For Admin
1. **Historical Analysis**: Lihat performa dari periode masa lalu
2. **Comparative Study**: Bandingkan periode yang sama di tahun berbeda
3. **Event Analysis**: Analisis performa saat event/promo tertentu
4. **Trend Identification**: Identifikasi pattern dari data historis

### For Business
1. **Better Planning**: Data historis untuk planning periode mendatang
2. **Performance Tracking**: Monitor improvement/decline antar periode
3. **Strategic Decisions**: Data-driven decisions berdasarkan trend

## Technical Considerations

### Date Parsing
- Backend menggunakan `split()` untuk parse string format
- Month di JavaScript zero-based (0-11), perlu adjust `-1`
- Day of month di JavaScript one-based (1-31)

### Timezone
- Date range menggunakan local timezone
- `00:00:00` dan `23:59:59` untuk boundary yang tepat

### Graph Consistency
- Custom filters menggunakan logic grafik yang sama dengan quick filters
- `custom_date` = `day` (hourly)
- `custom_month` = `month` (daily)
- `custom_year` = `year` (monthly)

### Input Validation
- Date input: Browser native validation
- Month input: Browser native validation (format YYYY-MM)
- Year input: `min="2020" max="2099"` attribute

## Future Enhancements (Potential)

1. **Date Range Filter**: Select start date and end date
2. **Quarter Filter**: Q1, Q2, Q3, Q4
3. **Week Filter**: Specific week selection
4. **Preset Periods**: Last 7 days, Last 30 days, Last 90 days
5. **Custom Comparison**: Side-by-side comparison of two periods

## Testing Scenarios

### Test Case 1: Filter Tanggal Tertentu
1. Click "📆 Tanggal Tertentu"
2. Select date: 2024-12-01
3. Verify: Graph shows hourly data for Dec 1, 2024
4. Verify: Metrics show totals for that date only

### Test Case 2: Filter Bulan Tertentu
1. Click "📅 Bulan Tertentu"
2. Select month: 2024-11
3. Verify: Graph shows daily data (01-30 November)
4. Verify: Metrics show totals for November 2024

### Test Case 3: Filter Tahun Tertentu
1. Click "📊 Tahun Tertentu"
2. Input year: 2023
3. Verify: Graph shows monthly data (Jan-Dec 2023)
4. Verify: Metrics show totals for year 2023

### Test Case 4: Switch Between Filters
1. Select "Bulan Ini" (quick filter)
2. Switch to "📆 Tanggal Tertentu"
3. Pick a date
4. Verify: Data updates correctly
5. Switch back to "Bulan Ini"
6. Verify: Returns to current month data

## Summary

Custom date filters menambahkan fleksibilitas signifikan pada dashboard admin dengan memungkinkan analisis data historis. Implementasi menggunakan HTML5 native date inputs untuk UX yang optimal, dengan color-coding yang jelas untuk membedakan quick vs custom filters. Backend logic reusable dan maintainable dengan conditional branching yang clean.
