# Dashboard Filter System

## Overview
Sistem filter untuk dashboard admin yang memungkinkan filtering data berdasarkan periode waktu dengan dua kategori:
1. **Quick Filters**: Hari Ini, Bulan Ini, Tahun Ini
2. **Custom Filters**: Tanggal Tertentu, Bulan Tertentu, Tahun Tertentu

## Features

### Quick Filters
- **📅 Hari Ini**: Menampilkan data transaksi hari ini dengan grafik per jam (24 data points)
- **📊 Bulan Ini**: Menampilkan data transaksi bulan ini dengan grafik per hari (28-31 data points)
- **📈 Tahun Ini**: Menampilkan data transaksi tahun ini dengan grafik per bulan (12 data points)

### Custom Filters
- **📆 Tanggal Tertentu**: Pilih tanggal spesifik (date picker) - grafik per jam
- **📅 Bulan Tertentu**: Pilih bulan spesifik (month picker) - grafik per hari
- **📊 Tahun Tertentu**: Pilih tahun spesifik (number input) - grafik per bulan

## Implementasi

### 1. Frontend - Filter Buttons
**File:** [app/admin-dashboard/page.js](app/admin-dashboard/page.js:193-224)

```javascript
const [filter, setFilter] = useState("month"); // default: month

// Filter Buttons UI
<div className="flex gap-3 mb-6">
  <button
    onClick={() => setFilter("day")}
    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
      filter === "day"
        ? "bg-blue-600 text-white shadow-lg scale-105"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📅 Hari Ini
  </button>
  <button
    onClick={() => setFilter("month")}
    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
      filter === "month"
        ? "bg-blue-600 text-white shadow-lg scale-105"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📊 Bulan Ini
  </button>
  <button
    onClick={() => setFilter("year")}
    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
      filter === "year"
        ? "bg-blue-600 text-white shadow-lg scale-105"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📈 Tahun Ini
  </button>
</div>
```

### 2. Frontend - Fetch with Filter
**File:** [app/admin-dashboard/page.js](app/admin-dashboard/page.js:95-108)

```javascript
const fetchMetrics = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`/api/admin-metric?filter=${filter}`);
    if (!res.ok) throw new Error("Gagal mengambil data");
    const data = await res.json();
    setMetrics(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// Re-fetch when filter changes
useEffect(() => {
  if (typeof window !== "undefined") {
    const isLoggedIn = window.localStorage.getItem("isLoggedIn");
    const role = window.localStorage.getItem("role");

    if (isLoggedIn === "true" && role === "admin") {
      fetchMetrics();
    }
  }
}, [filter]);
```

### 3. Backend - Date Range Calculation
**File:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:7-27)

```javascript
export async function GET(req) {
  try {
    // Get filter parameter from query string
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "month"; // default: month

    // Calculate date range based on filter
    const now = new Date();
    let startDate, endDate;

    if (filter === "day") {
      // Today only
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (filter === "month") {
      // This month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (filter === "year") {
      // This year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }
```

### 4. Backend - Filtered Metrics
**File:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:29-77)

All metrics filtered by date range except `totalProduk`:

```javascript
// TOTAL PRODUK (tidak terfilter, karena ini total keseluruhan)
const totalProduk = await prisma.produk.count();

// TOTAL ORDER (filtered by date range)
const totalOrder = await prisma.transaksi.count({
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
});

// TOTAL SALES (filtered by date range)
const totalSalesAgg = await prisma.transaksi.aggregate({
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  _sum: { total_harga: true },
});

// PRODUK TERLARIS (filtered by date range)
const top = await prisma.transaksi.groupBy({
  by: ["produkId"],
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  _count: { produkId: true },
  orderBy: { _count: { produkId: "desc" } },
  take: 1,
});
```

### 5. Backend - Dynamic Graph Data
**File:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:79-147)

Graph data structure changes based on filter:

#### Filter: Day (Hari Ini)
- **X-Axis**: Per jam (00:00, 01:00, ..., 23:00)
- **Data Points**: 24 jam
- **Grouping**: Transaksi dikelompokkan per jam

```javascript
if (filter === "day") {
  // Grafik per jam (24 jam)
  const hourlyTotals = {};
  for (let i = 0; i < 24; i++) {
    hourlyTotals[i] = 0;
  }

  transaksiFiltered.forEach((tr) => {
    const hour = tr.tanggal.getHours();
    hourlyTotals[hour] += tr.total_harga || 0;
  });

  grafikData = Object.entries(hourlyTotals).map(([hour, total]) => ({
    tanggal: `${hour.toString().padStart(2, "0")}:00`,
    total,
  }));
}
```

#### Filter: Month (Bulan Ini)
- **X-Axis**: Per tanggal (01, 02, 03, ..., 28/29/30/31)
- **Data Points**: Sesuai jumlah hari dalam bulan
- **Grouping**: Transaksi dikelompokkan per hari

