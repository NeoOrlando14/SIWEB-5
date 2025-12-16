# Sistem Manajemen Stok Produk

## Konsep Sistem Stok

### Stok di Database = Stok Real yang Tersedia

Sistem ini menggunakan pendekatan **manual stock management** dimana:
- ✅ Stok di database adalah **stok real** yang tersedia untuk customer
- ✅ Admin/Owner mengelola stok **secara manual** (tambah/kurangi)
- ✅ Stok **TIDAK** otomatis berkurang saat ada transaksi
- ✅ Admin bertanggung jawab update stok sesuai kondisi real

## Mengapa Sistem Manual?

### 1. Fleksibilitas
- Owner bisa menambah stok kapan saja (restock)
- Owner bisa mengurangi stok jika ada kerusakan/expired
- Tidak terikat pada perhitungan otomatis

### 2. Kontrol Penuh
- Owner yang tahu kondisi real stok di toko fisik
- Bisa adjust stok sesuai kondisi aktual
- Bisa handle situasi khusus (promosi, pre-order, dll)

### 3. Sederhana dan Jelas
- Stok yang ditampilkan = Stok di database
- Tidak ada perhitungan kompleks
- Mudah dipahami dan dikelola

## Alur Kerja Sistem

### 1. Menampilkan Stok ke Customer

**API:** [app/api/products/route.js](app/api/products/route.js)

```javascript
export async function GET() {
  try {
    // Ambil stok langsung dari database
    const products = await prisma.produk.findMany({
      orderBy: { id: "asc" },
    });

    return Response.json(products);
  }
}
```

