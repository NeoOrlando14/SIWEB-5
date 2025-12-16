# Critical Bug Fix: Double Point Deduction in Bulk Payments

## Bug Description

### The Problem
When a customer makes a bulk payment (multiple transactions) using points for discount, the system was deducting points **multiple times** - once for each transaction in the bulk - instead of deducting only once.

### Example Scenario

**Initial State:**
- Customer has: 10,000 poin
- Bulk payment: 3 transactions (A, B, C)
- Total using: 5000 poin for discount
- Each transaction stores: `poin_dipakai: 5000`

**Bug Behavior (BEFORE FIX):**
1. Admin approves Transaction A (status → "diterima")
   - Deduct: 5000 poin
   - User poin: 10,000 + 1 - 5000 = **5,001** ✓

2. Admin approves Transaction B (status → "diterima")
   - Deduct: 5000 poin (AGAIN!)
   - User poin: 5,001 + 1 - 5000 = **2** ❌

3. Admin approves Transaction C (status → "diterima")
   - Deduct: 5000 poin (AGAIN!)
   - User poin: 2 + 2 - 5000 = **-4,996** ❌ NEGATIVE!

**Expected:** 10,000 + 4 - 5000 = 5,004
**Actual:** -4,996 (CRITICAL BUG!)

---

## Root Cause

In `app/api/admin-transaksi/[id]/route.js` (old code):

```javascript
// This runs for EACH transaction individually
if (trx.poin_dipakai > 0) {
  poinChange = totalReward - trx.poin_dipakai;
}
```

The problem:
- All transactions in a bulk payment share the same `poin_dipakai` value
- Admin approves each transaction separately
- Each approval triggers point deduction
- Result: Points deducted N times (where N = number of transactions in bulk)

---

## Solution

### 1. Database Schema Changes

Added two new fields to `Transaksi` model:

```prisma
model Transaksi {
  // ... existing fields ...
  bulk_payment_id String?   // Groups bulk transactions together
  poin_deducted   Boolean  @default(false)  // Tracks if poin already deducted
}
```

### 2. Apply Poin Discount (Frontend → Backend)

**File:** `app/api/apply-poin-discount/route.js`

Generate unique `bulk_payment_id` for bulk payments:

```javascript
// Generate unique bulk_payment_id if multiple transactions
const bulkPaymentId = transactionIds.length > 1
  ? `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  : null;

// Update each transaction with bulk_payment_id
const updated = await prisma.transaksi.update({
  where: { id: Number(id) },
  data: {
    poin_dipakai: poinDipakai,
    diskon_poin: diskonPoin,
    harga_akhir: hargaAkhir,
    bulk_payment_id: bulkPaymentId,  // NEW
    poin_deducted: false              // NEW
  }
});
```

### 3. Admin Approval (Prevent Double Deduction)

**File:** `app/api/admin-transaksi/[id]/route.js`

Check if points already deducted before deducting again:

```javascript
if (trx.poin_dipakai > 0) {
  // Check if this is part of a bulk payment
  if (trx.bulk_payment_id) {
    // Check if ANY transaction in this bulk has already been deducted
    const bulkTransactions = await prisma.transaksi.findMany({
      where: { bulk_payment_id: trx.bulk_payment_id }
    });

    const alreadyDeducted = bulkTransactions.some(t => t.poin_deducted);

    if (alreadyDeducted) {
      // Points already deducted, only add reward
      poinChange = totalReward;
    } else {
      // First transaction in bulk, deduct points
      poinChange = totalReward - trx.poin_dipakai;

      // Mark ALL transactions in this bulk as deducted
      await prisma.transaksi.updateMany({
        where: { bulk_payment_id: trx.bulk_payment_id },
        data: { poin_deducted: true }
      });
    }
  } else {
    // Single transaction, normal deduction
    poinChange = totalReward - trx.poin_dipakai;

    // Mark this transaction as deducted
    await prisma.transaksi.update({
      where: { id: transactionId },
      data: { poin_deducted: true }
    });
  }
}
```

---

## Fixed Behavior (AFTER FIX)

**Same Scenario:**
- Customer has: 10,000 poin
- Bulk payment: 3 transactions (A, B, C)
- Total using: 5000 poin
- `bulk_payment_id: "bulk_1702345678901_abc123xyz"`

**Correct Behavior:**

1. Admin approves Transaction A (status → "diterima")
   - First in bulk, deduct: 5000 poin
   - Mark ALL transactions in bulk as `poin_deducted: true`
   - User poin: 10,000 + 1 - 5000 = **5,001** ✓

2. Admin approves Transaction B (status → "diterima")
   - Already deducted, skip deduction
   - Only add reward: +1 poin
   - User poin: 5,001 + 1 = **5,002** ✓

3. Admin approves Transaction C (status → "diterima")
   - Already deducted, skip deduction
   - Only add reward: +2 poin (>= Rp 50,000)
   - User poin: 5,002 + 2 = **5,004** ✓

**Expected:** 10,000 + 4 - 5000 = 5,004
**Actual:** 5,004 ✓ FIXED!

---

## Testing Checklist

### Test Case 1: Single Payment with Points
- [ ] Create 1 transaction
- [ ] Apply 1000 poin discount
- [ ] Admin approves
- [ ] Verify: Points deducted once
- [ ] Verify: Reward points added

### Test Case 2: Bulk Payment with Points
- [ ] Create 3 transactions
- [ ] Apply 5000 poin discount to bulk
- [ ] Admin approves transaction A
- [ ] Verify: 5000 poin deducted, reward added
- [ ] Admin approves transaction B
- [ ] Verify: Only reward added (no deduction)
- [ ] Admin approves transaction C
- [ ] Verify: Only reward added (no deduction)
- [ ] Final poin = Initial + (3 × reward) - 5000

### Test Case 3: Bulk Payment without Points
- [ ] Create 3 transactions
- [ ] No poin discount applied
- [ ] Admin approves all
- [ ] Verify: Only rewards added (no deduction)

---

## Files Modified

1. `prisma/schema.prisma` - Added `bulk_payment_id` and `poin_deducted` fields
2. `app/api/apply-poin-discount/route.js` - Generate bulk_payment_id
3. `app/api/admin-transaksi/[id]/route.js` - Prevent double deduction logic

---

## Impact

- **Critical:** Prevents negative point balances
- **Security:** Prevents point manipulation
- **UX:** Customers get correct point calculations
- **Logging:** Added detailed console logs for debugging

---

## Date Fixed
2025-12-13
