# 💳 Customer Payment Flow - Dokumentasi

## 📋 Overview

Sistem pembayaran customer yang **tidak mengubah status transaksi**. Customer hanya menampilkan QRIS dan menutup popup. **Admin yang bertanggung jawab** mengubah status pesanan dari "pending" → "diterima".

---

## 🔄 Flow Diagram

### Customer Side (Pembayaran):
```
Customer pilih item di keranjang
    ↓
Klik "💳 Bayar"
    ↓
Popup QRIS muncul dengan total harga
    ↓
Customer scan QRIS & bayar secara offline
    ↓
Klik "Selesai"
    ↓
Popup tertutup
    ↓
Status TETAP "pending" ❗
    ↓
Menunggu admin verifikasi...
```

### Admin Side (Verifikasi):
```
Admin buka dashboard transaksi
    ↓
Lihat transaksi dengan status "pending"
    ↓
Verifikasi pembayaran (cek rekening/bukti)
    ↓
Ubah status → "diterima"
    ↓
API auto-increment poin customer (+1 atau +N)
    ↓
Customer dapat notifikasi poin (jika online)
```

---

## ✨ Fitur Customer Payment

### 1. **Single Payment**
- Customer klik tombol "Bayar" pada 1 item (DIHAPUS - sekarang pakai header button)
- Customer centang 1 item, klik "💳 Bayar (1)" di header
- Popup menampilkan:
  - Total harga: Rp X
  - QRIS code
  - Info: "Admin akan memverifikasi pembayaran"
  - Tombol: "Batal" dan "Selesai"
- Klik "Selesai" → popup close, **status TETAP pending**

### 2. **Bulk Payment**
- Customer centang multiple items
- Footer muncul dengan total harga
- Klik "💳 Bayar Semua (X)"
- Popup bulk payment menampilkan:
  - Jumlah item dipilih
  - Total harga semua item
  - QRIS code
  - Info: "Admin akan memverifikasi semua pesanan"
  - Tombol: "Batal" dan "Selesai"
- Klik "Selesai" → popup close, selection clear, **status TETAP pending**

---

## 🎨 UI Components

### Single Payment Popup
```jsx
<div className="popup">
  <h2>Pembayaran QRIS</h2>

  {/* Total */}
  <div className="bg-[#2a2a2a]">
    <p>Total yang harus dibayar:</p>
    <p>Rp {total.toLocaleString()}</p>
  </div>

  {/* QRIS */}
  <img src="/qris-demo.png" />

  {/* Info Box */}
  <div className="bg-blue-500/10 border border-blue-500/30">
    <p>ℹ️ Setelah pembayaran selesai, admin akan memverifikasi
       dan mengubah status pesanan Anda. Poin akan otomatis
       bertambah setelah diverifikasi.</p>
  </div>

  {/* Buttons */}
  <button onClick={close}>Batal</button>
  <button onClick={closePaymentPopup}>Selesai</button>
</div>
```

### Bulk Payment Popup
```jsx
<div className="popup">
  <h2>💳 Pembayaran Bulk ({count} item)</h2>

  {/* Total */}
  <div className="bg-[#2a2a2a]">
    <p>{count} transaksi dipilih</p>
    <p>Total: Rp {total.toLocaleString()}</p>
  </div>

  {/* QRIS */}
  <img src="/qris-demo.png" />

  {/* Info Box */}
  <div className="bg-blue-500/10 border border-blue-500/30">
    <p>ℹ️ Setelah pembayaran selesai, admin akan memverifikasi
       dan mengubah status semua pesanan yang dipilih. Poin akan
       otomatis bertambah sesuai jumlah transaksi setelah diverifikasi.</p>
  </div>

  {/* Buttons */}
  <button onClick={close}>Batal</button>
  <button onClick={closeBulkPaymentPopup}>Selesai</button>
</div>
```

---

## 📁 File Changes

### [app/transaksi-saya/page.js](app/transaksi-saya/page.js)

#### States (Removed):
```javascript
// ❌ DIHAPUS
const [successPopup, setSuccessPopup] = useState(false);
const [poinEarned, setPoinEarned] = useState(1);
```

#### Functions (Changed):
```javascript
// ❌ BEFORE (Customer update status)
const updateStatus = async (id) => {
  await fetch(`/api/admin-transaksi/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "diterima" }),
  });
  setPoinEarned(1);
  setSuccessPopup(true);
  // Reload data & poin
};

