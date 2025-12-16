# Changelog - SIWEB-5 Project

## ✨ Feature: Order History System (Riwayat Pemesanan) (2025-12-13)

### Overview
Implementasi sistem riwayat pemesanan permanent yang menyimpan snapshot data transaksi dan produk, sehingga history pemesanan tetap tersimpan bahkan ketika produk dihapus dari database.

### Problem Statement

**User Request:**
> "Buatkan sebuah tabel baru yaitu riwayat pemesanan dari suatu pelanggan, sehingga jika produk tersebut hilang dari database riwayatnya tidak hilang"

**Business Requirement:**
- Customer order history harus tetap ada meskipun produk dihapus
- Data produk (nama, harga) perlu di-snapshot saat pemesanan
- Audit trail untuk financial records
- Independent dari cascade delete

### Solution: RiwayatPemesanan Table

**Key Concept: Data Snapshot**
> Capture and freeze product information at the time of order acceptance

**Architecture:**
```
Transaksi (status: "diterima")
   ↓
Fetch Produk (get current info)
   ↓
Create RiwayatPemesanan
   - nama_produk: produk.nama     (📸 SNAPSHOT)
   - harga_produk: produk.harga   (📸 SNAPSHOT)
   - Copy transaction details
   ↓
✅ Permanent history saved
```

### Database Schema

**File:** [prisma/schema.prisma](prisma/schema.prisma:76-92)

```prisma
model RiwayatPemesanan {
  id              Int      @id @default(autoincrement())
  transaksiId     Int?                    // Nullable - no foreign key constraint
  userId          Int?                    // Nullable - reference to user
  nama_pembeli    String                  // Buyer name
  nama_produk     String                  // 📸 SNAPSHOT: Product name
  harga_produk    Int                     // 📸 SNAPSHOT: Product price
  jumlah          Int      @default(1)    // Quantity
  total_harga     Int                     // Total price before discount
  poin_dipakai    Int      @default(0)    // Points used
  diskon_poin     Int      @default(0)    // Points discount amount
  harga_akhir     Int?                    // Final price after discount
  bulk_payment_id String?                 // Bulk payment reference
  status          String   @default("pending")
  tanggal         DateTime @default(now())
  createdAt       DateTime @default(now())
}
```

**Design Decisions:**
- ✅ **Nullable Foreign Keys**: Independent from Transaksi and Produk
- ✅ **Product Snapshot**: nama_produk & harga_produk stored directly (not foreign keys)
- ✅ **Self-Contained**: No joins needed for basic queries
- ✅ **Immune to Deletion**: Survives product and transaction deletion

### Backend Implementation

#### 1. Automatic History Creation

**File:** [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js)

**Trigger:** When admin changes transaction status to "diterima"

```javascript
if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
  const produk = await prisma.produk.findUnique({
    where: { id: Number(body.produkId) }
  });

  if (produk) {
    // Save to RiwayatPemesanan (permanent history)
    await prisma.riwayatPemesanan.create({
      data: {
        transaksiId: transactionId,
        userId: trx.userId,
        nama_pembeli: body.nama_pembeli,

        // 📸 SNAPSHOT: Capture product info NOW
        nama_produk: produk.nama,
        harga_produk: produk.harga,

        jumlah: 1,
        total_harga: trx.total_harga,
        poin_dipakai: trx.poin_dipakai,
        diskon_poin: trx.diskon_poin,
        harga_akhir: trx.harga_akhir,
        bulk_payment_id: trx.bulk_payment_id,
        status: 'diterima',
        tanggal: trx.tanggal,
      }
    });

    // Decrease stock
    if (produk.stok > 0) {
      await prisma.produk.update({
        where: { id: Number(body.produkId) },
        data: { stok: produk.stok - 1 }
      });
    }
  }
}
```

#### 2. API Endpoint

**File:** [app/api/riwayat-pemesanan/route.js](app/api/riwayat-pemesanan/route.js)

**Endpoint:** `GET /api/riwayat-pemesanan`

**Query Parameters:**
- `userId` - Filter by user ID
- `nama_pembeli` - Filter by buyer name (case insensitive)

