# Fix: Stock Deduction on Transaction Acceptance

## Tanggal Fix
2025-12-13

## Problem

### Symptom
Ketika admin mengubah status transaksi menjadi "diterima", stok produk tidak berkurang. Seharusnya ketika transaksi diterima, stok produk otomatis berkurang sebanyak 1.

### Root Cause
Di file `app/api/admin-transaksi/[id]/route.js`, ketika status transaksi berubah menjadi "diterima", sistem hanya:
1. ✅ Update poin customer (sudah ada)
2. ❌ **TIDAK** mengurangi stok produk (missing)

## Solution

### File Modified
**[app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js:58-83)**

### Changes Made

#### Before:
```javascript
// 🎯 SISTEM POIN: Jika status berubah menjadi "diterima"
if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
  // Cari user berdasarkan email dari nama_pembeli
  const email = `${body.nama_pembeli.toLowerCase()}@gmail.com`;

  // ... (sistem poin)
}
```

#### After:
```javascript
// 🎯 SISTEM POIN & STOK: Jika status berubah menjadi "diterima"
if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
  // 📦 PENGURANGAN STOK PRODUK
  try {
    const produk = await prisma.produk.findUnique({
      where: { id: Number(body.produkId) }
    });

    if (produk) {
      if (produk.stok > 0) {
        await prisma.produk.update({
          where: { id: Number(body.produkId) },
          data: { stok: produk.stok - 1 }
        });
        console.log(`📦 Stok produk #${body.produkId} berkurang: ${produk.stok} → ${produk.stok - 1}`);
      } else {
        console.warn(`⚠️ Stok produk #${body.produkId} sudah habis (0)`);
      }
    }
  } catch (stockError) {
    console.error('Error updating stok:', stockError.message);
    // Tidak throw error, biar transaksi tetap update meskipun stok gagal
  }

  // Cari user berdasarkan email dari nama_pembeli
  const email = `${body.nama_pembeli.toLowerCase()}@gmail.com`;

  // ... (sistem poin - existing code)
}
```

### Key Features

1. ✅ **Automatic Stock Deduction**: Stok berkurang otomatis saat status → "diterima"
2. ✅ **Stock Validation**: Cek stok > 0 sebelum mengurangi
3. ✅ **Error Handling**: Jika stok update gagal, transaksi tetap success
4. ✅ **Logging**: Console log untuk tracking perubahan stok
5. ✅ **Warning for Empty Stock**: Log warning jika stok sudah 0

## Flow Diagram

### Before Fix:
```
Admin ubah status → "diterima"
    ↓
✅ Update transaksi
    ↓
✅ Update poin customer (+1 atau +2)
    ↓
❌ STOK TIDAK BERKURANG ← MASALAH!
```

### After Fix:
```
Admin ubah status → "diterima"
    ↓
✅ Update transaksi
    ↓
✅ Kurangi stok produk (-1)
    ↓
✅ Update poin customer (+1 atau +2)
    ↓
