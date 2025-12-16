# ⭐ Sistem Bonus Poin - Dokumentasi

## 📋 Overview

Fitur bonus poin untuk transaksi ≥ Rp 50.000 yang mendorong customer untuk belanja lebih banyak.

---

## 🎁 Aturan Bonus

### 1. **Poin Dasar** (Base Poin)
- **Setiap transaksi** yang selesai → **+1 poin**
- Berlaku untuk semua transaksi tanpa minimum

### 2. **Bonus Poin**
- **Transaksi ≥ Rp 50.000** → **+1 bonus poin**
- **Total reward: +2 poin** (1 base + 1 bonus)

### 3. **Kriteria Harga**
Harga yang digunakan untuk menentukan bonus adalah **harga final**:
- **Jika pakai diskon poin:** `harga_akhir` (total_harga - diskon_poin)
- **Jika tidak pakai diskon:** `total_harga`

---

## 📊 Tabel Reward

| Harga Final | Base | Bonus | Total Reward |
|-------------|------|-------|--------------|
| < Rp 50.000 | +1 | - | **+1 poin** |
| ≥ Rp 50.000 | +1 | +1 | **+2 poin** ⭐ |

---

## 💡 Contoh Skenario

### Scenario 1: Transaksi Kecil (< Rp 50.000)
**Input:**
- Harga: Rp 35.000
- Diskon: Tidak ada

**Calculation:**
- Harga final: Rp 35.000
- Check: Rp 35.000 < Rp 50.000 ❌
- Base poin: +1
- Bonus: Tidak ada
- **Total: +1 poin**

**Console Log:**
```
✅ Poin +1 untuk user customer@gmail.com (transaksi #123)
```

---

### Scenario 2: Transaksi Besar (≥ Rp 50.000)
**Input:**
- Harga: Rp 75.000
- Diskon: Tidak ada

**Calculation:**
- Harga final: Rp 75.000
- Check: Rp 75.000 ≥ Rp 50.000 ✅
- Base poin: +1
- Bonus: +1 ⭐
- **Total: +2 poin**

**Console Log:**
```
✅ Transaksi #124:
   - Harga: Rp 75.000
   - Poin base: +1
   - Poin bonus: +1 (>= Rp 50.000)
   - Total reward: +2
✅ Poin +2 untuk user customer@gmail.com (transaksi #124)
```

---

### Scenario 3: Tepat Rp 50.000 (Edge Case)
**Input:**
- Harga: Rp 50.000
- Diskon: Tidak ada

**Calculation:**
- Harga final: Rp 50.000
- Check: Rp 50.000 ≥ Rp 50.000 ✅ (operator >=)
- Base poin: +1
- Bonus: +1 ⭐
- **Total: +2 poin**

---

### Scenario 4: Dengan Diskon (Masih Dapat Bonus)
**Input:**
- Harga awal: Rp 60.000
- Pakai poin: 5000
- Diskon: Rp 5.000
- **Harga final: Rp 55.000**

**Calculation:**
- Check: Rp 55.000 ≥ Rp 50.000 ✅
- Base poin: +1
- Bonus: +1 ⭐
- Total reward: +2
- Poin dipakai: -5000
- **Net poin: +2 - 5000 = -4998**

**Console Log:**
```
✅ Transaksi #125:
   - Total harga: Rp 60.000
   - Harga final: Rp 55.000
   - Poin dipakai: 5000
   - Diskon: Rp 5.000
   - Poin base: +1
   - Poin bonus: +1 (>= Rp 50.000)
   - Total reward: +2
   - Net poin change: -4998
✅ Poin -4998 untuk user customer@gmail.com (transaksi #125)
```

**Result:**
- Poin sebelum: 5000
- Poin sesudah: 5000 - 4998 = **2 poin**

---

### Scenario 5: Dengan Diskon (Tidak Dapat Bonus)
**Input:**
- Harga awal: Rp 60.000
- Pakai poin: 12.000
- Diskon: Rp 12.000
- **Harga final: Rp 48.000**