**Example Usage:**
```javascript
// Get all order history
GET /api/riwayat-pemesanan

// Get order history for specific user
GET /api/riwayat-pemesanan?userId=5

// Search by buyer name
GET /api/riwayat-pemesanan?nama_pembeli=John
```

### Frontend Implementation

**File Created:** [app/owner-riwayat-pemesanan/page.js](app/owner-riwayat-pemesanan/page.js)

**Features:**
1. ✅ Display all order history in table format
2. ✅ Search by buyer name or product name
3. ✅ Filter by status (all, pending, diterima, ditolak)
4. ✅ Statistics cards (total, accepted, pending, rejected)
5. ✅ Responsive design with dark theme
6. ✅ Sidebar navigation with 📋 icon

**Table Columns:**
- ID, Tanggal, Pembeli
- **Produk** (📸 snapshot name)
- **Harga Produk** (📸 snapshot price)
- Jumlah, Total Harga, Poin Dipakai, Diskon Poin, Harga Akhir, Status

**Navigation:**
- Updated [app/owner-dashboard/page.js](app/owner-dashboard/page.js) with new sidebar button

### Data Flow

```
1. Customer creates order → Transaksi (status: "pending")
2. Admin reviews order → Opens admin-transaksi
3. Admin accepts order → Changes status to "diterima"
   ↓
   API: PUT /api/admin-transaksi/[id]
   ↓
   ┌─────────────────────────────────────┐
   │ 1. Fetch Produk (current info)      │
   │ 2. Create RiwayatPemesanan          │ ← 📸 SNAPSHOT
   │ 3. Decrease stock (-1)              │
   │ 4. Update user points (if used)     │
   └─────────────────────────────────────┘
   ↓
4. Owner views history → GET /api/riwayat-pemesanan
   ✅ All orders displayed (even for deleted products)
```

### Scenarios & Benefits

#### Scenario 1: Product Name Changed
```
Order placed: "iPhone 13" @ 10M
Product renamed: "iPhone 13 Pro"

Result:
- Transaksi: Shows "iPhone 13 Pro" (current name)
- RiwayatPemesanan: Shows "iPhone 13" (snapshot) ✅
```

#### Scenario 2: Product Price Changed
```
Order placed: "Kopi Latte" @ 25K
Price increased: 30K

Result:
- New orders: Pay 30K
- Historical records: Show 25K (accurate) ✅
```

#### Scenario 3: Product Deleted
```
Order history exists for "iPhone 13"
Admin deletes product

Result:
- Transaksi: DELETED (cascade) ❌
- RiwayatPemesanan: PRESERVED ✅
- Customer can still view order history ✅
```

### Benefits

1. **Data Integrity**
   - ✅ Order history immune to product changes
   - ✅ Accurate financial records
   - ✅ Audit trail for compliance

2. **User Experience**
   - ✅ Customers can view complete order history
   - ✅ No broken references to deleted products
   - ✅ Clear purchase information

3. **Business Intelligence**
   - ✅ Historical sales data preserved
   - ✅ Product performance analysis
   - ✅ Customer behavior tracking

4. **System Flexibility**
   - ✅ Safe to delete old products
   - ✅ Clean up database without losing history
   - ✅ Maintain referential integrity

### Comparison: Transaksi vs RiwayatPemesanan

| Aspect | Transaksi | RiwayatPemesanan |
|--------|-----------|------------------|
| Purpose | Active orders | Historical records |
| Product Ref | Foreign key (produkId) | Snapshot (nama_produk) |
| Lifecycle | Can be deleted | Permanent |
| Product Deletion | Cascade delete | Immune |
| Product Changes | Shows current | Shows snapshot |
| Query Speed | Requires JOIN | Direct access |

### Database Migration

```bash
npx prisma db push
```

**Result:**
```
✔ Your database is now in sync with your Prisma schema. Done in 2.14s
✔ Generated Prisma Client
```

### Files Modified/Created

**Modified:**
- [prisma/schema.prisma](prisma/schema.prisma) - Added RiwayatPemesanan model
- [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js) - Auto-create history
- [app/owner-dashboard/page.js](app/owner-dashboard/page.js) - Added navigation

