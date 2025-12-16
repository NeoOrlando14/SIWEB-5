# Upload Format Change - Owner Laporan

## Tanggal Update
2025-12-13

## Overview
Perubahan format upload CSV/JSON di halaman owner-laporan dari menggunakan `produkId` menjadi `nama_produk` dan `jumlah`.

## Motivation

### Masalah Sebelumnya
- Owner harus tahu ID produk untuk upload data
- Tidak intuitif - owner biasanya tahu nama produk, bukan ID
- Tidak ada cara untuk upload multiple quantity dari produk yang sama dalam satu baris
- Tabel hanya menampilkan produk ID, tidak user-friendly

### Solusi
- Upload menggunakan nama produk yang lebih mudah diingat
- Tambahkan field `jumlah` untuk quantity
- Tabel menampilkan nama produk dan jumlah terjual
- Lebih user-friendly untuk owner

## Changes Made

### 1. Upload API - Format Input Baru

**File**: [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js)

#### Format CSV/JSON Baru

**Sebelum:**
```csv
produkId,nama_pembeli,total_harga,tanggal,status
1,John Doe,50000,2024-12-13,selesai
2,Jane Smith,75000,2024-12-13,pending
```

**Sekarang:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah,tanggal,status
Kopi Latte,John Doe,50000,2,2024-12-13,selesai
Kue Coklat,Jane Smith,75000,3,2024-12-13,pending
```

#### Format JSON Baru

**Sebelum:**
```json
[
  {
    "produkId": 1,
    "nama_pembeli": "John Doe",
    "total_harga": 50000,
    "tanggal": "2024-12-13",
    "status": "selesai"
  }
]
```

**Sekarang:**
```json
[
  {
    "nama_produk": "Kopi Latte",
    "nama_pembeli": "John Doe",
    "total_harga": 50000,
    "jumlah": 2,
    "tanggal": "2024-12-13",
    "status": "selesai"
  }
]
```

#### Field Specification

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `nama_produk` | ✅ Yes | String | Nama produk (harus sesuai dengan nama di database) |
| `nama_pembeli` | ✅ Yes | String | Nama pembeli |
| `total_harga` | ✅ Yes | Number | Total harga per item |
| `jumlah` | ⚠️ Optional | Number | Jumlah quantity (default: 1) |
| `tanggal` | ⚠️ Optional | Date | Tanggal transaksi (default: sekarang) |
| `status` | ⚠️ Optional | String | Status transaksi (default: "selesai") |

### 2. API Logic Changes

**File**: [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js:27-73)

#### Before:
```javascript
// Validasi berdasarkan produkId
const cekProduk = await prisma.produk.findUnique({
  where: { id: Number(r.produkId) },
});

// Simpan 1 transaksi per baris
await prisma.transaksi.create({
  data: {
    produkId: Number(r.produkId),
    nama_pembeli: r.nama_pembeli,
    total_harga: Number(r.total_harga),
    tanggal: new Date(r.tanggal),
    status: r.status || "pending",
  },
});
```

#### After:
```javascript
// Validasi berdasarkan nama_produk
const cekProduk = await prisma.produk.findFirst({
  where: { nama: r.nama_produk },
});

if (!cekProduk) {
  return Response.json(
    { error: `Produk dengan nama "${r.nama_produk}" tidak ditemukan di database` },
    { status: 400 }
  );
}

// Lookup product by name
const produk = await prisma.produk.findFirst({
  where: { nama: r.nama_produk },
});

const jumlah = Number(r.jumlah) || 1;
const totalHargaPerItem = Number(r.total_harga);
const tanggal = r.tanggal ? new Date(r.tanggal) : new Date();

