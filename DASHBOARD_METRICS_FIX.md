# 📊 Dashboard Metrics Fix - Filter Status "Diterima"

## 🔍 Masalah

Dashboard Admin dan Owner menampilkan statistik yang **mencakup semua transaksi** (pending, diterima, ditolak), padahal seharusnya hanya menampilkan transaksi dengan status **"diterima"** saja.

### Dampak:
- **Total Order**: Termasuk transaksi pending dan ditolak
- **Total Sales**: Menghitung pendapatan dari transaksi yang belum/tidak diterima
- **Produk Terlaris**: Termasuk produk dari transaksi pending/ditolak
- **Grafik Penjualan**: Menampilkan data yang tidak akurat

---

## ✅ Solusi

Menambahkan filter `status: "diterima"` pada semua query transaksi di kedua API endpoint.

---

## 🔧 Files Modified

### 1. Admin Metric API
**File:** [app/api/admin-metric/route.js](app/api/admin-metric/route.js)

**Changes Applied:**

#### Total Order (Line 58-67)
```javascript
// ❌ SEBELUM: Menghitung semua transaksi
const totalOrder = await prisma.transaksi.count({
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
});

// ✅ SETELAH: Hanya transaksi diterima
const totalOrder = await prisma.transaksi.count({
  where: {
    status: "diterima",
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
});
```

#### Total Sales (Line 69-79)
```javascript
// ❌ SEBELUM: Menghitung pendapatan dari semua transaksi
const totalSalesAgg = await prisma.transaksi.aggregate({
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  _sum: { total_harga: true },
});

// ✅ SETELAH: Hanya transaksi diterima
const totalSalesAgg = await prisma.transaksi.aggregate({
  where: {
    status: "diterima",
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  _sum: { total_harga: true },
});
```

#### Produk Terlaris (Line 83-96)
```javascript
// ❌ SEBELUM: Termasuk produk dari transaksi pending/ditolak
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

// ✅ SETELAH: Hanya produk dari transaksi diterima
const top = await prisma.transaksi.groupBy({
  by: ["produkId"],
  where: {
    status: "diterima",
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

#### Grafik Data (Line 108-118)
```javascript
// ❌ SEBELUM: Grafik termasuk semua transaksi
const transaksiFiltered = await prisma.transaksi.findMany({
  where: {
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: { tanggal: "asc" },
});

// ✅ SETELAH: Grafik hanya transaksi diterima
const transaksiFiltered = await prisma.transaksi.findMany({
  where: {
    status: "diterima",
    tanggal: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: { tanggal: "asc" },
});
```

---

### 2. Owner Metric API
**File:** [app/api/owner-metric/route.js](app/api/owner-metric/route.js)

**Perubahan yang sama diterapkan:**
- ✅ Total Order: Filter `status: "diterima"` (Line 58-67)
- ✅ Total Sales: Filter `status: "diterima"` (Line 69-79)
- ✅ Produk Terlaris: Filter `status: "diterima"` (Line 83-96)
- ✅ Grafik Data: Filter `status: "diterima"` (Line 108-118)

---

## 📊 Hasil Setelah Fix

### Admin Dashboard
- **Total Order**: Hanya menghitung transaksi yang sudah diterima ✅
- **Total Sales**: Pendapatan riil dari transaksi yang sudah diterima ✅
- **Produk Terlaris**: Berdasarkan transaksi yang sudah diterima ✅
- **Grafik**: Menampilkan tren penjualan yang akurat ✅

### Owner Dashboard
- **Total Order**: Hanya transaksi diterima ✅
- **Total Sales**: Pendapatan yang sudah confirmed ✅
- **Produk Terlaris**: Produk dengan penjualan aktual terbanyak ✅
- **Grafik**: Data penjualan yang akurat ✅

---

## 🧪 Testing

### Step 1: Cek Data Awal
1. Login sebagai admin/owner
2. Catat angka **Total Order** dan **Total Sales**

### Step 2: Buat Transaksi Pending
1. Login sebagai customer
2. Buat transaksi baru (status: pending)
3. Kembali ke admin/owner dashboard
4. **Expected**: Angka Total Order dan Total Sales **TIDAK BERUBAH** ✅

### Step 3: Terima Transaksi
1. Login sebagai admin
2. Ubah status transaksi menjadi "diterima"
3. Kembali ke admin/owner dashboard
4. **Expected**: Angka Total Order **+1** dan Total Sales **bertambah** ✅

### Step 4: Tolak Transaksi
1. Buat transaksi baru
2. Ubah status menjadi "ditolak"
3. Cek dashboard
4. **Expected**: Angka **TIDAK BERUBAH** (transaksi ditolak tidak dihitung) ✅

---

## 📝 Catatan Penting

### Status Transaksi:
- ✅ **diterima**: Dihitung dalam statistik
- ❌ **pending**: TIDAK dihitung
- ❌ **ditolak**: TIDAK dihitung

### Alasan:
Hanya transaksi yang **sudah dikonfirmasi diterima** yang benar-benar terjadi dan menghasilkan pendapatan. Transaksi pending dan ditolak tidak boleh dihitung karena:
- **Pending**: Belum dikonfirmasi, bisa dibatalkan
- **Ditolak**: Transaksi gagal, tidak menghasilkan penjualan

### Grafik:
Sebelum fix, grafik bisa menampilkan spike yang misleading jika ada banyak transaksi pending. Setelah fix, grafik hanya menampilkan penjualan aktual yang sudah dikonfirmasi.

---

## 🔄 Impact Summary

| Metric | Before | After |
|--------|--------|-------|
| Total Order | Semua transaksi (pending + diterima + ditolak) | Hanya transaksi diterima ✅ |
| Total Sales | Termasuk pending/ditolak | Hanya pendapatan confirmed ✅ |
| Produk Terlaris | Data tidak akurat | Data berdasarkan penjualan aktual ✅ |
| Grafik | Data misleading | Data penjualan akurat ✅ |

---

**Date:** 2025-12-14
**Status:** ✅ Fixed & Production Ready
**Files Modified:** 2 (admin-metric, owner-metric)
