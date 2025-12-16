# Cascade Delete Setup - Product Foreign Key

## Tanggal Setup
2025-12-13

## Problem

### Error Message
```
update or delete on table "Produk" violates foreign key constraint "Transaksi_produkId_fkey" on table "Transaksi"
```

### Root Cause
Database memiliki foreign key constraint yang **mencegah penghapusan produk** jika ada transaksi yang mereferensinya. Ini adalah proteksi database standar untuk menjaga data integrity.

### Original Schema

```prisma
model Transaksi {
  id              Int      @id @default(autoincrement())
  produkId        Int
  // ... other fields
  produk          Produk   @relation(fields: [produkId], references: [id])
  //                                                                    ^ No onDelete behavior
}
```

**Behavior:**
- ❌ Tidak bisa delete produk jika ada transaksi
- ✅ Data integrity terjaga
- ❌ Admin tidak bisa cleanup produk lama

## Analysis

### Foreign Key Setup
Foreign key constraint **SUDAH BENAR**:
```prisma
produk  Produk   @relation(fields: [produkId], references: [id])
                                    ↑             ↑
                              Transaksi.produkId → Produk.id
```

**Artinya:**
- `Transaksi.produkId` mereferensi `Produk.id` ✅
- BUKAN mereferensi `Produk.nama` ✅
- Setup foreign key sudah correct

### Why the Error?
Error terjadi karena **tidak ada onDelete behavior** yang didefinisikan. PostgreSQL default behavior adalah `RESTRICT`, yang artinya:
- Jika produk punya transaksi → **DELETE BLOCKED** ❌
- Ini untuk proteksi data

## Solution Options

### Option 1: Cascade Delete (Implemented) ⚠️

**Change:**
```prisma
produk  Produk   @relation(fields: [produkId], references: [id], onDelete: Cascade)
                                                                  ↑
                                                          Add this parameter
```

**Behavior:**
- ✅ Delete produk → otomatis delete SEMUA transaksi terkait
- ⚠️ BERBAHAYA: Data transaksi hilang permanent
- 👍 Good for: Development, testing, cleanup

**Example:**
```
Produk #5 punya 10 transaksi
Admin delete Produk #5
→ Produk #5 deleted ✅
→ 10 transaksi also deleted ⚠️
```

### Option 2: Set Null (NOT Recommended)

```prisma
produkId  Int?   // Make nullable
produk    Produk?  @relation(fields: [produkId], references: [id], onDelete: SetNull)
```

**Behavior:**
- Delete produk → set `produkId = NULL` di transaksi
- ❌ Transaksi jadi orphan (tidak tahu produknya apa)
- ❌ Dashboard error karena produk tidak ada

### Option 3: Soft Delete (Best for Production)

**Schema:**
```prisma
model Produk {
  id        Int         @id @default(autoincrement())
  nama      String
  harga     Int
  deleted   Boolean     @default(false)  // Add this
  deletedAt DateTime?                     // Add this
  transaksi Transaksi[]
}
```

**API Logic:**
```javascript
// Don't actually delete, just mark as deleted
await prisma.produk.update({
  where: { id: produkId },
  data: {
    deleted: true,
    deletedAt: new Date()
  }
});

// Filter out deleted products in queries
const produk = await prisma.produk.findMany({
  where: { deleted: false }
});
```

**Behavior:**
- ✅ Produk "deleted" tapi masih di database
- ✅ Transaksi tetap valid
- ✅ Bisa restore jika perlu
- ✅ Data history tetap ada
- 👍 Best for: Production

### Option 4: Restrict (Default - Current Before Fix)

```prisma
produk  Produk   @relation(fields: [produkId], references: [id], onDelete: Restrict)
// or don't specify onDelete (default is Restrict)
```

**Behavior:**
- ❌ Cannot delete produk with transaksi
- ✅ Data protected
- ❌ Admin stuck

## Implemented Solution

### Change Made

**File:** [prisma/schema.prisma](prisma/schema.prisma:34)

**Before:**
```prisma
produk  Produk   @relation(fields: [produkId], references: [id])
```

**After:**
```prisma
produk  Produk   @relation(fields: [produkId], references: [id], onDelete: Cascade)
```

### Migration Command

```bash
npx prisma db push
```

**Result:**
```
Your database is now in sync with your Prisma schema. ✅
```

### Testing

**Test Case 1: Delete Product with Transactions**