// Simpan sejumlah quantity (buat multiple transaksi jika jumlah > 1)
for (let i = 0; i < jumlah; i++) {
  await prisma.transaksi.create({
    data: {
      produkId: produk.id,
      nama_pembeli: r.nama_pembeli,
      total_harga: totalHargaPerItem,
      tanggal: tanggal,
      status: r.status || "selesai",
    },
  });
  totalInserted++;
}
```

**Key Changes:**
1. ✅ Lookup product by `nama` instead of `id`
2. ✅ Create multiple transactions based on `jumlah`
3. ✅ Default `jumlah` to 1 if not provided
4. ✅ Default `tanggal` to current date if not provided
5. ✅ Default `status` to "selesai" instead of "pending"

### 3. Table Display Changes

**File**: [app/owner-laporan/page.js](app/owner-laporan/page.js)

#### Admin Transaksi API Update

**File**: [app/api/admin-transaksi/route.js](app/api/admin-transaksi/route.js:4-16)

```javascript
// Added product relation to include product name
const data = await prisma.transaksi.findMany({
  include: {
    produk: true,  // Include product data
  },
  orderBy: { id: "desc" }
});
```

#### Data Aggregation

**File**: [app/owner-laporan/page.js](app/owner-laporan/page.js:32-60)

```javascript
// Aggregate transactions by product and buyer
const aggregated = {};
data.forEach((t) => {
  const key = `${t.produkId}_${t.nama_pembeli}_${t.status}`;
  if (!aggregated[key]) {
    aggregated[key] = {
      ...t,
      jumlah: 1,
    };
  } else {
    aggregated[key].jumlah += 1;
  }
});
setTransaksi(Object.values(aggregated));
```

**Purpose**: Menggabungkan transaksi dengan produk, pembeli, dan status yang sama untuk menampilkan jumlah total.

#### Table Headers Update

**Before:**
```jsx
<th>Produk ID</th>
```

**After:**
```jsx
<th>Nama Produk</th>
<th>Jumlah Terjual</th>
```

#### Table Data Display

**Before:**
```jsx
<td>{t.produkId}</td>
```

**After:**
```jsx
<td>{t.produk?.nama || "N/A"}</td>
<td>{t.jumlah || 1}</td>
```

### 4. Upload Instructions Update

**File**: [app/owner-laporan/page.js](app/owner-laporan/page.js:253-258)

**Before:**
```jsx
<p className="text-xs text-gray-400 mt-1">
  Kolom minimal: <code>produkId</code>, <code>nama_pembeli</code>,{" "}
  <code>total_harga</code>, (opsional: <code>tanggal</code>,{" "}
  <code>status</code>)
</p>
```

**After:**
```jsx
<p className="text-xs text-gray-400 mt-1">
  Kolom wajib: <code>nama_produk</code>, <code>nama_pembeli</code>,{" "}
  <code>total_harga</code>, <code>jumlah</code> (opsional:{" "}
  <code>tanggal</code>, <code>status</code>)
</p>
```

### 5. Preview Removal

**Removed Features:**
- Preview table sebelum import
- Import to database button
- `handleImport` function
- `previewItems` state
- `importing` state

**Reason**: Upload langsung menyimpan ke database, tidak perlu preview lagi.

**Before Flow:**
```
Upload File → Preview → Klik Simpan → Save to DB → Refresh
```

**After Flow:**
```
Upload File → Save to DB → Auto Refresh → Show Success
```

### 6. Response Handling Update

**File**: [app/owner-laporan/page.js](app/owner-laporan/page.js:98-108)

```javascript
if (json.success) {
  setSuccessMsg(
    `✅ Upload berhasil! ${json.inserted} transaksi berhasil dimasukkan ke database.`
  );
  // Auto refresh table
  loadTransaksi();
} else if (json.error) {
  setErrorMsg("❌ Error upload: " + json.error);
} else if (!res.ok) {
  setErrorMsg("❌ Upload gagal dengan status: " + res.status);
}
```

**Benefits:**
- ✅ Immediate feedback dengan icons (✅/❌)
- ✅ Auto refresh tabel setelah upload berhasil
- ✅ Clear error messages
- ✅ Tidak perlu manual refresh

## Example Usage

### Example 1: Upload Single Product

**CSV File: `laporan_harian.csv`**
```csv
nama_produk,nama_pembeli,total_harga,jumlah,tanggal,status
Kopi Latte,Ahmad,25000,1,2024-12-13,selesai
```

**Result:**
- 1 transaksi dibuat
- Produk: Kopi Latte
- Pembeli: Ahmad
- Total: Rp 25,000
- Jumlah: 1

### Example 2: Upload Multiple Quantity

**CSV File: `laporan_event.csv`**
```csv
nama_produk,nama_pembeli,total_harga,jumlah,tanggal,status
Kue Coklat,Toko Budi,15000,10,2024-12-13,selesai
```

**Result:**
- 10 transaksi dibuat (satu untuk setiap quantity)
- Setiap transaksi: Rp 15,000
- Total di tabel akan teragregasi menampilkan: Jumlah Terjual = 10

### Example 3: JSON Format

**JSON File: `laporan_bulanan.json`**
```json
[
  {
    "nama_produk": "Kopi Americano",
    "nama_pembeli": "Coffee Shop Central",
    "total_harga": 20000,
    "jumlah": 50,
    "tanggal": "2024-12-01",
    "status": "selesai"
  },
  {
    "nama_produk": "Kue Rumah Natal",
    "nama_pembeli": "Bakery Sinar",
    "total_harga": 35000,
    "jumlah": 25,
    "status": "selesai"
  }
]
```

**Result:**
- 75 transaksi dibuat total (50 + 25)
- Data teragregasi di tabel:
  - Kopi Americano - Coffee Shop Central: Jumlah = 50
  - Kue Rumah Natal - Bakery Sinar: Jumlah = 25

## Validation

### Product Name Validation

```javascript
const cekProduk = await prisma.produk.findFirst({
  where: { nama: r.nama_produk },
});