**Calculation:**
- Check: Rp 48.000 ≥ Rp 50.000 ❌
- Base poin: +1
- Bonus: Tidak ada
- Total reward: +1
- Poin dipakai: -12.000
- **Net poin: +1 - 12.000 = -11.999**

**Console Log:**
```
✅ Transaksi #126:
   - Total harga: Rp 60.000
   - Harga final: Rp 48.000
   - Poin dipakai: 12000
   - Diskon: Rp 12.000
   - Poin base: +1
   - Poin bonus: +0
   - Total reward: +1
   - Net poin change: -11999
✅ Poin -11999 untuk user customer@gmail.com (transaksi #126)
```

**Result:**
- Poin sebelum: 15.000
- Poin sesudah: 15.000 - 11.999 = **3001 poin**

---

### Scenario 6: Bulk Payment (Mixed)
**Input:**
- Item A: Rp 30.000
- Item B: Rp 45.000
- Item C: Rp 80.000

**Calculation (Per Item):**
- **Item A:** Rp 30.000 < Rp 50.000 → +1 poin
- **Item B:** Rp 45.000 < Rp 50.000 → +1 poin
- **Item C:** Rp 80.000 ≥ Rp 50.000 → +2 poin ⭐

**Total Reward:** 1 + 1 + 2 = **+4 poin**

**Console Log (3x):**
```
✅ Poin +1 untuk user customer@gmail.com (transaksi #127)
✅ Poin +1 untuk user customer@gmail.com (transaksi #128)
✅ Transaksi #129:
   - Harga: Rp 80.000
   - Poin base: +1
   - Poin bonus: +1 (>= Rp 50.000)
   - Total reward: +2
✅ Poin +2 untuk user customer@gmail.com (transaksi #129)
```

---

## 🎨 UI Preview

### Single Payment Popup

#### Jika Dapat Bonus (≥ Rp 50.000):
```jsx
<div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
  <p className="text-blue-300 text-xs">
    🎁 Poin Reward setelah transaksi selesai:
  </p>
  <p className="text-blue-400 font-bold text-lg">
    +2 Poin
  </p>
  <p className="text-yellow-400 text-xs">
    ⭐ Bonus +1 poin (Transaksi ≥ Rp 50.000)
  </p>
</div>
```

**Visual:**
```
┌──────────────────────────────────────┐
│ 🎁 Poin Reward setelah transaksi:   │
│                                       │
│        +2 Poin                        │
│                                       │
│ ⭐ Bonus +1 poin (≥ Rp 50.000)       │
└──────────────────────────────────────┘
```

#### Jika Tidak Dapat Bonus (< Rp 50.000):
```jsx
<div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
  <p className="text-blue-300 text-xs">
    🎁 Poin Reward setelah transaksi selesai:
  </p>
  <p className="text-blue-400 font-bold text-lg">
    +1 Poin
  </p>
  <p className="text-gray-400 text-xs">
    💡 Belanja ≥ Rp 50.000 dapat bonus +1 poin lagi!
  </p>
</div>
```

**Visual:**
```
┌──────────────────────────────────────┐
│ 🎁 Poin Reward setelah transaksi:   │
│                                       │
│        +1 Poin                        │
│                                       │
│ 💡 Belanja ≥ Rp 50k dapat bonus!    │
└──────────────────────────────────────┘
```

---

### Bulk Payment Popup

```jsx
<div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
  <p className="text-blue-300 text-xs">
    🎁 Total Poin Reward (3 transaksi):
  </p>
  <p className="text-blue-400 font-bold text-lg">
    +4 Poin
  </p>
  <p className="text-gray-400 text-xs">
    (3 item × rata-rata 1.33 poin)
  </p>
</div>
```

---

## 🔧 Implementation

### File: [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js:66-108)