**Created:**
- [app/api/riwayat-pemesanan/route.js](app/api/riwayat-pemesanan/route.js) - API endpoint
- [app/owner-riwayat-pemesanan/page.js](app/owner-riwayat-pemesanan/page.js) - Frontend page
- [ORDER_HISTORY_SYSTEM.md](ORDER_HISTORY_SYSTEM.md) - Complete documentation

### Documentation
- [ORDER_HISTORY_SYSTEM.md](ORDER_HISTORY_SYSTEM.md) - Complete technical documentation with scenarios and examples

---

## 🐛 Fix: Stock Update Validation - Prevent Negative Stock (2025-12-13)

### Problem
Pada halaman admin-product, tombol minus untuk mengurangi stok bisa terus diklik bahkan ketika stok sudah 0, menyebabkan stok menjadi negatif (-1, -2, dst).

### Root Cause
1. API tidak validasi apakah stok hasil akhir negatif
2. Frontend tidak disable tombol minus ketika stok = 0
3. Tidak ada error handling untuk tampilkan error ke user

### Solution

**Files Modified:**
- [app/api/products/update-stok/route.js](app/api/products/update-stok/route.js) - Added validation
- [app/admin-product/page.js](app/admin-product/page.js:48-69,250-275) - Error handling + UI

**Changes:**

#### 1. API Validation
```javascript
// Get current product
const currentProduct = await prisma.produk.findUnique({
  where: { id: Number(id) }
});

// Calculate new stock
const newStok = currentProduct.stok + Number(amount);

// Prevent negative stock
if (newStok < 0) {
  return Response.json({
    error: "Stok tidak boleh kurang dari 0",
    currentStok: currentProduct.stok
  }, { status: 400 });
}

// Update with exact value
await prisma.produk.update({
  where: { id: Number(id) },
  data: { stok: newStok }
});
```

#### 2. Frontend Error Handling
```javascript
const res = await fetch("/api/products/update-stok", ...);
const data = await res.json();

if (!res.ok) {
  showToast(data.error || "Gagal mengupdate stok", "error");
  return;
}

fetchProducts();
showToast("Stok berhasil diupdate", "success");
```

#### 3. UI Improvement - Disable Button
```javascript
<button
  onClick={() => updateStok(p.id, -1)}
  disabled={p.stok <= 0}
  className={`px-3 py-1 rounded transition ${
    p.stok <= 0
      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
      : "bg-gray-700 hover:bg-gray-600"
  }`}
  title={p.stok <= 0 ? "Stok sudah 0" : "Kurangi stok"}
>
  -
</button>
```

### Features

1. ✅ **API Validation**: Prevent `newStok < 0` at backend level
2. ✅ **Disabled Button**: Minus button disabled when `stok <= 0`
3. ✅ **Visual Feedback**: Gray color + `cursor-not-allowed`
4. ✅ **Error Toast**: Show error message if validation fails
5. ✅ **Success Toast**: Show success message on update
6. ✅ **Tooltips**: Explain why button disabled

### Flow

**Before:**
```
Click minus (stok = 0) → API: stok = -1 → Database: stok = -1 ❌
```

**After:**
```
Stok = 0 → Button DISABLED (gray) → Cannot click ✅

If API called directly:
API validates → newStok < 0? → ERROR response → Stok unchanged ✅
```

### Benefits

- ✅ Data integrity: Stok tidak bisa negatif
- ✅ Better UX: Visual feedback + tooltips
- ✅ Error handling: Clear error messages
- ✅ Double protection: Backend validation + Frontend disable

### Documentation
- [STOCK_UPDATE_VALIDATION.md](STOCK_UPDATE_VALIDATION.md) - Complete documentation

---

## 🔧 Fix: Cascade Delete for Product Foreign Key (2025-12-13)

### Problem
Error ketika mencoba menghapus produk yang memiliki transaksi:
```
update or delete on table "Produk" violates foreign key constraint "Transaksi_produkId_fkey" on table "Transaksi"
```

### Root Cause
Database foreign key constraint default behavior adalah `RESTRICT`, yang mencegah penghapusan produk jika ada transaksi yang mereferensinya.

