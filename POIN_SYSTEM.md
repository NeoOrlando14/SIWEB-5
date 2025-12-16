# 🎁 Sistem Poin Customer - Dokumentasi

## 📋 Overview

Sistem poin otomatis yang memberikan reward kepada customer setiap kali mereka menyelesaikan transaksi (status: **diterima**).

---

## ✨ Fitur

- ✅ **Auto-increment poin** saat transaksi diterima
- ✅ **Khusus role customer** - hanya customer yang dapat poin
- ✅ **Tampilan poin real-time** di halaman transaksi
- ✅ **Notifikasi poin** saat pembayaran berhasil
- ✅ **API endpoint** untuk cek poin user

---

## 🗄️ Database Schema

### Table: `users`

Kolom baru yang ditambahkan:

| Kolom | Type | Default | Deskripsi |
|-------|------|---------|-----------|
| `poin` | `Int` | `0` | Total poin customer |

### Table: `Transaksi`

Kolom baru yang ditambahkan:

| Kolom | Type | Default | Deskripsi |
|-------|------|---------|-----------|
| `userId` | `Int?` | `null` | ID user yang melakukan transaksi |

**Migration:**
```prisma
model users {
  id       Int       @id @default(autoincrement())
  email    String    @unique @db.VarChar(100)
  password String    @db.VarChar(255)
  phone    String?   @db.VarChar(20)
  dob      DateTime? @db.Date
  role     String?   @default("customer") @db.VarChar(20)
  poin     Int       @default(0)  // ← BARU
}

model Transaksi {
  id           Int      @id @default(autoincrement())
  produkId     Int
  nama_pembeli String
  userId       Int?     // ← BARU
  tanggal      DateTime @default(now())
  total_harga  Int
  status       String?  @default("pending")
  produk       Produk   @relation(fields: [produkId], references: [id])
}
```

**Command:**
```bash
npx prisma db push
```

---

## 🔄 Cara Kerja Sistem

### Flow Diagram:

```
┌─────────────────────────────────────────────────┐
│  Customer melakukan transaksi (status: pending) │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Customer bayar via QRIS                        │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Klik "Saya sudah bayar"                        │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  API: PUT /api/admin-transaksi/[id]             │
│  Body: { status: "diterima" }                   │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Cek status lama      │
        │  vs status baru       │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  Status berubah dari  │
        │  "pending" → "diterima"? │
        └───────────┬───────────┘
                    │
            ┌───────┴───────┐
            │ Ya            │ Tidak
            ▼               ▼
    ┌─────────────┐   ┌──────────┐
    │ Cari user   │   │ Selesai  │
    │ by email    │   └──────────┘
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Role =      │
    │ customer?   │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │ Ya          │ Tidak
    ▼             ▼
┌─────────┐  ┌──────────┐
│ poin++  │  │ Skip     │
│ (+1)    │  │          │
└─────────┘  └──────────┘
```

---

## 📁 File yang Dimodifikasi

### 1. Database Schema
**File:** [prisma/schema.prisma](prisma/schema.prisma)

**Changes:**
- Tambah kolom `poin` di model `users`
- Tambah kolom `userId` di model `Transaksi`

### 2. API Update Transaksi
**File:** [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js)

**Logic:**
```javascript
// Saat update status transaksi
if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
  // Cari user berdasarkan email
  const email = `${body.nama_pembeli.toLowerCase()}@gmail.com`;

  const userResult = await pool.query(
    'SELECT id, role FROM users WHERE email = $1',
    [email]
  );

  // Jika ketemu dan role = customer
  if (user.role === 'customer') {
    // Tambah poin +1
    await pool.query(
      'UPDATE users SET poin = poin + 1 WHERE id = $1',
      [user.id]
    );
  }
}
```

### 3. API Get Poin User
**File:** [app/api/user-poin/route.js](app/api/user-poin/route.js) - **BARU**

**Endpoint:** `GET /api/user-poin?email=user@example.com`

**Response:**
```json
{
  "ok": true,
  "poin": 5,
  "email": "user@example.com",
  "role": "customer"
}
```

### 4. Halaman Transaksi Customer
**File:** [app/transaksi-saya/page.js](app/transaksi-saya/page.js)

**UI Components:**
- Header badge menampilkan total poin user
- Success popup menampilkan notifikasi +1 poin
- Auto-reload poin setelah transaksi diterima

---

## 🎨 UI/UX

### Header Poin Badge
```jsx
<div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3 rounded-xl">
  <div className="flex items-center gap-2">
    <span className="text-2xl">🎁</span>
    <div>
      <p className="text-xs text-white/80">Poin Anda</p>
      <p className="text-2xl font-bold text-white">{userPoin}</p>
    </div>
  </div>
</div>
```

### Success Popup
```jsx
<div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl">
  <p className="text-white text-sm">🎉 Selamat! Anda mendapat</p>
  <p className="text-3xl font-bold text-white">+1 Poin</p>
  <p className="text-white/80 text-xs">Total poin Anda: {userPoin}</p>
</div>
```

---

## 🧪 Testing Guide

### Test Case 1: Customer Dapat Poin
**Steps:**
1. Login sebagai customer (email: `customer@gmail.com`)
2. Buat transaksi baru
3. Bayar via QRIS
4. Klik "Saya sudah bayar"
5. Status berubah → **diterima**

