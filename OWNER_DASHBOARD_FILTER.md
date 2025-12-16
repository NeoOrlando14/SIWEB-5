# Owner Dashboard Filter System

## Overview
Sistem filter dashboard untuk owner dengan fitur yang identik dengan admin dashboard, memungkinkan owner untuk menganalisis data penjualan berdasarkan periode waktu tertentu.

## Tanggal Implementasi
2025-12-13

## Features

### Quick Filters
- **📅 Hari Ini**: Data transaksi hari ini dengan grafik per jam (24 data points)
- **📊 Bulan Ini**: Data transaksi bulan ini dengan grafik per hari (28-31 data points)
- **📈 Tahun Ini**: Data transaksi tahun ini dengan grafik per bulan (12 data points)

### Custom Filters
- **📆 Tanggal Tertentu**: Pilih tanggal spesifik dengan date picker - grafik per jam
- **📅 Bulan Tertentu**: Pilih bulan spesifik dengan month picker - grafik per hari
- **📊 Tahun Tertentu**: Input tahun spesifik (2020-2099) - grafik per bulan

## Implementation

### 1. API Endpoint - Owner Metric
**File**: [app/api/owner-metric/route.js](app/api/owner-metric/route.js)

API endpoint ini identik dengan admin-metric tetapi khusus untuk owner dashboard.

```javascript
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "month";
    const customDate = searchParams.get("date");
    const customMonth = searchParams.get("month");
    const customYear = searchParams.get("year");

    // Calculate date range based on filter
    // ... (same logic as admin-metric)

    // Query database for metrics
    const totalProduk = await prisma.produk.count();
    const totalOrder = await prisma.transaksi.count({ where: { tanggal: { gte: startDate, lte: endDate } } });
    const totalSales = await prisma.transaksi.aggregate({ where: { tanggal: { gte: startDate, lte: endDate } }, _sum: { total_harga: true } });

    // Generate graph data
    // ... (same logic as admin-metric)

    return Response.json({
      totalProduk,
      totalOrder,
      totalSales,
      produkTerlaris,
      grafikData,
    });
  } catch (err) {
    console.error("Error owner-metric:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

**Note**: Data key untuk grafik menggunakan `jumlah` (bukan `total`) untuk konsistensi dengan implementasi owner dashboard yang sudah ada.

### 2. Frontend - Owner Dashboard
**File**: [app/owner-dashboard/page.js](app/owner-dashboard/page.js)

#### State Management
```javascript
const [stats, setStats] = useState(null);
const [chartData, setChartData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filter, setFilter] = useState("month"); // default: month
const [customDate, setCustomDate] = useState("");
const [customMonth, setCustomMonth] = useState("");
const [customYear, setCustomYear] = useState("");
```

#### Fetch Function
```javascript
const fetchMetrics = async () => {
  setLoading(true);
  setError(null);
  try {
    let url = `/api/owner-metric?filter=${filter}`;

    // Add custom date parameters
    if (filter === "custom_date" && customDate) {
      url += `&date=${customDate}`;
    } else if (filter === "custom_month" && customMonth) {
      url += `&month=${customMonth}`;
    } else if (filter === "custom_year" && customYear) {
      url += `&year=${customYear}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data");
    const data = await res.json();

    setStats({
      totalProduk: data.totalProduk,
      totalOrder: data.totalOrder,
      totalSales: data.totalSales,
      produkTerlaris: data.produkTerlaris,
    });
    setChartData(data.grafikData);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### Auto-Refresh on Filter Change
```javascript
useEffect(() => {
  if (typeof window === "undefined") return;

  const role = window.localStorage.getItem("role");
  if (role === "owner") {
    fetchMetrics();
  }
}, [filter, customDate, customMonth, customYear]);
```

#### Filter UI
Same as admin dashboard - two rows of filter buttons with conditional input display.

**Quick Filters (Row 1)**:
- Blue theme buttons for Hari Ini, Bulan Ini, Tahun Ini

**Custom Filters (Row 2)**:
- Green button + date picker for Tanggal Tertentu
- Purple button + month picker for Bulan Tertentu
- Orange button + number input for Tahun Tertentu

#### Loading & Error States
```javascript
// Loading skeleton
{loading && (
  <div className="grid grid-cols-4 gap-6 mb-10 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-gray-800 h-24 rounded-xl"></div>
    ))}
  </div>
)}

// Error display
{error && (
  <div className="mb-10 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
    Error: {error}
  </div>
)}

// Stats display when loaded
{!loading && stats && (
  <div className="grid grid-cols-4 gap-6 mb-10">
    {/* Stats cards */}
  </div>
)}
```

#### Graph with Loading State
```javascript
{loading && (
  <div className="w-full h-72 bg-gray-800 rounded animate-pulse"></div>
)}