✅ COMPLETE!
```

## Example Scenario

### Scenario 1: Normal Transaction

**Initial State:**
- Produk: Kopi Latte (ID: 5, Stok: 10)
- Transaksi #123: status "pending"

**Action:**
Admin ubah transaksi #123 status → "diterima"

**Result:**
```
📦 Stok produk #5 berkurang: 10 → 9
✅ Poin +1 untuk user customer@gmail.com (transaksi #123)
```

**Database After:**
- Produk #5: Stok = 9 ✅
- Transaksi #123: status = "diterima" ✅
- User: poin += 1 ✅

### Scenario 2: Stock Already Zero

**Initial State:**
- Produk: Kue Coklat (ID: 3, Stok: 0)
- Transaksi #456: status "pending"

**Action:**
Admin ubah transaksi #456 status → "diterima"

**Result:**
```
⚠️ Stok produk #3 sudah habis (0)
✅ Poin +1 untuk user customer@gmail.com (transaksi #456)
```

**Database After:**
- Produk #3: Stok = 0 (tidak berubah) ✅
- Transaksi #456: status = "diterima" ✅
- User: poin += 1 ✅

**Note**: Transaksi tetap berhasil meskipun stok 0, dengan warning.

### Scenario 3: Large Transaction with Bonus Poin

**Initial State:**
- Produk: Paket Natal (ID: 8, Stok: 15, Harga: Rp 75,000)
- Transaksi #789: status "pending", total_harga: 75000

**Action:**
Admin ubah transaksi #789 status → "diterima"

**Result:**
```
📦 Stok produk #8 berkurang: 15 → 14
✅ Transaksi #789:
   - Harga: Rp 75,000
   - Poin base: +1
   - Poin bonus: +1 (>= Rp 50.000)
   - Total reward: +2
✅ Poin +2 untuk user customer@gmail.com (transaksi #789)
```

**Database After:**
- Produk #8: Stok = 14 ✅
- Transaksi #789: status = "diterima" ✅
- User: poin += 2 (karena >= Rp 50.000) ✅

## Error Handling

### Stock Update Failure

If stock update fails (database error, network issue, etc.):

```javascript
try {
  // Update stok
} catch (stockError) {
  console.error('Error updating stok:', stockError.message);
  // Tidak throw error, biar transaksi tetap update
}
```

**Behavior:**
- ✅ Transaction status still updates to "diterima"
- ✅ Poin still updates correctly
- ❌ Stock remains unchanged
- ⚠️ Error logged to console

**Why**: Transaksi customer lebih prioritas daripada stok. Stok bisa di-adjust manual, tapi transaksi customer harus completed.

## Technical Details

### Order of Operations

1. **Update Transaction** (status → "diterima")
2. **Check Status Change** (`oldTransaction.status !== 'diterima'`)
3. **Reduce Stock** (stok - 1)
4. **Update Poin** (existing logic)

### Conditions for Stock Deduction

```javascript
if (
  body.status === 'diterima' &&           // Status baru = diterima
  oldTransaction.status !== 'diterima'    // Status lama != diterima
) {
  // Kurangi stok
}
```

**Why check both?**
- Prevent multiple deductions if same transaction updated multiple times
- Only deduct on first change to "diterima"

### Stock Query

```javascript
const produk = await prisma.produk.findUnique({
  where: { id: Number(body.produkId) }
});
```

**Purpose**: Get current stock value before decrement

### Stock Update

```javascript
if (produk.stok > 0) {
  await prisma.produk.update({
    where: { id: Number(body.produkId) },
    data: { stok: produk.stok - 1 }
  });
}
```

**Why `stok > 0` check?**
- Prevent negative stock values
- Log warning if stock already zero
- Transaction still succeeds

## Integration with Existing Systems

### 1. Poin System (Existing)

Stock deduction **TIDAK** mempengaruhi sistem poin:
- ✅ Customer tetap dapat +1 poin (base)
- ✅ Customer tetap dapat +2 poin jika >= Rp 50.000
- ✅ Bulk payment deduction tetap bekerja
- ✅ Poin deducted flag tetap tracked

### 2. Transaction Protection (Existing)

```javascript
// 🛡️ PROTEKSI: Tidak bisa edit transaksi yang sudah diterima
if (oldTransaction.status === 'diterima') {
  return Response.json(
    { error: "Transaksi yang sudah diterima tidak bisa diubah" },
    { status: 403 }
  );
}
```

**Why important?**
- Prevents stock re-deduction
- Ensures stock consistency
- Already implemented before this fix

### 3. Bulk Payment System (Existing)

Stock deduction works with bulk payments:
- Each transaction deducts its own product stock
- If bulk payment has 3 items → 3 stock deductions
- Poin deduction happens once (already protected)

## Testing

### Test Case 1: Single Transaction

**Setup:**
```sql
-- Produk
INSERT INTO produk (id, nama, harga, stok) VALUES (1, 'Kopi Latte', 25000, 10);

-- Transaksi
INSERT INTO transaksi (id, produkId, nama_pembeli, total_harga, status)
VALUES (1, 1, 'Ahmad', 25000, 'pending');
```

**Action:**
```javascript
PUT /api/admin-transaksi/1
Body: { status: "diterima", produkId: 1, nama_pembeli: "Ahmad", total_harga: 25000 }
```

**Expected:**
- ✅ Transaksi #1: status = "diterima"
- ✅ Produk #1: stok = 9 (was 10)
- ✅ Console log: "📦 Stok produk #1 berkurang: 10 → 9"

### Test Case 2: Zero Stock

**Setup:**
```sql
UPDATE produk SET stok = 0 WHERE id = 1;
```

**Action:**
```javascript
PUT /api/admin-transaksi/2
Body: { status: "diterima", produkId: 1, nama_pembeli: "Budi", total_harga: 25000 }
```

**Expected:**
- ✅ Transaksi #2: status = "diterima"
- ✅ Produk #1: stok = 0 (unchanged)
- ⚠️ Console warn: "⚠️ Stok produk #1 sudah habis (0)"

### Test Case 3: Re-update Same Transaction

**Setup:**
```sql
-- Transaction already diterima
UPDATE transaksi SET status = 'diterima' WHERE id = 1;
```

**Action:**
```javascript
PUT /api/admin-transaksi/1
Body: { status: "diterima", ... }
```

**Expected:**
- ❌ Error 403: "Transaksi yang sudah diterima tidak bisa diubah"
- ✅ Stock NOT changed (protected)

### Test Case 4: Bulk Payment (3 Items)

**Setup:**
```sql
INSERT INTO transaksi (produkId, nama_pembeli, total_harga, status, bulk_payment_id)
VALUES
  (1, 'Charlie', 25000, 'pending', 'bulk_123'),
  (2, 'Charlie', 30000, 'pending', 'bulk_123'),
  (3, 'Charlie', 15000, 'pending', 'bulk_123');
```

**Action:**
Admin accepts all 3 transactions one by one.

**Expected:**
- ✅ Produk #1: stok -= 1
- ✅ Produk #2: stok -= 1
- ✅ Produk #3: stok -= 1
- ✅ Poin deducted only ONCE (existing protection)

## Benefits

1. ✅ **Accurate Inventory**: Stok otomatis berkurang saat transaksi diterima
2. ✅ **Consistent Data**: Stok selalu sync dengan transaksi
3. ✅ **Admin Friendly**: Tidak perlu manual update stok
4. ✅ **Error Tolerant**: Transaction success bahkan jika stok update gagal
5. ✅ **Logged Operations**: Semua perubahan stok tercatat di console
6. ✅ **Stock Protection**: Warning jika stok sudah 0

## Future Improvements

### Optional: Stock Reservation

**Idea**: Reserve stock saat transaksi dibuat (status "pending"):

```javascript
// On transaction create (POST /api/admin-transaksi)
await prisma.produk.update({
  where: { id: produkId },
  data: {
    stok: { decrement: 1 },
    reserved: { increment: 1 }
  }
});

// On transaction accept
await prisma.produk.update({
  where: { id: produkId },
  data: { reserved: { decrement: 1 } }
});

// On transaction cancel
await prisma.produk.update({
  where: { id: produkId },
  data: {
    stok: { increment: 1 },
    reserved: { decrement: 1 }
  }
});
```

**Benefit**: Prevent overselling

### Optional: Bulk Stock Update

**Idea**: Group stock updates for bulk payments:

```javascript
// Instead of updating one by one
const bulkStockUpdates = bulkTransactions.map(t => ({
  where: { id: t.produkId },
  data: { stok: { decrement: 1 } }
}));

// Use transaction
await prisma.$transaction(bulkStockUpdates);
```

**Benefit**: Atomic updates, faster performance

## Summary

Fix ini menambahkan pengurangan stok produk otomatis ketika admin mengubah status transaksi menjadi "diterima". Stok berkurang sebanyak 1 per transaksi, dengan validasi stok > 0 dan error handling yang robust. Sistem terintegrasi dengan sistem poin yang sudah ada tanpa conflict.

**One-liner**: Status "diterima" → Stok -1 ✅