**Expected:**
- ✅ Popup success muncul dengan "+1 Poin"
- ✅ Badge poin di header bertambah
- ✅ Database: `users.poin` bertambah 1
- ✅ Console log: "✅ Poin +1 untuk user customer@gmail.com"

### Test Case 2: Admin/Owner Tidak Dapat Poin
**Steps:**
1. Login sebagai admin/owner
2. Buat transaksi (nama_pembeli = admin)
3. Update status → diterima

**Expected:**
- ✅ Transaksi berhasil update
- ❌ Poin TIDAK bertambah (karena role bukan customer)

### Test Case 3: Status Sudah Diterima
**Steps:**
1. Transaksi sudah berstatus "diterima"
2. Update transaksi lagi (status tetap "diterima")

**Expected:**
- ✅ Transaksi update
- ❌ Poin TIDAK bertambah lagi (tidak double)

### Test Case 4: Cek Poin via API
**Request:**
```bash
curl http://localhost:3000/api/user-poin?email=customer@gmail.com
```

**Expected Response:**
```json
{
  "ok": true,
  "poin": 3,
  "email": "customer@gmail.com",
  "role": "customer"
}
```

---

## 📊 Database Query Examples

### Check user poin
```sql
SELECT email, role, poin
FROM users
WHERE role = 'customer'
ORDER BY poin DESC;
```

### Check transaksi yang sudah dapat poin
```sql
SELECT t.id, t.nama_pembeli, t.status, t.tanggal, u.poin
FROM "Transaksi" t
LEFT JOIN users u ON LOWER(u.email) LIKE CONCAT(LOWER(t.nama_pembeli), '@%')
WHERE t.status = 'diterima'
ORDER BY t.tanggal DESC;
```

### Manual update poin (jika diperlukan)
```sql
UPDATE users
SET poin = poin + 5
WHERE email = 'customer@gmail.com';
```

### Reset semua poin
```sql
UPDATE users
SET poin = 0
WHERE role = 'customer';
```

---

## ⚙️ Configuration

### Environment Variables
Tidak ada environment variable baru yang diperlukan.

### Constants
**File:** `app/api/admin-transaksi/[id]/route.js`

Bisa diubah jika diperlukan:
```javascript
// Poin yang diberikan per transaksi
const POIN_PER_TRANSAKSI = 1; // Default: 1

// Status yang memicu poin
const STATUS_TRIGGER = 'diterima'; // Default: 'diterima'
```

---

## 🔮 Future Enhancements

### 1. **Poin Log Table**
Tracking history poin customer:
```prisma
model PoinLog {
  id          Int      @id @default(autoincrement())
  userId      Int
  transaksiId Int
  jumlah      Int
  keterangan  String
  createdAt   DateTime @default(now())
}
```

### 2. **Redeem Poin**
- Tukar poin dengan diskon/voucher
- Minimal poin untuk redeem: 10 poin
- 10 poin = Rp 10.000 discount

### 3. **Poin Tiers**
- Bronze: 0-10 poin
- Silver: 11-50 poin
- Gold: 51-100 poin
- Platinum: 100+ poin

### 4. **Poin Expiration**
- Poin expire setelah 1 tahun
- Notifikasi sebelum poin expire

### 5. **Bonus Poin**
- First transaction: +5 poin
- Pembelian > Rp 100.000: +2 poin
- Referral friend: +10 poin

---

## 📝 Notes

### Asumsi Email
Saat ini sistem mengasumsikan:
```javascript
const email = `${nama_pembeli}@gmail.com`;
```

Jika format email berbeda, update logicnya di:
- `app/api/admin-transaksi/[id]/route.js` line 50

### Error Handling
Jika update poin gagal, transaksi tetap berhasil diupdate:
```javascript
try {
  // Update poin
} catch (poinError) {
  console.error('Error updating poin:', poinError.message);
  // Tidak throw error, transaksi tetap sukses
}
```

---

## 🐛 Troubleshooting

### Problem: Poin tidak bertambah
**Check:**
1. Role user = "customer"? → Query: `SELECT role FROM users WHERE email = '...'`
2. Status berubah dari "pending" → "diterima"?
3. Email format benar? → Cek console log

**Fix:**
```sql
-- Manual tambah poin
UPDATE users SET poin = poin + 1 WHERE email = 'customer@gmail.com';
```

### Problem: Double poin
**Cause:** Klik "Saya sudah bayar" 2x

**Fix:** Sudah di-handle di logic:
```javascript
if (oldTransaction.status !== 'diterima') { ... }
```

### Problem: API poin error
**Check:**
```bash
# Test API
curl "http://localhost:3000/api/user-poin?email=test@gmail.com"
```

**Common errors:**
- Email tidak ada di database → 404
- Parameter email kosong → 400

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| Database migration | ✅ Done |
| Auto-increment poin | ✅ Done |
| Role checking (customer only) | ✅ Done |
| UI poin badge | ✅ Done |
| Success notification | ✅ Done |
| API endpoint | ✅ Done |
| Error handling | ✅ Done |
| Documentation | ✅ Done |

**Sistem poin sudah siap digunakan!** 🎉

---

© 2024 - Poin System by SPLSK Team
