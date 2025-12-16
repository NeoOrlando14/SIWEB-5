# Fix: CSV Upload Case-Insensitive

## Masalah Sebelumnya

Sebelumnya, sistem upload CSV/JSON mengharuskan nama kolom yang **PERSIS** sama dengan format database:
- `nama_produk`
- `jumlah`
- `total_harga`
- `nama_pembeli`
- `tanggal`
- `status`

Jika user menggunakan format lain seperti:
- `Nama_Produk` ❌
- `NAMA_PRODUK` ❌
- `Nama Produk` ❌

Upload akan **GAGAL** karena sistem tidak mengenali kolom tersebut.

## Solusi yang Diterapkan

### 1. Normalisasi Nama Kolom (Case-Insensitive)

File: [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js#L23-L43)

Sistem sekarang:
- ✅ Mengubah semua nama kolom menjadi **lowercase**
- ✅ Menghapus **spasi** di awal/akhir nama kolom
- ✅ Mengubah **spasi** menjadi **underscore** (_)
- ✅ Mendukung **semua format kapitalisasi**

```javascript
// Normalisasi nama kolom menjadi lowercase untuk case-insensitive
records = parsed.data.map(row => {
  const normalizedRow = {};
  for (let key in row) {
    // Ubah nama kolom menjadi lowercase dan hapus spasi
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
    normalizedRow[normalizedKey] = row[key];
  }
  return normalizedRow;
});
```

### 2. Validasi Kolom yang Lebih Informatif

File: [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js#L46-L67)

Sistem sekarang memberikan pesan error yang lebih jelas:
```javascript
const requiredColumns = ['nama_produk', 'jumlah', 'total_harga', 'nama_pembeli'];

if (missingColumns.length > 0) {
  return Response.json(
    {
      error: `Kolom yang diperlukan tidak ditemukan: ${missingColumns.join(', ')}.
              Pastikan file CSV/JSON memiliki kolom: ${requiredColumns.join(', ')}
              (huruf besar/kecil tidak masalah)`
    },
    { status: 400 }
  );
}
```

## Format yang Sekarang Diterima

### ✅ Format 1: lowercase
```csv
nama_produk,jumlah,total_harga,nama_pembeli
Nasi Goreng,2,15000,Budi
```

### ✅ Format 2: UPPERCASE
```csv
NAMA_PRODUK,JUMLAH,TOTAL_HARGA,NAMA_PEMBELI
Nasi Goreng,2,15000,Budi
```

### ✅ Format 3: CamelCase
```csv
Nama_Produk,Jumlah,Total_Harga,Nama_Pembeli
Nasi Goreng,2,15000,Budi
```

### ✅ Format 4: Dengan Spasi
```csv
Nama Produk,Jumlah,Total Harga,Nama Pembeli
Nasi Goreng,2,15000,Budi
```

### ✅ Format 5: Mixed Case
```csv
NaMa_PrOdUk,JuMlAh,ToTaL_HaRgA,NaMa_PeMbElI
Nasi Goreng,2,15000,Budi
```

## File Contoh yang Tersedia

1. **[contoh-upload.csv](contoh-upload.csv)** - Format CamelCase
2. **[contoh-upload-uppercase.csv](contoh-upload-uppercase.csv)** - Format UPPERCASE
3. **[contoh-upload-spasi.csv](contoh-upload-spasi.csv)** - Format dengan spasi
4. **[contoh-upload.json](contoh-upload.json)** - Format JSON dengan berbagai kapitalisasi

## Cara Testing

1. Jalankan development server:
```bash
npm run dev
```

2. Login sebagai **Owner**

3. Buka halaman **Owner Dashboard** → **Upload Laporan**

4. Upload salah satu file contoh:
   - `contoh-upload.csv`
   - `contoh-upload-uppercase.csv`
   - `contoh-upload-spasi.csv`
   - `contoh-upload.json`

5. Pastikan upload berhasil dengan berbagai format kapitalisasi

## Pesan Error yang Mungkin Muncul

### Error 1: Kolom Tidak Ditemukan
```
❌ Kolom yang diperlukan tidak ditemukan: nama_produk, jumlah.
   Pastikan file CSV/JSON memiliki kolom: nama_produk, jumlah, total_harga, nama_pembeli
   (huruf besar/kecil tidak masalah)
```
**Solusi**: Pastikan semua kolom wajib ada di file CSV/JSON

### Error 2: Produk Tidak Ditemukan
```
❌ Produk dengan nama "Nasi Goreng" tidak ditemukan di database
```
**Solusi**: Tambahkan produk di menu Admin Product terlebih dahulu

### Error 3: File Kosong
```
❌ File tidak memiliki data atau format tidak sesuai
```
**Solusi**: Pastikan file CSV/JSON memiliki minimal 1 baris data

## Manfaat

1. ✅ **User-Friendly**: User tidak perlu khawatir tentang kapitalisasi kolom
2. ✅ **Fleksibel**: Mendukung berbagai format export dari Excel, Google Sheets, dll
3. ✅ **Error Handling**: Pesan error yang lebih jelas dan informatif
4. ✅ **Robust**: Menangani spasi dan variasi penulisan kolom
5. ✅ **Kompatibel**: Mendukung CSV dan JSON dengan normalisasi yang sama

## File yang Diubah

1. **[app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js)** - API endpoint untuk upload
   - Baris 18-44: Normalisasi nama kolom untuk CSV dan JSON
   - Baris 46-67: Validasi kolom yang lebih informatif
   - Baris 69-89: Validasi produk dengan pesan error yang jelas

## Dokumentasi Terkait

- **[CSV_UPLOAD_GUIDE.md](CSV_UPLOAD_GUIDE.md)** - Panduan lengkap upload CSV/JSON
- **[UPLOAD_FORMAT_CHANGE.md](UPLOAD_FORMAT_CHANGE.md)** - Dokumentasi perubahan format sebelumnya

## Catatan Penting

- ✅ **Nama produk sekarang case-insensitive!** - `lapet`, `Lapet`, `LAPET`, atau `LaPeT` akan dianggap sama
- ✅ **Nama kolom juga case-insensitive** - `nama_produk`, `NAMA_PRODUK`, `Nama_Produk` semua diterima
- ⚠️ Kolom wajib: `nama_produk`, `jumlah`, `total_harga`, `nama_pembeli`
- ⚠️ Kolom opsional: `tanggal`, `status`
- ✅ Sistem akan otomatis menggunakan tanggal saat ini jika kolom `tanggal` tidak diisi
- ✅ Sistem akan otomatis menggunakan status "selesai" jika kolom `status` tidak diisi