**Halaman Home:** [app/home/page.js](app/home/page.js#L145)

```javascript
{product.stok > 0 ? (
  <p className="text-green-400 text-xs mt-1">
    Stok: {product.stok}  // ✅ Stok langsung dari database
  </p>
) : (
  <p className="text-red-400 text-xs mt-1">Habis</p>
)}
```

### 2. Mengelola Stok (Admin/Owner)

#### A. Menambah Stok (Restock)

**Cara 1: Via Admin Product Page**
1. Login sebagai Admin
2. Buka halaman **Admin Product**
3. Klik **Edit** pada produk
4. Update field **Stok** (misalnya dari 10 menjadi 100)
5. Simpan

**Cara 2: Via API**
```javascript
PUT /api/products/update-stok
{
  "id": 1,
  "amount": 50  // Tambah 50 stok
}
```

#### B. Mengurangi Stok (Barang Rusak/Expired)

**Via API:**
```javascript
PUT /api/products/update-stok
{
  "id": 1,
  "amount": -10  // Kurangi 10 stok
}
```

### 3. Workflow Lengkap

```
┌─────────────────────────────────────────────────────┐
│  1. RESTOCK BARANG (di Toko Fisik)                 │
│     Owner beli 100 unit "lapet"                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  2. UPDATE STOK DI SISTEM                           │
│     Admin login → Edit Produk                       │
│     Stok "lapet": 10 → 110                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  3. CUSTOMER LIHAT DI HOME                          │
│     Tampilan: "Stok: 110" ✅                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  4. CUSTOMER BELI (Transaksi Selesai)               │
│     10 customer beli "lapet"                        │
│     Stok di sistem: MASIH 110 ⚠️                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  5. OWNER CEK STOK FISIK                            │
│     Stok fisik tersisa: 100 unit                    │
│     Stok di sistem: 110 unit (belum update)         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  6. OWNER UPDATE STOK DI SISTEM                     │
│     Admin login → Edit Produk                       │
│     Stok "lapet": 110 → 100 ✅                      │
└─────────────────────────────────────────────────────┘
```

## Tanggung Jawab Owner/Admin

### 1. Update Stok Secara Berkala

Owner harus **rutin update** stok di sistem agar sesuai dengan stok fisik:

- ✅ **Setiap pagi**: Cek stok fisik vs stok di sistem
- ✅ **Setelah transaksi besar**: Update stok manual
- ✅ **Setelah restock**: Update stok dengan jumlah baru
- ✅ **Jika ada barang rusak/expired**: Kurangi stok

### 2. Monitoring

Owner bisa monitor lewat:

1. **Owner Laporan** - Lihat total transaksi
2. **Stok Fisik** - Hitung manual di toko
3. **Sistem** - Cek stok di Admin Product

## Keuntungan Sistem Manual

| Aspek | Keuntungan |
|-------|-----------|
| **Fleksibilitas** | Bisa adjust stok kapan saja sesuai kondisi real |
| **Kontrol** | Owner punya kontrol penuh atas stok |
| **Sederhana** | Tidak ada perhitungan kompleks, langsung dari DB |
| **Restock** | Mudah menambah stok saat restock |
| **Handle Kasus Khusus** | Bisa handle barang rusak, promosi, pre-order |

## Kekurangan & Solusi

### Kekurangan:
- ⚠️ **Stok tidak otomatis berkurang** saat ada transaksi
- ⚠️ **Memerlukan update manual** dari owner

### Solusi:
1. **Rutinitas Owner**: Set jadwal update stok setiap hari
2. **Notifikasi**: (Future) Tambahkan notifikasi jika ada gap antara transaksi vs stok
3. **Laporan Harian**: Owner bisa cek laporan transaksi untuk tahu berapa yang terjual

## Contoh Kasus

### Kasus 1: Restock Normal

**Situasi:**
- Stok lapet di sistem: 5
- Stok fisik: 5
- Owner beli 100 unit baru

**Langkah:**
1. Owner terima barang 100 unit
2. Admin login → Edit Produk "lapet"
3. Update stok: 5 + 100 = **105**
4. Customer lihat stok di Home: **105** ✅

### Kasus 2: Ada Transaksi

**Situasi:**
- Stok di sistem: 105
- 20 customer beli via aplikasi
- Stok di sistem: MASIH 105 (belum update)

**Langkah:**
1. Owner cek stok fisik: tersisa 85 unit
2. Admin login → Edit Produk "lapet"
3. Update stok manual: 105 → **85**
4. Customer lihat stok di Home: **85** ✅

### Kasus 3: Barang Rusak/Expired

**Situasi:**
- Stok di sistem: 85
- 10 unit rusak/kadaluarsa
- Stok fisik real: 75

**Langkah:**
1. Owner buang 10 unit rusak
2. Admin login → Edit Produk "lapet"
3. Update stok: 85 → **75**
4. Customer lihat stok di Home: **75** ✅

### Kasus 4: Stok Habis di Sistem tapi Ada di Toko

**Situasi:**
- Stok di sistem: 0 (Tampilan "Habis")
- Stok fisik: 50 unit (Owner lupa update setelah restock)

**Masalah:**
- Customer lihat "Habis" ❌
- Padahal ada stok di toko ❌
- Lost sales opportunity ❌

**Solusi:**
1. Owner ingat ada stok 50 unit
2. Admin login → Edit Produk "lapet"
3. Update stok: 0 → **50**
4. Customer lihat stok di Home: **50** ✅

**Pelajaran:** Owner harus rajin update stok agar tidak kehilangan peluang penjualan!

## API untuk Manajemen Stok

### 1. GET Products (Untuk Customer)
```
GET /api/products

Response:
[
  {
    "id": 1,
    "nama": "lapet",
    "harga": 5000,
    "stok": 100,  // Stok dari database
    "image": "...",
    "rating": 5
  }
]
```

### 2. Update Stok (Untuk Admin)
```
PUT /api/products/update-stok

Request:
{
  "id": 1,
  "amount": 50  // Positif = tambah, Negatif = kurangi
}

Response:
{
  "id": 1,
  "nama": "lapet",
  "stok": 150  // Stok baru setelah ditambah 50
}
```

### 3. Edit Produk (Untuk Admin)
```
PUT /api/products/[id]

Request:
{
  "nama": "lapet",
  "harga": 5000,
  "stok": 200,  // Set stok langsung
  "image": "..."
}
```

## Best Practices

### Untuk Owner/Admin:

1. ✅ **Update Stok Setiap Pagi**
   - Cek stok fisik
   - Bandingkan dengan sistem
   - Update jika ada perbedaan

2. ✅ **Setelah Restock**
   - Langsung update stok di sistem
   - Jangan tunggu customer complain "Habis"

3. ✅ **Monitor Transaksi**
   - Cek Owner Laporan setiap hari
   - Hitung berapa yang terjual
   - Update stok sesuai kondisi fisik

4. ✅ **Catat Stok Fisik**
   - Buat catatan stok harian
   - Bandingkan dengan sistem
   - Identifikasi selisih (hilang, rusak, dll)

### Untuk Developer:

1. ✅ **Keep It Simple**
   - Stok = Data dari database
   - Tidak ada perhitungan kompleks
   - Mudah di-maintain

2. ✅ **Provide Tools**
   - API update stok yang mudah
   - UI admin yang user-friendly
   - Laporan yang informatif

3. ✅ **Future Enhancement**
   - Notifikasi jika stok < threshold
   - Reminder untuk owner update stok
   - Integration dengan sistem kasir (jika ada)

## File yang Terkait

### 1. [app/api/products/route.js](app/api/products/route.js)
- GET: Ambil stok langsung dari database
- POST: Tambah produk baru dengan stok

### 2. [app/api/products/update-stok/route.js](app/api/products/update-stok/route.js)
- PUT: Update stok (tambah/kurangi)
- Validasi tidak boleh negatif

### 3. [app/home/page.js](app/home/page.js)
- Tampilkan stok dari database
- Tampilkan "Habis" jika stok = 0

### 4. [app/admin-product/page.js](app/admin-product/page.js)
- Form edit produk termasuk stok
- Admin bisa update stok manual

## Kesimpulan

Sistem stok ini menggunakan **pendekatan manual** dimana:
- ✅ Stok di database = Stok real yang tersedia
- ✅ Owner mengelola stok secara manual
- ✅ Sederhana, fleksibel, dan mudah dikontrol
- ⚠️ Memerlukan disiplin owner untuk update rutin

**Owner bertanggung jawab** untuk:
- Update stok setelah restock
- Update stok setelah ada transaksi
- Update stok jika ada barang rusak/expired
- Monitoring stok agar selalu akurat

**Stok yang ditampilkan ke customer = Stok di database** ✅
