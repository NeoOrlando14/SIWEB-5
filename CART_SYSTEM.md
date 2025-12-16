# 🛒 Sistem Keranjang & Bulk Payment - Dokumentasi

## 📋 Overview

Sistem keranjang belanja yang memungkinkan customer untuk:
- ✅ Memilih multiple transaksi pending sekaligus
- ✅ Melakukan bulk payment (bayar semua yang dipilih)
- ✅ Melihat pemisahan UI antara transaksi pending dan riwayat
- ✅ Mendapat poin sesuai jumlah transaksi yang dibayar

---

## ✨ Fitur Utama

### 1. **Keranjang Belanja (Shopping Cart)**
- Checkbox untuk setiap item pending
- Select all / Unselect all
- Counter jumlah item dipilih
- Total harga otomatis

### 2. **Bulk Payment**
- Bayar multiple transaksi dalam 1 klik
- Popup konfirmasi dengan total harga
- QRIS code untuk pembayaran
- Auto-update poin sesuai jumlah transaksi

### 3. **Pemisahan UI**
- **Box 1:** Keranjang Belanja (pending) - border orange
- **Box 2:** Riwayat Pemesanan (diterima/ditolak) - border gray
- Riwayat diurutkan berdasarkan tanggal (terbaru dulu)

---

## 🎨 UI Components

### A. Keranjang Belanja (Pending Transactions)

```jsx
{/* Header dengan Select All */}
<div className="bg-[#1f1f1f] border border-orange-500">
  <h2>🛒 Keranjang Belanja</h2>
  <button onClick={selectAllPending}>Pilih Semua</button>
  <button onClick={clearCart}>Batal Pilih</button>
</div>

{/* Table dengan Checkbox */}
<table>
  <thead>
    <tr>
      <th><input type="checkbox" /></th> {/* Select All */}
      <th>Produk</th>
      <th>Tanggal</th>
      <th>Harga</th>
      <th>Status</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    {/* Each row dengan checkbox */}
    <tr>
      <td><input type="checkbox" /></td>
      ...
    </tr>
  </tbody>
</table>

{/* Bulk Payment Footer */}
{selectedCart.length > 0 && (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700">
    <p>{selectedCart.length} item dipilih</p>
    <p>Total: Rp {getTotalCart().toLocaleString()}</p>
    <button>💳 Bayar Semua</button>
  </div>
)}
```

### B. Riwayat Pemesanan (History)

```jsx
<div className="bg-[#1f1f1f] border border-gray-700">
  <h2>📜 Riwayat Pemesanan</h2>

  <table>
    {/* No checkbox, readonly */}
    <tbody>
      {historyTransactions.map(...)}
    </tbody>
  </table>
</div>
```

---

## 🔄 Flow Diagram

### Single Payment Flow:
```
Customer klik "Bayar" pada 1 item
    ↓
Popup QRIS muncul
    ↓
Customer scan & bayar
    ↓
Klik "Saya sudah bayar"
    ↓
Status → "diterima"
    ↓
+1 Poin
    ↓
Item pindah ke Riwayat
```

### Bulk Payment Flow:
```
Customer pilih beberapa item (checkbox)
    ↓
Total harga ter-kalkulasi otomatis
    ↓
Klik "💳 Bayar Semua (X)"
    ↓
Popup bulk payment dengan total
    ↓
Customer scan QRIS & bayar total
    ↓
Klik "✓ Sudah Bayar"
    ↓
Loop: Update semua transaksi → "diterima"
    ↓
+N Poin (N = jumlah item)
    ↓
Semua item pindah ke Riwayat
    ↓
Keranjang kosong
```

---

## 📊 State Management

### States:

```javascript
const [data, setData] = useState([]);                    // All transactions
const [selectedCart, setSelectedCart] = useState([]);    // Array of selected IDs
const [bulkPaymentPopup, setBulkPaymentPopup] = useState(false);
const [poinEarned, setPoinEarned] = useState(1);         // Dynamic poin count
const [userPoin, setUserPoin] = useState(0);             // Total user poin
```

### Computed Values:

```javascript
// Pending transactions (untuk keranjang)
const pendingTransactions = data.filter((t) => t.status === "pending");

// History transactions (untuk riwayat)
const historyTransactions = data
  .filter((t) => t.status !== "pending")
  .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
```

---

## 🛠️ Functions

### 1. Cart Management

#### `toggleSelectItem(id)`
Toggle selection untuk single item.

```javascript
const toggleSelectItem = (id) => {
  if (selectedCart.includes(id)) {
    setSelectedCart(selectedCart.filter((item) => item !== id));
  } else {
    setSelectedCart([...selectedCart, id]);
  }
};
```