{!loading && chartData.length > 0 && (
  <div className="w-full h-72">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis dataKey="tanggal" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip contentStyle={{ background: "#222", borderColor: "#555", color: "#fff" }} />
        <Line type="monotone" dataKey="jumlah" stroke="#4fc3f7" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

{!loading && chartData.length === 0 && (
  <div className="w-full h-72 flex items-center justify-center text-gray-500">
    Tidak ada data untuk periode ini
  </div>
)}
```

## Differences from Admin Dashboard

| Aspect | Admin Dashboard | Owner Dashboard |
|--------|----------------|-----------------|
| **API Endpoint** | `/api/admin-metric` | `/api/owner-metric` |
| **Graph Data Key** | `total` | `jumlah` |
| **Chart Type** | LineChart + BarChart | LineChart only |
| **Role Check** | `role === "admin"` | `role === "owner"` |
| **Sidebar Icons** | More options | Limited to Dashboard, Laporan, Poin |

## API Response Format

```json
{
  "totalProduk": 13,
  "totalOrder": 5,
  "totalSales": 11205000,
  "produkTerlaris": "Kue Rumah Natal",
  "grafikData": [
    { "tanggal": "01", "jumlah": 50000 },
    { "tanggal": "02", "jumlah": 75000 },
    ...
  ]
}
```

**Note**: Graph data uses `jumlah` key instead of `total` to match the existing owner dashboard implementation.

## Files Modified

1. **Created**: [app/api/owner-metric/route.js](app/api/owner-metric/route.js)
   - New API endpoint for owner metrics
   - Identical logic to admin-metric
   - Returns data with `jumlah` key for graph

2. **Modified**: [app/owner-dashboard/page.js](app/owner-dashboard/page.js)
   - Added filter state variables
   - Implemented fetchMetrics function
   - Added filter UI (quick + custom filters)
   - Added loading and error states
   - Replaced static data with dynamic API calls

## Benefits for Owner

1. **Real-time Data**: Owner sekarang melihat data real dari database, bukan data statis
2. **Historical Analysis**: Analisis performa dari periode masa lalu
3. **Flexible Reporting**: Filter berdasarkan hari, bulan, atau tahun tertentu
4. **Better Planning**: Data historis untuk membuat keputusan bisnis
5. **Consistent UX**: Experience yang sama dengan admin dashboard

## Use Cases

### Scenario 1: Monthly Performance Review
Owner ingin review performa bulan lalu:
1. Klik "📅 Bulan Tertentu"
2. Pilih bulan sebelumnya
3. Analisis total sales dan produk terlaris

### Scenario 2: Year-over-Year Comparison
Owner ingin bandingkan tahun ini vs tahun lalu:
1. Klik "📊 Tahun Tertentu"
2. Input tahun sebelumnya
3. Catat metrics
4. Input tahun ini
5. Bandingkan hasilnya

### Scenario 3: Event Performance
Owner ingin lihat performa saat event khusus:
1. Klik "📆 Tanggal Tertentu"
2. Pilih tanggal event
3. Lihat breakdown per jam untuk jam sibuk

## Technical Notes

### Data Migration
- Sebelumnya: Hardcoded static data
- Sekarang: Dynamic data from database via API

### Graph Data Format
Owner dashboard menggunakan key `jumlah` untuk konsistensi dengan chart yang sudah ada:
```javascript
grafikData = Object.entries(hourlyTotals).map(([hour, total]) => ({
  tanggal: `${hour.toString().padStart(2, "0")}:00`,
  jumlah: total, // Note: "jumlah" instead of "total"
}));
```

### Role Protection
```javascript
const role = window.localStorage.getItem("role");
if (!role || role !== "owner") {
  alert("Halaman ini khusus Owner!");
  router.push("/login");
  return;
}
```

## Future Enhancements

1. **Export Data**: Download metrics as PDF/Excel
2. **Comparison View**: Side-by-side comparison of two periods
3. **Bar Chart**: Add bar chart option like admin dashboard
4. **Advanced Metrics**: Profit margin, customer retention, etc.
5. **Notifications**: Alert when sales drop below threshold

## Testing

### Test Case 1: Quick Filter - Bulan Ini
1. Login as owner
2. Default should show current month data
3. Verify metrics are from current month
4. Verify graph shows daily data

### Test Case 2: Custom Filter - Tanggal Tertentu
1. Click "📆 Tanggal Tertentu"
2. Select a specific date
3. Verify metrics update
4. Verify graph shows hourly data

### Test Case 3: Error Handling
1. Disconnect from database
2. Try to fetch metrics
3. Verify error message displays
4. Verify UI doesn't crash

### Test Case 4: Loading State
1. Throttle network to slow 3G
2. Change filter
3. Verify loading skeleton appears
4. Verify smooth transition to data

## Summary

Owner dashboard sekarang memiliki fitur filtering yang lengkap dan konsisten dengan admin dashboard. Perubahan dari data statis ke data dinamis memberikan owner visibility yang lebih baik terhadap performa bisnis, dengan kemampuan untuk menganalisis periode tertentu dan membuat keputusan berbasis data.