### Analysis
Foreign key setup **SUDAH BENAR**:
- `Transaksi.produkId` → `Produk.id` ✅
- BUKAN referensi ke `Produk.nama` ✅
- Yang kurang: `onDelete` behavior

### Solution

**File Modified:**
- [prisma/schema.prisma](prisma/schema.prisma:34)

**Changes:**
```prisma
// Before
produk  Produk   @relation(fields: [produkId], references: [id])

// After
produk  Produk   @relation(fields: [produkId], references: [id], onDelete: Cascade)
                                                                  ↑
                                                            Added this
```

**Migration:**
```bash
npx prisma db push
```

### Behavior

**Before:**
```
Admin delete produk → ❌ Error: foreign key constraint
```

**After:**
```
Admin delete produk → ✅ Success
                    → ⚠️ All related transaksi also deleted (cascade)
```

### Example

**Scenario:**
- Produk #5 has 10 transaksi
- Admin deletes Produk #5

**Result:**
- ✅ Produk #5 deleted
- ⚠️ 10 transaksi also deleted (cascade)

### Warning ⚠️

**Cascade Delete Risks:**
- ⚠️ **Data Loss**: Deleting produk will PERMANENT DELETE all related transaksi
- ⚠️ **No Recovery**: Cannot undo after delete
- ⚠️ **History Loss**: Customer transaction history gone

**Suitable for:**
- ✅ Development environment
- ✅ Testing/demo
- ❌ Production (use soft delete instead)

### Production Recommendation

For production, implement **soft delete** instead:

```javascript
// Don't delete, just mark as deleted
await prisma.produk.update({
  where: { id: produkId },
  data: { deleted: true, deletedAt: new Date() }
});
```

Or add **API validation**:

```javascript
// Check if product has transactions before delete
const transaksiCount = await prisma.transaksi.count({
  where: { produkId }
});

if (transaksiCount > 0) {
  return Response.json(
    { error: `Cannot delete. Product has ${transaksiCount} transactions.` },
    { status: 400 }
  );
}
```

### Documentation
- [CASCADE_DELETE_SETUP.md](CASCADE_DELETE_SETUP.md) - Complete documentation

---

## 🐛 Fix: Stock Deduction on Transaction Acceptance (2025-12-13)

### Problem
Ketika admin mengubah status transaksi menjadi "diterima", stok produk tidak berkurang. Seharusnya stok otomatis berkurang saat transaksi diterima.

### Root Cause
Sistem hanya update poin customer tanpa mengurangi stok produk ketika transaksi diterima.

### Solution

**File Modified:**
- [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js:58-83)

**Changes:**
```javascript
// 📦 PENGURANGAN STOK PRODUK
if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
  const produk = await prisma.produk.findUnique({
    where: { id: Number(body.produkId) }
  });

  if (produk && produk.stok > 0) {
    await prisma.produk.update({
      where: { id: Number(body.produkId) },
      data: { stok: produk.stok - 1 }
    });
    console.log(`📦 Stok produk #${body.produkId} berkurang: ${produk.stok} → ${produk.stok - 1}`);
  } else if (produk && produk.stok === 0) {
    console.warn(`⚠️ Stok produk #${body.produkId} sudah habis (0)`);
  }
}
```

**Flow:**
1. Admin ubah status → "diterima"
2. ✅ Update transaksi
3. ✅ **Kurangi stok produk (-1)** ← NEW
4. ✅ Update poin customer (+1 atau +2)

### Features

1. ✅ **Automatic Stock Deduction**: Stok berkurang otomatis saat status → "diterima"
2. ✅ **Stock Validation**: Cek stok > 0 sebelum mengurangi
3. ✅ **Error Handling**: Transaksi tetap success jika stok update gagal
4. ✅ **Logging**: Console log untuk tracking perubahan stok
5. ✅ **Warning for Empty Stock**: Log warning jika stok sudah 0

### Example

**Before:**
- Produk: Kopi Latte (Stok: 10)
- Admin terima transaksi → Stok tetap 10 ❌

**After:**
- Produk: Kopi Latte (Stok: 10)
- Admin terima transaksi → Stok jadi 9 ✅

### Benefits

- ✅ Stok otomatis sinkron dengan transaksi
- ✅ Admin tidak perlu manual update stok
- ✅ Inventory tracking akurat
- ✅ Terintegrasi dengan sistem poin (existing)

### Documentation
- [STOCK_DEDUCTION_FIX.md](STOCK_DEDUCTION_FIX.md) - Detailed documentation

---

## 🔄 Feature: Upload Format Change - Product Name & Quantity (2025-12-13)

### Overview
Perubahan format upload CSV/JSON di owner-laporan dari menggunakan `produkId` menjadi `nama_produk` dan tambahan field `jumlah` untuk quantity.

### Motivation
- Owner tidak perlu mengingat ID produk
- Lebih user-friendly menggunakan nama produk
- Support untuk quantity dalam satu baris CSV
- Tabel menampilkan informasi yang lebih readable

### Changes

#### 1. Upload Format Baru

**Sebelum:**
```csv
produkId,nama_pembeli,total_harga,tanggal,status
1,John Doe,50000,2024-12-13,selesai
```

**Sekarang:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah,tanggal,status
Kopi Latte,John Doe,50000,2,2024-12-13,selesai
```