```javascript
else if (filter === "month") {
  // Grafik per hari dalam bulan ini
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyTotals = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    dailyTotals[dateKey] = 0;
  }

  transaksiFiltered.forEach((tr) => {
    const dateStr = tr.tanggal.toISOString().slice(0, 10);
    if (dailyTotals.hasOwnProperty(dateStr)) {
      dailyTotals[dateStr] += tr.total_harga || 0;
    }
  });

  grafikData = Object.entries(dailyTotals).map(([tanggal, total]) => ({
    tanggal: tanggal.slice(8, 10), // Hanya tampilkan tanggal (01, 02, dst)
    total,
  }));
}
```

#### Filter: Year (Tahun Ini)
- **X-Axis**: Per bulan (Jan, Feb, Mar, ..., Des)
- **Data Points**: 12 bulan
- **Grouping**: Transaksi dikelompokkan per bulan

```javascript
else if (filter === "year") {
  // Grafik per bulan (12 bulan)
  const monthlyTotals = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (let i = 0; i < 12; i++) {
    monthlyTotals[i] = 0;
  }

  transaksiFiltered.forEach((tr) => {
    const month = tr.tanggal.getMonth();
    monthlyTotals[month] += tr.total_harga || 0;
  });

  grafikData = Object.entries(monthlyTotals).map(([month, total]) => ({
    tanggal: monthNames[parseInt(month)],
    total,
  }));
}
```

## Custom Filter Implementation

### 1. Custom Date Filter (Tanggal Tertentu)
**File:** [app/admin-dashboard/page.js](app/admin-dashboard/page.js:242-262)

```javascript
const [customDate, setCustomDate] = useState("");

// UI with date picker
<div className="flex items-center gap-2">
  <button
    onClick={() => setFilter("custom_date")}
    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
      filter === "custom_date"
        ? "bg-green-600 text-white shadow-lg"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📆 Tanggal Tertentu
  </button>
  {filter === "custom_date" && (
    <input
      type="date"
      value={customDate}
      onChange={(e) => setCustomDate(e.target.value)}
      className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-green-500"
    />
  )}
</div>
```

**API Handler:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:30-38)
```javascript
else if (filter === "custom_date" && customDate) {
  // Specific date (YYYY-MM-DD)
  const dateParts = customDate.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);

  startDate = new Date(year, month, day, 0, 0, 0);
  endDate = new Date(year, month, day, 23, 59, 59);
}
```

### 2. Custom Month Filter (Bulan Tertentu)
**File:** [app/admin-dashboard/page.js](app/admin-dashboard/page.js:264-284)

```javascript
const [customMonth, setCustomMonth] = useState("");

// UI with month picker
<div className="flex items-center gap-2">
  <button
    onClick={() => setFilter("custom_month")}
    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
      filter === "custom_month"
        ? "bg-purple-600 text-white shadow-lg"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📅 Bulan Tertentu
  </button>
  {filter === "custom_month" && (
    <input
      type="month"
      value={customMonth}
      onChange={(e) => setCustomMonth(e.target.value)}
      className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-purple-500"
    />
  )}
</div>
```

**API Handler:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:39-46)
```javascript
else if (filter === "custom_month" && customMonth) {
  // Specific month (YYYY-MM)
  const monthParts = customMonth.split("-");
  const year = parseInt(monthParts[0]);
  const month = parseInt(monthParts[1]) - 1;

  startDate = new Date(year, month, 1);
  endDate = new Date(year, month + 1, 0, 23, 59, 59);
}
```

### 3. Custom Year Filter (Tahun Tertentu)
**File:** [app/admin-dashboard/page.js](app/admin-dashboard/page.js:286-309)

```javascript
const [customYear, setCustomYear] = useState("");

// UI with number input
<div className="flex items-center gap-2">
  <button
    onClick={() => setFilter("custom_year")}
    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
      filter === "custom_year"
        ? "bg-orange-600 text-white shadow-lg"
        : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
    }`}
  >
    📊 Tahun Tertentu
  </button>
  {filter === "custom_year" && (
    <input
      type="number"
      min="2020"
      max="2099"
      placeholder="YYYY"
      value={customYear}
      onChange={(e) => setCustomYear(e.target.value)}
      className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-orange-500 w-24"
    />
  )}