// ✅ AFTER (Customer hanya close popup)
const closePaymentPopup = () => {
  setPopup(null); // Status TETAP "pending"
};
```

```javascript
// ❌ BEFORE (Bulk payment update status)
const handleBulkPayment = async () => {
  for (const id of selectedCart) {
    await fetch(`/api/admin-transaksi/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "diterima" }),
    });
  }
  setPoinEarned(itemCount);
  setSuccessPopup(true);
  // Reload data & poin
};

// ✅ AFTER (Bulk payment hanya close popup)
const closeBulkPaymentPopup = () => {
  setBulkPaymentPopup(false);
  setSelectedCart([]); // Clear selection, status TETAP "pending"
};
```

#### UI Changes:
```javascript
// ❌ BEFORE
<button onClick={() => updateStatus(popup.id)}>
  Saya sudah bayar
</button>

// ✅ AFTER
<button onClick={closePaymentPopup}>
  Selesai
</button>
```

```javascript
// ❌ BEFORE
<button onClick={handleBulkPayment}>
  ✓ Sudah Bayar
</button>

// ✅ AFTER
<button onClick={closeBulkPaymentPopup}>
  Selesai
</button>
```

#### Removed Component:
```javascript
// ❌ DIHAPUS - Success Popup
{successPopup && (
  <div>
    <h2>Pembayaran Berhasil!</h2>
    <p>+{poinEarned} Poin</p>
    <p>Total poin: {userPoin}</p>
  </div>
)}
```

---

## 🔐 Security & Logic

### Why Customer Can't Update Status?

1. **Prevent Fraud**: Customer bisa klik "Bayar" tanpa benar-benar bayar
2. **Manual Verification**: Admin cek rekening/bukti transfer dulu
3. **Poin Integrity**: Poin hanya bertambah setelah pembayaran terverifikasi
4. **Clear Separation**: Customer = pay, Admin = verify

### Current Flow:
```
Customer → Scan QRIS → Bayar offline → Klik "Selesai"
                                         ↓
                                    (Status: pending)
                                         ↓
Admin → Cek rekening → Lihat uang masuk → Update status "diterima"
                                              ↓
                                         (Poin +1/+N)
```

---

## 🧪 Testing Guide

### Test Case 1: Single Payment (No Status Change)
**Steps:**
1. Login sebagai customer
2. Pilih 1 item di keranjang
3. Klik "💳 Bayar (1)"
4. Popup QRIS muncul
5. Klik "Selesai"

**Expected:**
- ✅ Popup tertutup
- ✅ Status TETAP "pending"
- ✅ Item masih ada di keranjang
- ❌ Poin TIDAK bertambah
- ❌ TIDAK ada success popup

### Test Case 2: Bulk Payment (No Status Change)
**Steps:**
1. Login sebagai customer
2. Pilih 3 item di keranjang
3. Klik "💳 Bayar Semua (3)"
4. Popup bulk payment muncul
5. Klik "Selesai"

**Expected:**
- ✅ Popup tertutup
- ✅ Selection cleared
- ✅ Status semua item TETAP "pending"
- ✅ Semua item masih di keranjang
- ❌ Poin TIDAK bertambah
- ❌ TIDAK ada success popup

### Test Case 3: Admin Verification (Status Change)
**Steps:**
1. Login sebagai admin
2. Buka admin-transaksi
3. Pilih transaksi dengan status "pending"
4. Ubah status → "diterima"
5. Simpan

**Expected:**
- ✅ Status berubah → "diterima"
- ✅ Poin customer +1
- ✅ Transaksi pindah ke riwayat (customer side)
- ✅ Console log: "✅ Poin +1 untuk user..."

---

## 📊 Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Customer klik "Bayar" | Update status → "diterima" | Hanya close popup |
| Poin bertambah kapan? | Saat customer klik | Saat admin approve |
| Success popup | Ada (+N Poin) | Tidak ada |
| Status setelah bayar | "diterima" | "pending" |
| Verifikasi manual | Tidak | Ya (admin) |
| Security | Rendah (bisa fraud) | Tinggi (verified) |

---

## 🎯 User Journey

### Scenario: Customer Beli 3 Items

1. **Customer Dashboard**
   - Pilih 3 item di keranjang
   - Total: Rp 150.000
   - Klik "💳 Bayar Semua (3)"

2. **Payment Popup**
   - Lihat QRIS code
   - Scan dengan app e-wallet
   - Bayar Rp 150.000
   - Klik "Selesai"

3. **After Payment**
   - Popup tertutup
   - 3 item masih di keranjang (status: pending)
   - Menunggu admin verifikasi...

4. **Admin Verification**
   - Admin cek rekening → uang masuk ✅
   - Admin buka dashboard
   - Ubah 3 transaksi → status "diterima"

5. **Auto Poin System**
   - API detect status change: "pending" → "diterima"
   - API increment poin: +3
   - Database: `users.poin` update

6. **Customer Check Again**
   - Buka halaman transaksi
   - 3 item pindah ke "Riwayat Pemesanan"
   - Badge poin: bertambah +3
   - Status: ✔ Diterima (hijau)

---

## 🐛 Troubleshooting

### Problem: Customer complain "kenapa belum dapat poin?"
**Answer:** Poin akan otomatis bertambah setelah admin memverifikasi pembayaran Anda. Silakan tunggu beberapa saat.

### Problem: Admin lupa verifikasi
**Solution:**
- Cek dashboard admin-transaksi
- Filter: status = "pending"
- Verifikasi manual satu per satu

### Problem: Poin tidak bertambah meskipun sudah diverifikasi
**Check:**
1. Apakah status berubah dari "pending" → "diterima"?
2. Apakah user role = "customer"?
3. Cek console log: `✅ Poin +1 untuk user...`

**Manual fix:**
```sql
UPDATE users
SET poin = poin + 1
WHERE email = 'customer@gmail.com';
```

---

## 📝 Notes

### Info Box Content
Text di popup memberitahu customer bahwa:
1. Admin akan memverifikasi pembayaran
2. Status akan diubah oleh admin
3. Poin otomatis bertambah setelah diverifikasi
4. Customer tidak perlu khawatir - sistem otomatis

### Button Label
- **"Selesai"** (bukan "Saya sudah bayar")
  - Lebih netral
  - Tidak mengimplikasikan status berubah
  - Clear expectation: hanya menutup popup

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| Customer dapat scan QRIS | ✅ Done |
| Customer TIDAK update status | ✅ Done |
| Admin verifikasi manual | ✅ Done (via dashboard) |
| Auto poin setelah admin approve | ✅ Done (existing API) |
| Info box notification | ✅ Done |
| Remove success popup | ✅ Done |
| Button label: "Selesai" | ✅ Done |
| Security: prevent fraud | ✅ Done |

**Sistem pembayaran customer sudah aman dan sesuai flow bisnis!** 🎉

---

© 2024 - Customer Payment Flow by SPLSK Team