#### 2. Field Specification

| Field | Required | Description |
|-------|----------|-------------|
| `nama_produk` | ✅ Yes | Nama produk (harus sesuai database) |
| `nama_pembeli` | ✅ Yes | Nama pembeli |
| `total_harga` | ✅ Yes | Total harga per item |
| `jumlah` | ⚠️ Optional | Quantity (default: 1) |
| `tanggal` | ⚠️ Optional | Tanggal (default: sekarang) |
| `status` | ⚠️ Optional | Status (default: "selesai") |

#### 3. API Changes

**Files Modified:**
- [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js) - Product lookup by name, quantity loop
- [app/api/admin-transaksi/route.js](app/api/admin-transaksi/route.js) - Include product relation
- [app/owner-laporan/page.js](app/owner-laporan/page.js) - Data aggregation, table update

**Key Features:**
1. ✅ Lookup product by `nama` instead of `id`
2. ✅ Create multiple transactions based on `jumlah`
3. ✅ Aggregate display by product/buyer/status
4. ✅ Auto-refresh after upload
5. ✅ Removed preview step (direct save)

#### 4. Table Display Update

**Before:**
- Columns: ID, Tanggal, Nama Pembeli, **Produk ID**, Total Harga, Status

**After:**
- Columns: ID, Tanggal, Nama Pembeli, **Nama Produk**, **Jumlah Terjual**, Total Harga, Status

#### 5. Example Usage

**Upload 10 items in one row:**
```csv
nama_produk,nama_pembeli,total_harga,jumlah
Kue Coklat,Toko Budi,15000,10
```

**Result:**
- 10 transaksi created in database
- Table shows: Kue Coklat | Toko Budi | Jumlah: 10

### Benefits

1. ✅ **User-Friendly**: Nama produk lebih mudah diingat daripada ID
2. ✅ **Quantity Support**: Satu baris bisa represent multiple items
3. ✅ **Better Display**: Tabel menampilkan nama produk dan jumlah terjual
4. ✅ **Faster Workflow**: Tanpa preview, langsung save dan refresh
5. ✅ **Data Aggregation**: View yang lebih clean dengan grouping

### Migration Guide

Convert old CSV format:
```bash
# Old: produkId,nama_pembeli,total_harga
# New: nama_produk,nama_pembeli,total_harga,jumlah
```

Query product names from database:
```sql
SELECT id, nama FROM produk;
```

### Documentation
- [UPLOAD_FORMAT_CHANGE.md](UPLOAD_FORMAT_CHANGE.md) - Complete documentation

---

## 🐛 Fix: Owner Laporan Upload False Error (2025-12-13)

### Problem
Upload file berhasil memasukkan data ke database, tetapi user mendapat pesan "gagal". Data baru terlihat setelah refresh page.