if (!cekProduk) {
  return Response.json(
    { error: `Produk dengan nama "${r.nama_produk}" tidak ditemukan di database` },
    { status: 400 }
  );
}
```

**Error Example:**
```
❌ Error upload: Produk dengan nama "Kopi Latte XXL" tidak ditemukan di database
```

**Important**: Nama produk harus **exact match** dengan nama di database (case-sensitive).

## Benefits

### 1. User-Friendly
- ✅ Owner tidak perlu mengingat ID produk
- ✅ Nama produk lebih mudah diingat
- ✅ Lebih natural untuk bisnis

### 2. Quantity Support
- ✅ Satu baris CSV bisa represent multiple quantity
- ✅ Mengurangi duplikasi data di CSV
- ✅ Lebih efisien untuk bulk upload

### 3. Better Display
- ✅ Tabel menampilkan nama produk (lebih readable)
- ✅ Agregasi quantity untuk view yang lebih clean
- ✅ Owner bisa langsung lihat produk apa yang terjual

### 4. Immediate Feedback
- ✅ Tidak perlu preview dan confirm
- ✅ Langsung save dan refresh
- ✅ Faster workflow

## Migration Guide

### For Existing CSV Files

**Old Format:**
```csv
produkId,nama_pembeli,total_harga
1,John,50000
2,Jane,75000
```

**Convert to New Format:**
1. Replace `produkId` column dengan `nama_produk`
2. Tambahkan column `jumlah`
3. Ganti nilai ID dengan nama produk

```csv
nama_produk,nama_pembeli,total_harga,jumlah
Kopi Latte,John,50000,1
Kue Coklat,Jane,75000,1
```

### Finding Product Names

Query untuk melihat semua nama produk di database:

```sql
SELECT id, nama FROM produk;
```

Atau gunakan halaman admin-product di dashboard untuk melihat daftar produk.

## Testing

### Test Case 1: Valid Product Name
**Input:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah
Kopi Latte,Test User,25000,2
```

**Expected:**
- ✅ 2 transaksi dibuat
- ✅ Success message: "Upload berhasil! 2 transaksi berhasil dimasukkan ke database."
- ✅ Tabel auto refresh
- ✅ Tampil: Kopi Latte | Test User | Jumlah: 2

### Test Case 2: Invalid Product Name
**Input:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah
Kopi Tidak Ada,Test User,25000,1
```

**Expected:**
- ❌ Error message: "Produk dengan nama "Kopi Tidak Ada" tidak ditemukan di database"
- ❌ Tidak ada transaksi yang dibuat

### Test Case 3: Missing Jumlah (Default to 1)
**Input:**
```csv
nama_produk,nama_pembeli,total_harga
Kopi Latte,Test User,25000
```

**Expected:**
- ✅ 1 transaksi dibuat (default jumlah = 1)
- ✅ Success message: "Upload berhasil! 1 transaksi berhasil dimasukkan ke database."

### Test Case 4: Large Quantity
**Input:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah
Kue Coklat,Bulk Order,15000,100
```

**Expected:**
- ✅ 100 transaksi dibuat
- ✅ Success message: "Upload berhasil! 100 transaksi berhasil dimasukkan ke database."
- ✅ Tabel menampilkan: Jumlah Terjual = 100

## Files Modified

1. **[app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js)**
   - Changed validation from `produkId` to `nama_produk`
   - Added quantity loop to create multiple transactions
   - Updated error messages

2. **[app/api/admin-transaksi/route.js](app/api/admin-transaksi/route.js)**
   - Added `include: { produk: true }` to fetch product data

3. **[app/owner-laporan/page.js](app/owner-laporan/page.js)**
   - Added data aggregation by product/buyer/status
   - Updated table headers (Produk ID → Nama Produk, + Jumlah Terjual)
   - Updated table data display to show product name and quantity
   - Updated upload instructions
   - Removed preview functionality
   - Updated response handling to auto-refresh

## Summary

Perubahan ini membuat sistem upload lebih user-friendly dengan:
1. ✅ Menggunakan nama produk instead of ID
2. ✅ Support untuk quantity dalam satu baris
3. ✅ Tabel menampilkan info yang lebih readable
4. ✅ Workflow yang lebih cepat (tanpa preview)
5. ✅ Auto-refresh setelah upload

Owner sekarang bisa upload data dengan format yang lebih natural dan mudah dipahami.