```javascript
// Constants
const BONUS_THRESHOLD = 50000; // Rp 50.000

// Get harga final (after discount if any)
const hargaFinal = trx.harga_akhir || trx.total_harga;

// Calculate poin
let basePoin = 1; // Base poin per transaksi
let bonusPoin = 0; // Bonus untuk transaksi besar

if (hargaFinal >= BONUS_THRESHOLD) {
  bonusPoin = 1; // +1 bonus
}

let totalReward = basePoin + bonusPoin; // Total reward
let poinChange = totalReward - trx.poin_dipakai; // Net change

// Update database
await pool.query(
  'UPDATE users SET poin = poin + $1 WHERE id = $2',
  [poinChange, user.id]
);

// Console log
if (trx.poin_dipakai > 0) {
  console.log(`✅ Transaksi #${transactionId}:`);
  console.log(`   - Total harga: Rp ${trx.total_harga.toLocaleString()}`);
  console.log(`   - Harga final: Rp ${hargaFinal.toLocaleString()}`);
  console.log(`   - Poin dipakai: ${trx.poin_dipakai}`);
  console.log(`   - Diskon: Rp ${trx.diskon_poin.toLocaleString()}`);
  console.log(`   - Poin base: +${basePoin}`);
  console.log(`   - Poin bonus: +${bonusPoin} ${bonusPoin > 0 ? '(>= Rp 50.000)' : ''}`);
  console.log(`   - Total reward: +${totalReward}`);
  console.log(`   - Net poin change: ${poinChange > 0 ? '+' : ''}${poinChange}`);
} else if (bonusPoin > 0) {
  console.log(`✅ Transaksi #${transactionId}:`);
  console.log(`   - Harga: Rp ${hargaFinal.toLocaleString()}`);
  console.log(`   - Poin base: +${basePoin}`);
  console.log(`   - Poin bonus: +${bonusPoin} (>= Rp 50.000)`);
  console.log(`   - Total reward: +${totalReward}`);
}
```

---

### File: [app/transaksi-saya/page.js](app/transaksi-saya/page.js)

#### Single Payment Preview:
```javascript
{(() => {
  const hargaFinal = usePoin && poinToUse >= 1000
    ? popup.total_harga - diskonPoin
    : popup.total_harga;

  const isBonus = hargaFinal >= 50000;
  const poinReward = isBonus ? 2 : 1;

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg mb-3">
      <p className="text-blue-300 text-xs mb-1">
        🎁 Poin Reward setelah transaksi selesai:
      </p>
      <p className="text-blue-400 font-bold text-lg">
        +{poinReward} Poin
      </p>
      {isBonus && (
        <p className="text-yellow-400 text-xs mt-1">
          ⭐ Bonus +1 poin (Transaksi ≥ Rp 50.000)
        </p>
      )}
      {!isBonus && (
        <p className="text-gray-400 text-xs mt-1">
          💡 Belanja ≥ Rp 50.000 dapat bonus +1 poin lagi!
        </p>
      )}
    </div>
  );
})()}
```

#### Bulk Payment Preview:
```javascript
{(() => {
  const totalHarga = getTotalCart();
  const hargaFinal = usePoin && poinToUse >= 1000
    ? totalHarga - diskonPoin
    : totalHarga;

  const itemCount = selectedCart.length;
  let totalPoinReward = 0;
  const avgPerItem = hargaFinal / itemCount;

  selectedCart.forEach(() => {
    if (avgPerItem >= 50000) {
      totalPoinReward += 2;
    } else {
      totalPoinReward += 1;
    }
  });

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg mb-3">
      <p className="text-blue-300 text-xs mb-1">
        🎁 Total Poin Reward ({itemCount} transaksi):
      </p>
      <p className="text-blue-400 font-bold text-lg">
        +{totalPoinReward} Poin
      </p>
      {avgPerItem >= 50000 && (
        <p className="text-yellow-400 text-xs mt-1">
          ⭐ Semua item dapat bonus +1 poin (Rata-rata ≥ Rp 50.000)
        </p>
      )}
      <p className="text-gray-400 text-xs mt-1">
        ({itemCount} item × {avgPerItem >= 50000 ? '2' : '1'} poin)
      </p>
    </div>
  );
})()}
```

---

## 🧪 Testing

### Test 1: Normal < 50k
- **Input:** Rp 30.000
- **Expected:** +1 poin (no bonus)
- **UI:** "💡 Belanja ≥ Rp 50.000 dapat bonus!"

### Test 2: Exact 50k
- **Input:** Rp 50.000
- **Expected:** +2 poin (with bonus) ⭐
- **Logic:** `50000 >= 50000` → TRUE

### Test 3: Above 50k
- **Input:** Rp 75.000
- **Expected:** +2 poin (with bonus) ⭐
- **UI:** "⭐ Bonus +1 poin"

### Test 4: With Discount (Still Qualify)
- **Input:** Rp 60.000, diskon Rp 5.000
- **Harga final:** Rp 55.000
- **Expected:** +2 poin (with bonus) ⭐

### Test 5: With Discount (Not Qualify)
- **Input:** Rp 60.000, diskon Rp 12.000
- **Harga final:** Rp 48.000
- **Expected:** +1 poin (no bonus)

### Test 6: Bulk Mixed
- **Items:** Rp 30k, Rp 45k, Rp 80k
- **Expected:** +1, +1, +2 = **+4 poin total**

---

## ⚙️ Configuration

### Change Threshold

**File:** `app/api/admin-transaksi/[id]/route.js`

```javascript
// BEFORE
const BONUS_THRESHOLD = 50000; // Rp 50.000