### Root Cause
Mismatch antara response format dari API dan handling logic di frontend:
- Backend mengirim `{ success: true, inserted: number }`
- Frontend mengecek `!res.ok` sebelum mengecek `json.success`
- Logic flow tidak sesuai dengan response contract

### Solution

**Files Modified:**
- [app/owner-laporan/upload/page.js](app/owner-laporan/upload/page.js) - Fixed response handling
- [app/api/owner-laporan-upload/route.js](app/api/owner-laporan-upload/route.js) - Explicit status 200

**Changes:**
1. Check `json.success` as primary success indicator
2. Added loading state with visual feedback
3. Form auto-reset on successful upload
4. Disabled button during upload (prevents double submission)
5. Clear error/success messages with icons (✅/❌/⏳)

**Before:**
```javascript
if (!res.ok) {
  setError("Error upload: " + json.error);
  return;
}
setMessage(`Upload berhasil!`);
```

**After:**
```javascript
if (json.success) {
  setMessage(`Upload berhasil! ${json.inserted} data berhasil dimasukkan.`);
  e.target.reset();
  return;
}
if (json.error) {
  setError("Error upload: " + json.error);
  return;
}
```

### Benefits
- ✅ Accurate success/error feedback
- ✅ Better UX with loading state
- ✅ Auto form reset on success
- ✅ Prevents double submission

### Documentation
- [UPLOAD_FIX.md](UPLOAD_FIX.md) - Detailed fix documentation

---

## 📊 Feature: Dashboard Filter System (2025-12-13)

### Overview
Implementasi sistem filter untuk admin dan owner dashboard dengan kemampuan filter berdasarkan periode waktu (quick filters + custom filters).

### Features Added

#### 1. Admin Dashboard Filter
**Files Modified:**
- [app/admin-dashboard/page.js](app/admin-dashboard/page.js)
- [app/api/admin-metric/route.js](app/api/admin-metric/route.js)

**Quick Filters:**
- 📅 Hari Ini - Grafik per jam (24 data points)
- 📊 Bulan Ini - Grafik per hari (28-31 data points)
- 📈 Tahun Ini - Grafik per bulan (12 data points)

**Custom Filters:**
- 📆 Tanggal Tertentu - Date picker + grafik per jam
- 📅 Bulan Tertentu - Month picker + grafik per hari
- 📊 Tahun Tertentu - Number input (2020-2099) + grafik per bulan

#### 2. Owner Dashboard Filter
**Files Created:**
- [app/api/owner-metric/route.js](app/api/owner-metric/route.js) - New API endpoint

**Files Modified:**
- [app/owner-dashboard/page.js](app/owner-dashboard/page.js) - Replaced static data with dynamic API

**Features:**
- Identical filter options as admin dashboard
- Real-time data from database (replaced hardcoded stats)
- Loading states and error handling
- Graph data key: `jumlah` (for consistency with existing implementation)

### Technical Implementation

#### Backend API
```javascript
// Dynamic date range calculation
if (filter === "custom_date" && customDate) {
  const [year, month, day] = customDate.split("-");
  startDate = new Date(year, month - 1, day, 0, 0, 0);
  endDate = new Date(year, month - 1, day, 23, 59, 59);
}

// Dynamic graph data generation
if (filter === "day" || filter === "custom_date") {
  // Hourly graph (24 points)
} else if (filter === "month" || filter === "custom_month") {
  // Daily graph (28-31 points)
} else if (filter === "year" || filter === "custom_year") {
  // Monthly graph (12 points)
}
```

#### Frontend UI
- Two-row filter layout
- Color-coded buttons (Blue for quick, Green/Purple/Orange for custom)
- Conditional input display
- Auto-refresh on filter change
- Loading skeleton animations

### Benefits

1. **Flexible Analysis**: View performance across different time periods
2. **Historical Data**: Analyze past periods for comparison
3. **Better Planning**: Data-driven decisions based on trends
4. **User-Friendly**: Intuitive interface with visual indicators
5. **Consistent UX**: Same experience for admin and owner

### Documentation Created
- [DASHBOARD_FILTER.md](DASHBOARD_FILTER.md) - Complete filter documentation
- [CUSTOM_DATE_FILTER.md](CUSTOM_DATE_FILTER.md) - Custom filter details
- [OWNER_DASHBOARD_FILTER.md](OWNER_DASHBOARD_FILTER.md) - Owner-specific docs