**Setup:**
```sql
-- Produk dengan transaksi
INSERT INTO "Produk" (id, nama, harga, stok) VALUES (999, 'Test Product', 10000, 5);
INSERT INTO "Transaksi" (produkId, nama_pembeli, total_harga)
VALUES (999, 'Test Buyer', 10000);
```

**Action:**
```javascript
await prisma.produk.delete({ where: { id: 999 } });
```

**Before Fix:**
```
Error: update or delete on table "Produk" violates foreign key constraint ❌
```

**After Fix:**
```
✅ Produk deleted
✅ Transaksi also deleted (cascade)
```

**Test Case 2: Delete Multiple Products**

**Setup:**
```sql
INSERT INTO "Produk" (id, nama, harga) VALUES
  (1001, 'Product A', 5000),
  (1002, 'Product B', 6000);

INSERT INTO "Transaksi" (produkId, nama_pembeli, total_harga) VALUES
  (1001, 'Buyer 1', 5000),
  (1001, 'Buyer 2', 5000),
  (1002, 'Buyer 3', 6000);
```

**Action:**
```javascript
await prisma.produk.deleteMany({
  where: { id: { in: [1001, 1002] } }
});
```

**Result:**
```
✅ 2 products deleted
✅ 3 transactions deleted (cascade)
```

## Database Changes

### Foreign Key Constraint Update

**Before:**
```sql
ALTER TABLE "Transaksi"
ADD CONSTRAINT "Transaksi_produkId_fkey"
FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE RESTRICT;
```

**After:**
```sql
ALTER TABLE "Transaksi"
ADD CONSTRAINT "Transaksi_produkId_fkey"
FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE CASCADE;
                                                      ↑
                                              Changed from RESTRICT to CASCADE
```

## Warnings ⚠️

### Cascade Delete Risks

1. **Data Loss**: Deleting produk akan **PERMANENT DELETE** semua transaksi terkait
2. **No Recovery**: Tidak bisa undo setelah delete
3. **Historical Data**: Customer transaction history hilang
4. **Accounting**: Financial records hilang

### When to Use Cascade Delete

✅ **Good for:**
- Development environment
- Testing
- Demo/staging server
- Cleanup old test data

❌ **NOT for:**
- Production dengan real customer data
- E-commerce dengan history requirement
- System yang butuh audit trail

### Production Recommendation

**USE SOFT DELETE instead:**

```javascript
// Mark as deleted (recommended)
await prisma.produk.update({
  where: { id: produkId },
  data: { deleted: true }
});

// Filter in queries
const products = await prisma.produk.findMany({
  where: { deleted: false }
});
```

## Alternative: Prevent Delete via API

Keep cascade delete in schema but prevent at application level:

**File:** `app/api/admin-product/[id]/route.js`

```javascript
export async function DELETE(req, { params }) {
  const produkId = Number(params.id);

  // Check if product has transactions
  const transaksiCount = await prisma.transaksi.count({
    where: { produkId }
  });

  if (transaksiCount > 0) {
    return Response.json(
      { error: `Tidak bisa hapus produk. Masih ada ${transaksiCount} transaksi terkait.` },
      { status: 400 }
    );
  }

  // Only delete if no transactions
  await prisma.produk.delete({ where: { id: produkId } });
  return Response.json({ success: true });
}
```

**Benefit:**
- User-friendly error message
- Prevent accidental data loss
- Admin aware of the impact

## Summary

### What Changed
- Added `onDelete: Cascade` to Transaksi → Produk relation
- Database constraint updated from RESTRICT to CASCADE

### How It Works Now
```
Delete Produk #5
  ↓
Check transaksi with produkId = 5
  ↓
Delete all matching transaksi (cascade)
  ↓
Delete Produk #5
  ↓
✅ Success
```

### Before vs After

**Before:**
```
Admin delete produk → ❌ Error: foreign key constraint
```

**After:**
```
Admin delete produk → ✅ Success (+ cascade delete transaksi)
```

### Recommendation

For **production**, consider implementing:
1. ✅ Soft delete (mark as deleted, don't actually delete)
2. ✅ API-level validation (check transaksi count before delete)
3. ✅ Confirmation dialog: "This will delete X transactions. Continue?"
4. ✅ Archive feature instead of delete

For **development/testing**, cascade delete is **acceptable**.

---

**Status:** ✅ Cascade delete implemented and working
**Environment:** Suitable for development/testing
**Production:** Recommend soft delete or API validation