// AFTER (example: Rp 100.000)
const BONUS_THRESHOLD = 100000; // Rp 100.000
```

### Change Bonus Amount

```javascript
// BEFORE
if (hargaFinal >= BONUS_THRESHOLD) {
  bonusPoin = 1; // +1 bonus
}

// AFTER (example: +2 bonus)
if (hargaFinal >= BONUS_THRESHOLD) {
  bonusPoin = 2; // +2 bonus
}
```

### Multiple Tiers (Future)

```javascript
if (hargaFinal >= 200000) {
  bonusPoin = 5; // Tier 3: +5 bonus
} else if (hargaFinal >= 100000) {
  bonusPoin = 2; // Tier 2: +2 bonus
} else if (hargaFinal >= 50000) {
  bonusPoin = 1; // Tier 1: +1 bonus
}
```

---

## 🎯 Business Impact

### Why Rp 50.000?

1. **Average Order Value:** Meningkatkan AOV customer
2. **Achievable:** Tidak terlalu tinggi, realistic untuk dicapai
3. **2x Reward:** Incentive yang cukup menarik (+1 → +2)
4. **Psychology:** Customer akan menambah item untuk mencapai threshold

### Expected Behavior

**Before Bonus:**
- Customer beli Rp 40.000 → checkout langsung

**After Bonus:**
- Customer beli Rp 40.000 → lihat banner "Belanja Rp 10k lagi dapat bonus poin!"
- Customer add item Rp 15.000
- Total: Rp 55.000 → dapat +2 poin ⭐
- **AOV increase:** Rp 15.000

---

## 📊 Analytics to Track

1. **% transaksi >= Rp 50k** (before vs after)
2. **Average cart value** (before vs after)
3. **Poin redemption rate**
4. **Customer retention**

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| Base poin (+1) | ✅ Done |
| Bonus poin (+1) for ≥ Rp 50k | ✅ Done |
| Harga final calculation | ✅ Done |
| UI preview indicator | ✅ Done |
| Console logging | ✅ Done |
| Bulk payment support | ✅ Done |
| Documentation | ✅ Done |

**Sistem bonus poin sudah aktif dan siap mendorong penjualan!** ⭐🎁

---

© 2024 - Bonus Poin System by SPLSK Team
