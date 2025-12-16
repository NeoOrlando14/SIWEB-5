# 🚀 Quick Test Guide - POS Sebelah Kopi

## 📝 Test Preparation

**Server:** http://localhost:3001 (Already Running ✅)
**Time Required:** ~15-20 minutes
**Browser:** Chrome/Firefox (recommended)

---

## 🎯 Quick Test Sequence

### 1️⃣ **CUSTOMER TEST** (5 minutes)

```
URL: http://localhost:3001/register

Step 1: Register Customer
- Email: testcustomer@gmail.com
- Password: 123456
- Submit

Step 2: Login
- Use same credentials
- Should redirect to /home

Step 3: Shop Products
- Click "Shop" or navigate to /shop
- Product 1: Set quantity = 3, click "Tambah ke Keranjang"
- Product 2: Set quantity = 2, click "Tambah ke Keranjang"
- Product 3: Set quantity = 1, click "Tambah ke Keranjang"
- Verify: Badge shows "6" items

Step 4: Manage Cart
- Click "Keranjang" button (top right)
- Should see 6 items in "Keranjang Belanja"
- Checklist 4 items (leave 2 unchecked)
- Click "Hapus" on 1 unchecked item
- Verify: 5 items remain, 4 selected

Step 5: Checkout
- Click "Bayar (4)"
- Popup QRIS appears
- Optional: Use poin if available
- Click "Konfirmasi Pembayaran"
- Verify alert: "4 transaksi berhasil dibuat..."
- Verify: 4 items gone from cart, 1 item remains
- Verify: 4 transactions in "Menunggu Verifikasi Admin"
```

**✅ Expected Results:**
- [x] Registration works
- [x] Login saves userId to localStorage
- [x] Quantity selector works
- [x] Cart badge shows correct count
- [x] Checklist/uncheck works
- [x] Only checked items create transactions
- [x] Unchecked items stay in cart

---

### 2️⃣ **ADMIN TEST** (5 minutes)

```
URL: http://localhost:3001/login

Step 1: Login as Admin
- Email: admin@gmail.com (or your admin email)
- Password: (your admin password)
- Should redirect to /admin-dashboard

Step 2: View Transactions
- Click "Transaksi" in sidebar (🧾)
- Verify: 4 pending transactions from testcustomer@gmail.com
- All should show status "pending" (yellow ⟳)

Step 3: Approve Transaction
- Click "Edit" (pencil icon) on first transaction
- Verify: All data shown correctly (product, buyer, price)
- Change status to "✅ Diterima"
- Click "Update Transaksi"
- Verify: Alert "Transaksi berhasil diubah!"
- Verify: Transaction status changed to green checkmark
- Verify: Edit/Delete buttons gone (protected)

Step 4: Reject Transaction
- Edit second transaction
- Change status to "❌ Ditolak"
- Update
- Verify: Status changed to red X

Step 5: Check Stock
- Click "Product" in sidebar (📦)
- Find the product from approved transaction
- Verify: Stock decreased by quantity sold
```

**✅ Expected Results:**
- [x] Admin can see all pending transactions
- [x] Edit page shows complete data
- [x] Approve works (status changes)
- [x] Reject works (status changes)
- [x] Accepted transactions cannot be edited
- [x] Stock decreases when approved
- [x] Stock doesn't change when rejected

---

### 3️⃣ **OWNER TEST** (5 minutes)

```
URL: http://localhost:3001/login

Step 1: Login as Owner
- Email: owner@gmail.com (or your owner email)
- Password: (your owner password)
- Should redirect to /owner-dashboard

Step 2: Check Dashboard
- Verify sidebar shows:
  🏠 Dashboard
  📊 Owner Laporan
  📋 Riwayat Pemesanan
  🎁 Poin
- Verify metrics display:
  - Total Produk
  - Total Order
  - Total Sales
  - Produk Terlaris
- Verify graph shows data

Step 3: Test Filters
- Click "Hari Ini" → verify metrics update
- Click "Bulan Ini" → verify metrics update
- Click "Tanggal Tertentu" → select yesterday → verify update

Step 4: Check Riwayat Pemesanan
- Click 📋 icon in sidebar
- Verify: Transactions with status "diterima" appear
- Verify: Rejected/pending transactions DON'T appear here
- Verify columns:
  ID | Tanggal | Pembeli | Produk | Harga Produk | Jumlah |
  Total Harga | Poin Dipakai | Diskon Poin | Harga Akhir | Status
- Test search: Type buyer name
- Test filter: Select "Diterima"

Step 5: Check Sidebar Consistency
- Click 📊 Owner Laporan → Verify sidebar still complete
- Click 🎁 Poin → Verify sidebar still complete
- Click 🏠 Dashboard → Verify sidebar still complete
```