### API Examples
```
GET /api/admin-metric?filter=day
GET /api/admin-metric?filter=custom_date&date=2024-12-13
GET /api/admin-metric?filter=custom_month&month=2024-12
GET /api/admin-metric?filter=custom_year&year=2023

GET /api/owner-metric?filter=month
GET /api/owner-metric?filter=custom_date&date=2024-08-17
```

---

## 🔧 Fix: Edge Runtime Compatibility (2024-12-11)

### Problem
```
JWT Verification Error: The edge runtime does not support Node.js 'crypto' module.
```

### Root Cause
- Middleware Next.js berjalan di **Edge Runtime**
- Library `jsonwebtoken` menggunakan Node.js `crypto` module
- Edge Runtime tidak support Node.js built-in modules

### Solution
✅ **Ganti library JWT dari `jsonwebtoken` → `jose`**

`jose` adalah library JWT yang:
- ✅ Kompatibel dengan Edge Runtime
- ✅ Modern dan lebih ringan
- ✅ Built untuk Web Standards API
- ✅ Mendukung async/await natively

### Changes Made

#### 1. Installed New Package
```bash
npm install jose
npm uninstall jsonwebtoken
```

#### 2. Updated Files

**a. [middleware.js](middleware.js:1-61)**
```javascript
// BEFORE (❌ Error di Edge Runtime)
import jwt from 'jsonwebtoken';
const decoded = jwt.verify(token, JWT_SECRET);

// AFTER (✅ Edge Runtime Compatible)
import { jwtVerify } from 'jose';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const { payload } = await jwtVerify(token, JWT_SECRET);
```

**b. [app/api/login/route.js](app/api/login/route.js:1-80)**
```javascript
// BEFORE
import jwt from 'jsonwebtoken';
const token = jwt.sign({ ... }, JWT_SECRET, { expiresIn: '24h' });

// AFTER
import { SignJWT } from 'jose';
const token = await new SignJWT({ ... })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('24h')
  .setIssuedAt()
  .sign(JWT_SECRET);
```

**c. [app/api/verify-token/route.js](app/api/verify-token/route.js:1-40)**
```javascript
// BEFORE
import jwt from 'jsonwebtoken';
const decoded = jwt.verify(token, JWT_SECRET);

// AFTER
import { jwtVerify } from 'jose';
const { payload } = await jwtVerify(token, JWT_SECRET);
```

### Key Differences

| Aspect | jsonwebtoken | jose |
|--------|--------------|------|
| Runtime | Node.js only | Edge + Node.js |
| API Style | Sync/Callback | Async (Promise) |
| Secret Format | String | Uint8Array (TextEncoder) |
| Verification | `jwt.verify()` | `jwtVerify()` |
| Signing | `jwt.sign()` | `new SignJWT()...sign()` |

### Testing
```bash
npm run dev
# Server starts without Edge Runtime errors ✅
```

---

## 📦 Package Changes

### Removed
- ❌ `jsonwebtoken` v9.x (13 dependencies removed)

### Added
- ✅ `jose` v5.x (1 dependency, lightweight)
- ✅ `bcryptjs` (for future password hashing)

---

## ✅ System Status

| Component | Status | Notes |
|-----------|--------|-------|
| JWT Authentication | ✅ Working | Using `jose` |
| Middleware Protection | ✅ Working | Edge Runtime compatible |
| Login API | ✅ Working | Token generation OK |
| Verify Token API | ✅ Working | Token verification OK |
| Logout API | ✅ Working | Cookie cleared |
| Edge Runtime | ✅ Compatible | No more crypto errors |

---

## 🚀 Next Steps

System is now fully functional with:
- ✅ JWT token authentication
- ✅ Edge Runtime compatible middleware
- ✅ HttpOnly cookie security
- ✅ Role-based access control
- ✅ 24-hour token expiration

**Ready for testing and production deployment!**

---

## 📚 References

- [jose Documentation](https://github.com/panva/jose)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

Last Updated: 2024-12-11