</div>
```

**API Handler:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js:47-52)
```javascript
else if (filter === "custom_year" && customYear) {
  // Specific year (YYYY)
  const year = parseInt(customYear);

  startDate = new Date(year, 0, 1);
  endDate = new Date(year, 11, 31, 23, 59, 59);
}
```

## Filter Comparison

| Filter | Total Produk | Total Order | Total Sales | Produk Terlaris | Grafik X-Axis | Data Points | Input Type |
|--------|--------------|-------------|-------------|-----------------|---------------|-------------|------------|
| **📅 Hari Ini** | All time | Today | Today | Today | Per jam (00:00-23:00) | 24 | Button |
| **📊 Bulan Ini** | All time | This month | This month | This month | Per tanggal (01-31) | 28-31 | Button |
| **📈 Tahun Ini** | All time | This year | This year | This year | Per bulan (Jan-Des) | 12 | Button |
| **📆 Tanggal Tertentu** | All time | Selected date | Selected date | Selected date | Per jam (00:00-23:00) | 24 | Date Picker |
| **📅 Bulan Tertentu** | All time | Selected month | Selected month | Selected month | Per tanggal (01-31) | 28-31 | Month Picker |
| **📊 Tahun Tertentu** | All time | Selected year | Selected year | Selected year | Per bulan (Jan-Des) | 12 | Number Input |

## UI/UX Features

### 1. Active State Indication

**Quick Filters (Blue Theme)**:
- Active: Blue background (#3B82F6), white text, scale 105%, shadow
- Inactive: Dark background, gray text, hover effect

**Custom Filters (Colored Themes)**:
- **Tanggal Tertentu**: Green (#059669) when active
- **Bulan Tertentu**: Purple (#9333EA) when active
- **Tahun Tertentu**: Orange (#EA580C) when active

### 2. Conditional Input Display
- Date picker only shown when "Tanggal Tertentu" is active
- Month picker only shown when "Bulan Tertentu" is active
- Year input only shown when "Tahun Tertentu" is active

### 3. Auto Refresh
- Data automatically refreshes when filter changes
- Data automatically refreshes when custom date/month/year changes
- Loading state displayed during fetch

### 4. Input Styling
- Dark theme inputs matching dashboard design
- Focus border color matches button color (green/purple/orange)
- White text on dark background for better readability

### 5. Default State
- Default filter: "month" (Bulan Ini)
- Custom inputs start empty

## API Response Format

```json
{
  "totalProduk": 15,
  "totalOrder": 42,
  "totalSales": 2500000,
  "produkTerlaris": "Nasi Goreng",
  "grafikData": [
    { "tanggal": "01", "total": 50000 },
    { "tanggal": "02", "total": 75000 },
    ...
  ]
}
```

## Benefits

### Quick Filters
1. **Instant Access**: Langsung filter data hari ini, bulan ini, atau tahun ini dengan satu klik
2. **No Input Required**: Tidak perlu memasukkan tanggal, otomatis menggunakan tanggal sistem

### Custom Filters
1. **Historical Analysis**: Melihat data transaksi dari periode masa lalu
2. **Specific Period**: Analisis detail untuk tanggal/bulan/tahun tertentu
3. **Comparative Analysis**: Membandingkan performa periode yang berbeda

### Overall Benefits
1. **Flexible Analysis**: Admin dapat melihat performa dalam berbagai periode
2. **Detailed Insights**:
   - **Tanggal**: Melihat jam-jam sibuk transaksi pada hari tertentu
   - **Bulan**: Tracking performa harian untuk bulan tertentu
   - **Tahun**: Trend bulanan untuk planning tahunan
3. **Real-time**: Data selalu up-to-date berdasarkan database
4. **User-Friendly**:
   - Interface intuitif dengan visual indicator
   - Native date/month picker untuk kemudahan input
   - Color-coded untuk membedakan jenis filter
5. **Responsive**: Auto-refresh ketika filter atau tanggal berubah

## Use Cases

### Scenario 1: Analisis Penjualan Hari Libur
Admin ingin melihat performa penjualan pada tanggal 17 Agustus 2024:
1. Klik "📆 Tanggal Tertentu"
2. Pilih tanggal 2024-08-17 dari date picker
3. Lihat grafik per jam untuk mengetahui jam sibuk

### Scenario 2: Perbandingan Bulanan
Admin ingin membandingkan penjualan Desember 2024 vs Desember 2023:
1. Klik "📅 Bulan Tertentu", pilih 2024-12
2. Lihat total sales dan grafik harian
3. Klik lagi, pilih 2023-12
4. Bandingkan hasilnya

### Scenario 3: Trend Tahunan
Admin ingin melihat trend penjualan tahun 2023:
1. Klik "📊 Tahun Tertentu"
2. Input "2023"
3. Lihat grafik bulanan untuk mengidentifikasi bulan dengan performa terbaik

## Technical Notes

### Date Format
- **Custom Date**: YYYY-MM-DD (e.g., 2024-12-13)
- **Custom Month**: YYYY-MM (e.g., 2024-12)
- **Custom Year**: YYYY (e.g., 2024)

### Graph Behavior
Custom filters menggunakan logic yang sama dengan quick filters:
- `custom_date` = sama dengan `day` (grafik per jam)
- `custom_month` = sama dengan `month` (grafik per hari)
- `custom_year` = sama dengan `year` (grafik per bulan)

### API Query String Examples
```
/api/admin-metric?filter=custom_date&date=2024-12-13
/api/admin-metric?filter=custom_month&month=2024-12
/api/admin-metric?filter=custom_year&year=2024
```

## Date Implemented
2025-12-13 (Updated with custom filters)