#### `selectAllPending()`
Pilih semua transaksi pending.

```javascript
const selectAllPending = () => {
  const pendingIds = data.filter((t) => t.status === "pending").map((t) => t.id);
  setSelectedCart(pendingIds);
};
```

#### `clearCart()`
Hapus semua selection.

```javascript
const clearCart = () => {
  setSelectedCart([]);
};
```

#### `getTotalCart()`
Hitung total harga dari item yang dipilih.

```javascript
const getTotalCart = () => {
  return data
    .filter((t) => selectedCart.includes(t.id))
    .reduce((sum, t) => sum + t.total_harga, 0);
};
```

### 2. Payment Functions

#### `updateStatus(id)` - Single Payment
Update 1 transaksi, dapat +1 poin.

```javascript
const updateStatus = async (id) => {
  await fetch(`/api/admin-transaksi/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "diterima" }),
  });

  setPoinEarned(1); // Single = 1 poin
  setSuccessPopup(true);
  // Reload data & poin
};
```

#### `handleBulkPayment()` - Bulk Payment
Update semua transaksi yang dipilih, dapat +N poin.

```javascript
const handleBulkPayment = async () => {
  const itemCount = selectedCart.length;

  // Loop update semua
  for (const id of selectedCart) {
    await fetch(`/api/admin-transaksi/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "diterima" }),
    });
  }

  setPoinEarned(itemCount); // Bulk = N poin
  setSuccessPopup(true);
  setSelectedCart([]);
  // Reload data & poin
};
```

---

## 🎯 User Journey

### Scenario 1: Single Payment
1. Customer buka halaman "Transaksi Saya"
2. Lihat 3 transaksi pending di Keranjang
3. Klik "Bayar" pada item pertama
4. Popup QRIS muncul
5. Scan & bayar
6. Klik "Saya sudah bayar"
7. **Result:**
   - Item pindah ke Riwayat
   - Popup: "+1 Poin"
   - Badge poin bertambah 1

### Scenario 2: Bulk Payment (3 items)
1. Customer buka halaman "Transaksi Saya"
2. Lihat 5 transaksi pending di Keranjang
3. Centang checkbox pada 3 item
4. Footer muncul: "3 item dipilih | Total: Rp 150.000"
5. Klik "💳 Bayar Semua (3)"
6. Popup bulk payment muncul
7. Scan QRIS & bayar total Rp 150.000
8. Klik "✓ Sudah Bayar"
9. **Result:**
   - 3 item pindah ke Riwayat
   - 2 item masih di Keranjang
   - Popup: "+3 Poin"
   - Badge poin bertambah 3
   - Keranjang kosong (checkbox clear)

### Scenario 3: Select All
1. Customer punya 10 transaksi pending
2. Klik "Pilih Semua"
3. Semua checkbox tercentang
4. Footer: "10 item dipilih | Total: Rp 500.000"
5. Bayar semua → **+10 Poin!**

---

## 📁 File Modified

**File:** [app/transaksi-saya/page.js](app/transaksi-saya/page.js)

### Changes:

#### 1. New States
```javascript
const [selectedCart, setSelectedCart] = useState([]);
const [bulkPaymentPopup, setBulkPaymentPopup] = useState(false);
const [poinEarned, setPoinEarned] = useState(1);
```

#### 2. New Functions
- `toggleSelectItem(id)`
- `selectAllPending()`
- `clearCart()`
- `getTotalCart()`
- `handleBulkPayment()`

#### 3. UI Restructure
- **Before:** Single table dengan semua transaksi
- **After:**
  - Box 1: Keranjang (pending only) dengan checkbox
  - Box 2: Riwayat (diterima/ditolak) tanpa checkbox

#### 4. Dynamic Poin
- Single payment: `setPoinEarned(1)`
- Bulk payment: `setPoinEarned(itemCount)`
- Success popup: `+{poinEarned} Poin`

---

## 🧪 Testing Guide

### Test Case 1: Single Item Selection
**Steps:**
1. Centang 1 item
2. Lihat footer muncul dengan "1 item dipilih"
3. Klik checkbox lagi
4. Footer hilang

**Expected:** ✅ Footer toggle dengan benar

### Test Case 2: Select All
**Steps:**
1. Klik "Pilih Semua"
2. Check: semua checkbox tercentang
3. Klik "Batal Pilih"
4. Check: semua checkbox kosong

**Expected:** ✅ Select/deselect berfungsi

### Test Case 3: Bulk Payment (3 items)
**Steps:**
1. Pilih 3 item (total: Rp 150.000)
2. Klik "💳 Bayar Semua (3)"
3. Popup muncul dengan total Rp 150.000
4. Klik "✓ Sudah Bayar"

**Expected:**
- ✅ 3 transaksi status → "diterima"
- ✅ 3 item pindah ke Riwayat
- ✅ Popup: "+3 Poin"
- ✅ Database: poin +3
- ✅ Keranjang kosong

### Test Case 4: Total Calculation
**Steps:**
1. Item A: Rp 50.000
2. Item B: Rp 75.000
3. Item C: Rp 25.000
4. Centang A + B

**Expected:**
- ✅ Footer: "Total: Rp 125.000"
- ❌ Bukan Rp 150.000

### Test Case 5: Riwayat Sorting
**Steps:**
1. Bayar item tanggal 10 Dec
2. Bayar item tanggal 8 Dec
3. Bayar item tanggal 12 Dec

**Expected:** Riwayat urutan:
1. 12 Dec (terbaru)
2. 10 Dec
3. 8 Dec (terlama)

---

## 🎨 UI/UX Highlights

### Color Coding:
- **Keranjang:** `border-orange-500` (menarik perhatian)
- **Riwayat:** `border-gray-700` (netral, readonly)
- **Footer Bulk:** `bg-gradient-to-r from-blue-600 to-blue-700`
- **Button Bayar Semua:** `bg-green-500`

### Icons:
- 🛒 Keranjang Belanja
- 📜 Riwayat Pemesanan
- 💳 Bayar Semua
- ✓ Sudah Bayar
- 🛍️ Empty cart state
- 📋 Empty history state

### Empty States:
```jsx
{/* Keranjang Kosong */}
<div className="text-center py-8">
  <p className="text-4xl">🛍️</p>
  <p>Keranjang kosong - Belum ada transaksi pending</p>
</div>

{/* Riwayat Kosong */}
<div className="text-center py-8">
  <p className="text-4xl">📋</p>
  <p>Belum ada riwayat pemesanan</p>
</div>
```

---

## 📊 Performance Considerations

### 1. **Bulk Update Optimization**
Currently using loop (serial):
```javascript
for (const id of selectedCart) {
  await fetch(...);
}
```

**Future optimization** - Parallel requests:
```javascript
await Promise.all(
  selectedCart.map(id =>
    fetch(`/api/admin-transaksi/${id}`, {...})
  )
);
```

### 2. **Data Reload**
Setelah bulk payment, reload semua data.

**Future:** Only update affected items in state (no full reload).

---

## 🔮 Future Enhancements

### 1. **Bulk Actions Lainnya**
- Delete multiple transaksi
- Cancel multiple pending orders

### 2. **Smart Selection**
- "Pilih > Rp 100.000"
- "Pilih transaksi bulan ini"
- "Pilih dari produk tertentu"

### 3. **Payment Methods**
- Support multiple payment (QRIS, Transfer, E-wallet)
- Different QR code per method

### 4. **Batch Limits**
- Max 10 items per bulk payment
- Warning jika total > Rp 1.000.000

### 5. **Undo Feature**
- "Batalkan pembayaran terakhir"
- Restore ke pending (dalam 5 menit)

---

## 🐛 Troubleshooting

### Problem: Checkbox tidak bisa di-uncheck
**Cause:** State selectedCart tidak update

**Fix:**
```javascript
// Check function toggleSelectItem
console.log('Before:', selectedCart);
toggleSelectItem(id);
console.log('After:', selectedCart);
```

### Problem: Total salah hitung
**Cause:** Data belum ter-load saat `getTotalCart()` dipanggil

**Fix:**
```javascript
// Add safety check
const getTotalCart = () => {
  if (!data.length) return 0;
  return data.filter(...).reduce(...);
};
```

### Problem: Poin tidak bertambah sesuai jumlah
**Cause:** `setPoinEarned` tidak dipanggil

**Check:**
```javascript
// In handleBulkPayment
console.log('Item count:', selectedCart.length);
setPoinEarned(selectedCart.length);
```

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| Checkbox selection | ✅ Done |
| Select all / Clear all | ✅ Done |
| Bulk payment | ✅ Done |
| Dynamic total calculation | ✅ Done |
| Pemisahan UI (Keranjang vs Riwayat) | ✅ Done |
| Sorting riwayat by date | ✅ Done |
| Dynamic poin (1 untuk single, N untuk bulk) | ✅ Done |
| Empty states | ✅ Done |
| Bulk payment popup | ✅ Done |

**Sistem keranjang dan bulk payment sudah siap digunakan!** 🎉

---

© 2024 - Cart System by SPLSK Team