**✅ Expected Results:**
- [x] Owner can login
- [x] Dashboard shows metrics
- [x] Filters work correctly
- [x] Riwayat pemesanan shows only accepted transactions
- [x] Data includes customer transactions
- [x] Search & filter work
- [x] Sidebar consistent across ALL pages

---

## 🔍 Critical Checks

### ✅ Bug Verification Checklist

| Bug | Fixed? | How to Verify |
|-----|--------|---------------|
| **Bug #1:** Owner sidebar upload CSV | ✅ | Check all owner pages → Should say "Owner Laporan" not "Upload" |
| **Bug #2:** Customer data not in riwayat | ✅ | Owner sees customer transactions after admin approval |
| **Bug #3:** Poin icon missing | ✅ | Riwayat Pemesanan page has 🎁 Poin in sidebar |
| **Bug #4:** Owner laporan not in sidebar | ✅ | Owner-Poin page has 📊 Laporan & 📋 Riwayat in sidebar |
| **Bug #5:** No quantity selector | ✅ | Shop page has +/- buttons for each product |
| **Bug #6:** All items go to admin | ✅ | Only checked items create transactions |

---

## 🛠️ Developer Checks

### Check Browser Console (F12)
```javascript
// After customer login, check localStorage:
localStorage.getItem('userId')     // Should NOT be null
localStorage.getItem('email')      // Should be customer email
localStorage.getItem('role')       // Should be 'customer'

// After adding to cart:
JSON.parse(localStorage.getItem('cart'))  // Should be array of items

// After checkout:
JSON.parse(localStorage.getItem('cart'))  // Should only have unchecked items
```

### Check Database (Optional)
```sql
-- Check if userId is saved in transactions
SELECT id, nama_pembeli, userId, status FROM Transaksi
WHERE nama_pembeli = 'testcustomer'
ORDER BY id DESC LIMIT 10;

-- Check if data entered RiwayatPemesanan
SELECT id, nama_pembeli, nama_produk, userId, status
FROM RiwayatPemesanan
WHERE nama_pembeli = 'testcustomer';
```

---

## ⚡ Quick Test (2 minutes)

**Fastest way to verify everything works:**

1. **Customer:** Add 3 products → Checklist 2 → Checkout
2. **Admin:** Approve 1, Reject 1
3. **Owner:** Check riwayat → Should see 1 transaction
4. **Check:** Sidebar on ALL owner pages complete

**If all 4 steps work → System is READY! ✅**

---

## 🐛 Troubleshooting

### Problem: "Tidak ada riwayat pemesanan" in Owner page
**Solution:**
1. Make sure admin APPROVED (not just pending)
2. Status must be "diterima" to appear in owner riwayat
3. Check if userId is saved in transaction

### Problem: Cart items all go to database
**Solution:**
1. Clear browser cache
2. Re-login as customer
3. Make sure using NEW cart system (items should stay in cart after checkout)

### Problem: Sidebar missing icons
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check if files updated properly
3. Verify `owner-*/page.js` files have all 4 sidebar links

---

## 📊 Success Criteria

✅ **PASS if:**
- Customer can select quantity
- Customer can checklist items before checkout
- Only checked items create transactions
- Unchecked items stay in cart
- Admin can approve/reject
- Owner sees approved transactions in riwayat
- All sidebars complete and consistent

❌ **FAIL if:**
- All cart items create transactions (old bug)
- Owner riwayat is empty
- Sidebar missing links
- userId not saved

---

## 📞 Need Help?

1. Check `TEST_PLAN.md` for detailed scenarios
2. Check `TEST_RESULTS.md` for automated test results
3. Run `node verify-system.js` to verify code
4. Check browser console for errors

**Server Status:** ✅ Running at http://localhost:3001

---

**Happy Testing! 🚀**

Last Updated: 2025-12-14
