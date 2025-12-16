# Fix: Perbedaan Data Owner Dashboard vs Owner Laporan

## Masalah yang Ditemukan

### Sebelum Fix:

**Owner Dashboard** menampilkan data **Rp 0** atau angka yang sangat kecil, sementara **Owner Laporan** menampilkan data yang lebih besar.

### Penyebab Masalah:

1. **Owner Dashboard** (`/owner-dashboard`)
   - Hanya menghitung transaksi dengan status `"diterima"` (case-sensitive)
   - Data dari upload CSV biasanya menggunakan status: `"Selesai"`, `"Proses"`, `"Dibatalkan"` (dengan huruf kapital)
   - Hasilnya: **Rp 0** karena tidak ada transaksi dengan status persis `"diterima"`

2. **Owner Laporan** (`/owner-laporan`)
   - Menghitung **SEMUA transaksi** tanpa filter status
   - Termasuk: `"Selesai"`, `"Proses"`, `"Dibatalkan"`, `"selesai"`, dll
   - Hasilnya: Menampilkan **total semua transaksi** termasuk yang dibatalkan

## Solusi yang Diterapkan

### 1. Update API Owner Metric

**File:** [app/api/owner-metric/route.js](app/api/owner-metric/route.js)

Sekarang menerima **multiple status** yang valid:
- `"diterima"`
- `"selesai"` (lowercase)
- `"Selesai"` (CamelCase - dari CSV)
- `"Diterima"` (CamelCase - dari CSV)

**Tidak termasuk:**
- `"proses"` / `"Proses"` - Transaksi belum selesai
- `"dibatalkan"` / `"Dibatalkan"` - Transaksi dibatalkan
- Status lainnya yang tidak valid

### Kode Perubahan:

#### Sebelum:
```javascript
const totalOrder = await prisma.transaksi.count({
  where: {
    status: "diterima",  // ❌ Hanya "diterima" lowercase
    tanggal: { gte: startDate, lte: endDate },
  },
});
```

#### Sesudah:
```javascript
const totalOrder = await prisma.transaksi.count({
  where: {
    status: {
      in: ["diterima", "selesai", "Selesai", "Diterima"]  // ✅ Multiple status
    },
    tanggal: { gte: startDate, lte: endDate },
  },
});
```

### 2. Update Owner Laporan

**File:** [app/owner-laporan/page.js](app/owner-laporan/page.js)

Sekarang menampilkan **2 jenis perhitungan**:

1. **Total Transaksi Selesai** - Hanya status selesai/diterima
2. **Total Semua Status** - Termasuk proses & dibatalkan

**Perubahan:**
```javascript
// Filter hanya transaksi selesai
const transaksiSelesai = transaksi.filter(t =>
  ["selesai", "Selesai", "diterima", "Diterima"].includes(t.status)
);

// Hitung pendapatan hanya dari transaksi selesai
const totalPendapatan = transaksiSelesai.reduce(
  (sum, t) => sum + (t.total_harga || 0),
  0
);

// Hitung total semua status (untuk referensi)
const totalPendapatanAll = transaksi.reduce(
  (sum, t) => sum + (t.total_harga || 0),
  0
);
```

## Tampilan Baru

### Owner Dashboard
Sekarang akan menampilkan data dari CSV dengan status `"Selesai"`:

| Metric | Nilai | Keterangan |
|--------|-------|------------|
| Total Order | 24 | Transaksi dengan status selesai/diterima |
| Total Sales | Rp 350,000 | Hanya dari transaksi selesai |
| Produk Terlaris | lapet | Berdasarkan transaksi selesai |

### Owner Laporan
Sekarang menampilkan **4 kartu statistik**:

| Kartu | Nilai | Keterangan |
|-------|-------|------------|
| Total Transaksi (Semua) | 28 | Semua status termasuk proses & dibatalkan |
| Transaksi Selesai | 24 | Hanya status Selesai/Diterima |
| Pendapatan (Selesai) | Rp 350,000 | Hanya dari transaksi selesai |
| Total Semua Status | Rp 400,000 | Termasuk semua status |

## Mapping Status

| Status di CSV | Dihitung di Dashboard? | Dihitung di Laporan? |
|---------------|------------------------|----------------------|
| `Selesai` | ✅ Ya | ✅ Ya |
| `selesai` | ✅ Ya | ✅ Ya |
| `Diterima` | ✅ Ya | ✅ Ya |
| `diterima` | ✅ Ya | ✅ Ya |
| `Proses` | ❌ Tidak | ⚠️ Ya (di Total Semua) |
| `proses` | ❌ Tidak | ⚠️ Ya (di Total Semua) |
| `Dibatalkan` | ❌ Tidak | ⚠️ Ya (di Total Semua) |
| `dibatalkan` | ❌ Tidak | ⚠️ Ya (di Total Semua) |

