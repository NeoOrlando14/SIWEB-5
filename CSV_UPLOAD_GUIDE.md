# Panduan Upload CSV/JSON - Case-Insensitive

## Perubahan Terbaru

Sistem upload CSV/JSON sekarang **case-insensitive** (tidak terpatok pada huruf besar/kecil). Anda dapat menggunakan berbagai format penulisan kolom.

## Format Kolom yang Diterima

### Kolom yang Wajib Ada:
1. **nama_produk** - Nama produk (harus sesuai dengan produk di database)
2. **jumlah** - Jumlah/quantity produk
3. **total_harga** - Total harga per item
4. **nama_pembeli** - Nama pembeli/customer

### Kolom Opsional:
- **tanggal** - Tanggal transaksi (jika tidak diisi, akan menggunakan tanggal saat ini)
- **status** - Status transaksi (default: "selesai")
  - Status yang valid: `selesai`, `Selesai`, `diterima`, `Diterima`, `Proses`, `proses`, `Dibatalkan`, `dibatalkan`
  - ⚠️ **PENTING**: Hanya transaksi dengan status `selesai`/`Selesai`/`diterima`/`Diterima` yang akan dihitung dalam **Total Sales** dan **Total Order** di Owner Dashboard
  - Transaksi dengan status `Proses` atau `Dibatalkan` akan muncul di Owner Laporan tapi tidak dihitung dalam pendapatan

## Contoh Format yang Diterima

Sistem akan mengenali SEMUA format berikut:

### Format 1 - Lowercase
```csv
nama_produk,jumlah,total_harga,nama_pembeli,tanggal,status
Nasi Goreng,2,15000,Budi,2025-01-15,selesai
```

### Format 2 - UPPERCASE
```csv
NAMA_PRODUK,JUMLAH,TOTAL_HARGA,NAMA_PEMBELI,TANGGAL,STATUS
Nasi Goreng,2,15000,Budi,2025-01-15,selesai
```

### Format 3 - CamelCase
```csv
Nama_Produk,Jumlah,Total_Harga,Nama_Pembeli,Tanggal,Status
Nasi Goreng,2,15000,Budi,2025-01-15,selesai
```

### Format 4 - Dengan Spasi (akan otomatis diubah ke underscore)
```csv
Nama Produk,Jumlah,Total Harga,Nama Pembeli,Tanggal,Status
Nasi Goreng,2,15000,Budi,2025-01-15,selesai
```

### Format 5 - Mixed Case
```csv
NaMa_PrOdUk,JuMlAh,ToTaL_HaRgA,NaMa_PeMbElI
Nasi Goreng,2,15000,Budi
```

## Contoh File JSON

```json
[
  {
    "Nama_Produk": "Nasi Goreng",
    "Jumlah": 2,
    "Total_Harga": 15000,
    "Nama_Pembeli": "Budi",
    "Tanggal": "2025-01-15",
    "Status": "selesai"
  },
  {
    "nama_produk": "Mie Goreng",
    "jumlah": 1,
    "total_harga": 12000,
    "nama_pembeli": "Ani"
  }
]
```

## Catatan Penting

1. **Nama Produk Case-Insensitive** - Nama produk tidak perlu sesuai huruf besar/kecil. `lapet`, `Lapet`, `LAPET` akan dianggap sama
2. **Kolom Wajib** - Kolom `nama_produk`, `jumlah`, `total_harga`, dan `nama_pembeli` HARUS ada
3. **Format Tanggal** - Gunakan format YYYY-MM-DD (contoh: 2025-01-15)
4. **Huruf Besar/Kecil Tidak Masalah** - Sistem akan otomatis mendeteksi kolom DAN nilai nama produk terlepas dari kapitalisasi
5. **Spasi Otomatis Dikonversi** - Kolom dengan spasi akan diubah ke underscore (misal: "Nama Produk" → "nama_produk")

## Cara Upload

1. Buka halaman **Owner Dashboard** → **Upload Laporan**
2. Pilih file CSV atau JSON
3. Klik tombol **Upload**
4. Sistem akan memvalidasi:
   - Apakah semua kolom wajib ada
   - Apakah nama produk ada di database
   - Format data sudah benar
5. Jika berhasil, akan muncul notifikasi jumlah data yang berhasil dimasukkan

## Pesan Error yang Mungkin Muncul

- **"Kolom yang diperlukan tidak ditemukan: ..."** - Ada kolom wajib yang tidak ditemukan di file
- **"Produk dengan nama ... tidak ditemukan di database"** - Nama produk tidak sesuai dengan database
- **"File tidak memiliki data atau format tidak sesuai"** - File kosong atau format salah

## Tips

- Download file CSV dari Excel dengan encoding UTF-8
- Pastikan tidak ada baris kosong di tengah file
- Gunakan double quote (") untuk nilai yang mengandung koma
- Cek nama produk di menu Admin Product terlebih dahulu sebelum upload