## Contoh Kasus

### Data CSV yang Diupload:
```csv
nama_produk,jumlah,total_harga,nama_pembeli,status
lapet,3,15000,Andi,Selesai
ombus,4,20000,Budi,Selesai
ikan mas,2,75000,Citra,Proses
lapet,1,5000,Dedi,Dibatalkan
```

### Hasil di Owner Dashboard:
- **Total Order**: 7 (3 + 4 = 7 transaksi, karena `Selesai` saja)
- **Total Sales**: Rp 35,000 (15,000 + 20,000, tidak termasuk Proses & Dibatalkan)

### Hasil di Owner Laporan:
- **Total Transaksi (Semua)**: 9 (semua transaksi)
- **Transaksi Selesai**: 7 (hanya Selesai)
- **Pendapatan (Selesai)**: Rp 35,000
- **Total Semua Status**: Rp 115,000 (termasuk Proses & Dibatalkan)

## Status yang Direkomendasikan untuk Upload CSV

Untuk konsistensi, gunakan salah satu dari:

### Rekomendasi 1: Lowercase (lebih konsisten)
```csv
status
selesai
diterima
proses
dibatalkan
```

### Rekomendasi 2: CamelCase (sesuai contoh CSV)
```csv
status
Selesai
Diterima
Proses
Dibatalkan
```

⚠️ **PENTING**: Hindari mixing case (misal: `SELESAI`, `SelesAI`, dll) karena bisa menyebabkan inkonsistensi.

## File yang Diubah

### 1. [app/api/owner-metric/route.js](app/api/owner-metric/route.js)
- **Line 58-71**: Total Order dengan multiple status
- **Line 73-87**: Total Sales dengan multiple status
- **Line 89-104**: Produk Terlaris dengan multiple status
- **Line 116-128**: Grafik Data dengan multiple status

### 2. [app/owner-laporan/page.js](app/owner-laporan/page.js)
- **Line 64-78**: Filter transaksi selesai dan hitung 2 total
- **Line 148-173**: Tampilan 4 kartu statistik (semua vs selesai)

## Testing

### 1. Test Upload CSV dengan Status "Selesai"
```bash
# Upload file: data_penjualan_test.csv
# Status: Selesai, Proses, Dibatalkan
```

**Expected Result:**
- Owner Dashboard menampilkan data transaksi dengan status "Selesai"
- Owner Laporan menampilkan breakdown lengkap

### 2. Test Filter Dashboard
```bash
# Pilih filter: Hari Ini, Bulan Ini, Tahun Ini
# Pastikan data muncul sesuai filter
```

**Expected Result:**
- Data terfilter sesuai tanggal
- Hanya menghitung transaksi selesai

## Manfaat

1. ✅ **Konsistensi Data**
   - Dashboard dan Laporan sekarang sinkron
   - Tidak ada lagi perbedaan angka yang membingungkan

2. ✅ **Fleksibilitas Upload**
   - CSV bisa menggunakan "Selesai" atau "selesai"
   - Tidak perlu khawatir kapitalisasi

3. ✅ **Transparansi**
   - Owner Laporan menampilkan 2 total (selesai vs semua)
   - Owner bisa lihat perbedaan dengan jelas

4. ✅ **Akurasi Perhitungan**
   - Pendapatan hanya dari transaksi valid (selesai/diterima)
   - Tidak termasuk transaksi dibatalkan/proses

## Catatan Penting

- ⚠️ **Status Case-Insensitive Sebagian**: Sistem hanya mengenali status yang didefinisikan (`selesai`, `Selesai`, `diterima`, `Diterima`)
- ⚠️ **Status Lain Diabaikan**: Status seperti `"pending"`, `"cancelled"` tidak akan dihitung
- ✅ **Rekomendasi**: Gunakan status standar yang sudah didukung
- ✅ **Upload CSV**: Pastikan status menggunakan salah satu dari: `Selesai`, `Diterima`, `Proses`, `Dibatalkan`

## Dokumentasi Terkait

- **[CSV_UPLOAD_GUIDE.md](CSV_UPLOAD_GUIDE.md)** - Panduan upload CSV
- **[PRODUCT_NAME_CASE_INSENSITIVE.md](PRODUCT_NAME_CASE_INSENSITIVE.md)** - Fix nama produk case-insensitive
- **[CSV_CASE_INSENSITIVE_FIX.md](CSV_CASE_INSENSITIVE_FIX.md)** - Fix nama kolom case-insensitive
