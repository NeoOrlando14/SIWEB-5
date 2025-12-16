# UI Produk Stok Habis di Halaman Shop

## Fitur yang Ditambahkan

### 1. Visual Indicator untuk Stok Habis

Produk dengan stok 0 atau null akan ditampilkan dengan:
- ✅ **Overlay Transparan** dengan teks "STOK HABIS"
- ✅ **Gambar Grayscale** (hitam putih)
- ✅ **Border Merah** pada card produk
- ✅ **Opacity 70%** untuk membedakan dari produk tersedia
- ✅ **Icon ❌** besar di tengah overlay

### 2. Button & Controls Disabled

Untuk produk stok habis:
- ✅ **Button "Tambah ke Keranjang"** → Disabled, berubah jadi "❌ Tidak Tersedia"
- ✅ **Quantity Selector (+ / -)** → Disabled
- ✅ **Cursor** → `cursor-not-allowed`
- ✅ **Color** → Gray (tidak menarik perhatian)

### 3. Stock Indicator dengan Warna

Sistem menampilkan 3 level stok:

| Kondisi Stok | Warna | Icon | Label |
|--------------|-------|------|-------|
| **Habis** (0) | 🔴 Merah | ⚠️ | "Stok: 0 (Habis)" |
| **Terbatas** (1-5) | 🟡 Kuning | ⚡ | "Stok: X (Terbatas!)" |
| **Tersedia** (>5) | 🟢 Hijau | ✓ | "Stok: X (Tersedia)" |

### 4. Validasi Quantity

- ✅ Quantity tidak bisa melebihi stok yang tersedia
- ✅ Tombol "+" disabled jika quantity = stok
- ✅ Alert jika user coba tambah quantity > stok

## Tampilan Visual

### Produk Normal (Stok Tersedia)

```
┌────────────────────────────┐
│  [Foto Produk - Berwarna]  │
│                            │
│  Nasi Goreng               │
│  Rp 15,000                 │
│                            │
│  ✓ Stok: 50 (Tersedia)    │ ← Hijau
│                            │
│  [ - ]  [ 1 ]  [ + ]       │ ← Enabled
│                            │
│  🛒 Tambah ke Keranjang    │ ← Biru, Clickable
└────────────────────────────┘
```

### Produk Stok Terbatas (1-5)

```
┌────────────────────────────┐
│  [Foto Produk - Berwarna]  │
│                            │
│  Mie Goreng                │
│  Rp 12,000                 │
│                            │
│  ⚡ Stok: 3 (Terbatas!)   │ ← Kuning, Warning
│                            │
│  [ - ]  [ 1 ]  [ + ]       │ ← Max 3
│                            │
│  🛒 Tambah ke Keranjang    │ ← Biru, Clickable
└────────────────────────────┘
```

### Produk Stok Habis (0)

```
┌────────────────────────────┐
│  ╔════════════════════╗    │
│  ║       ❌           ║    │ ← Overlay Transparan
│  ║   STOK HABIS       ║    │
│  ║  Mohon maaf,       ║    │
│  ║  produk sementara  ║    │
│  ║  tidak tersedia    ║    │
│  ╚════════════════════╝    │
│  [Foto - Grayscale]        │ ← Hitam Putih
│                            │
│  Es Teh                    │
│  Rp 5,000                  │
│                            │
│  ⚠️ Stok: 0 (Habis)       │ ← Merah
│                            │
│  [ - ]  [ 1 ]  [ + ]       │ ← Disabled, Gray
│                            │
│  ❌ Tidak Tersedia         │ ← Disabled, Gray
└────────────────────────────┘
```

## Kode Implementasi

### File: [app/shop/page.js](app/shop/page.js)

#### 1. Check Stok (Line 133)
```javascript
const isOutOfStock = !product.stok || product.stok === 0;
```

#### 2. Conditional Styling (Line 136-142)
```javascript
<div
  className={`bg-[#1f1f1f] border rounded-xl shadow p-3 relative transition-all ${
    isOutOfStock
      ? 'border-red-600 opacity-70'
      : 'border-gray-700 hover:border-blue-500'
  }`}
>
```

#### 3. Overlay untuk Stok Habis (Line 145-153)
```javascript
{isOutOfStock && (
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
    <div className="text-center">
      <div className="text-5xl mb-2">❌</div>
      <p className="text-red-400 font-bold text-xl">STOK HABIS</p>
      <p className="text-gray-300 text-sm mt-1">
        Mohon maaf, produk<br/>sementara tidak tersedia
      </p>
    </div>
  </div>
)}
```

#### 4. Gambar Grayscale (Line 155-159)
```javascript
<img
  src={product.image}
  className={`h-40 w-full object-cover rounded-lg ${isOutOfStock ? 'grayscale' : ''}`}
  alt={product.nama}
/>
```

#### 5. Stock Indicator (Line 167-181)
```javascript
{isOutOfStock ? (
  <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
    <span>⚠️</span> Stok: 0 (Habis)
  </p>
) : product.stok <= 5 ? (
  <p className="text-yellow-400 text-sm font-semibold flex items-center gap-1">
    <span>⚡</span> Stok: {product.stok} (Terbatas!)
  </p>
) : (
  <p className="text-green-400 text-sm font-semibold flex items-center gap-1">
    <span>✓</span> Stok: {product.stok} (Tersedia)
  </p>
)}
```

#### 6. Disabled Quantity Selector (Line 184-210)
```javascript
<button
  onClick={() => !isOutOfStock && handleQuantityChange(product.id, -1)}
  disabled={isOutOfStock}
  className={`w-8 h-8 rounded-full font-bold ${
    isOutOfStock
      ? 'bg-gray-800 cursor-not-allowed'
      : 'bg-gray-700 hover:bg-gray-600'
  }`}
>
  −
</button>
```

#### 7. Disabled Add to Cart Button (Line 213-223)
```javascript
<button
  onClick={() => !isOutOfStock && handleAddToCart(product)}
  disabled={isOutOfStock}
  className={`w-full py-2 rounded-lg font-semibold transition-all ${
    isOutOfStock
      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
      : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
  }`}
>
  {isOutOfStock ? '❌ Tidak Tersedia' : '🛒 Tambah ke Keranjang'}
</button>
```

### Validasi di Function

#### 1. handleQuantityChange (Line 36-49)
```javascript
const handleQuantityChange = (productId, change) => {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  setQuantities(prev => {
    const newQty = (prev[productId] || 1) + change;
    // Validate: quantity must be between 1 and available stock
    const validQty = Math.max(1, Math.min(newQty, product.stok || 0));
    return {
      ...prev,
      [productId]: validQty
    };
  });
};
```

**Validasi:**
- ✅ Quantity minimum: 1
- ✅ Quantity maximum: stok yang tersedia
- ✅ Tidak bisa tambah jika sudah = stok

#### 2. handleAddToCart (Line 51-75)
```javascript
// Check if product is out of stock
if (!product.stok || product.stok === 0) {
  alert("Maaf, produk ini sedang habis!");
  return;
}

const quantity = quantities[product.id] || 1;

// Validate quantity doesn't exceed stock
if (quantity > product.stok) {
  alert(`Maaf, stok hanya tersisa ${product.stok} item!`);
  // Reset quantity to max available stock
  setQuantities(prev => ({ ...prev, [product.id]: product.stok }));
  return;
}
```

**Validasi:**
- ✅ Cek stok habis sebelum add to cart
- ✅ Alert jika quantity > stok
- ✅ Auto-reset quantity ke max stok

## User Experience Flow

### Scenario 1: Produk Tersedia (Stok 50)

1. Customer lihat produk dengan border hijau
2. Stock indicator: "✓ Stok: 50 (Tersedia)"
3. Customer pilih quantity 3
4. Klik "🛒 Tambah ke Keranjang"
5. ✅ Berhasil ditambahkan

### Scenario 2: Produk Terbatas (Stok 2)

1. Customer lihat produk dengan border kuning
2. Stock indicator: "⚡ Stok: 2 (Terbatas!)"
3. Customer coba pilih quantity 5
4. Tombol "+" tidak bisa diklik setelah quantity = 2
5. Customer pilih quantity 2
6. Klik "🛒 Tambah ke Keranjang"
7. ✅ Berhasil ditambahkan

### Scenario 3: Produk Habis (Stok 0)

1. Customer lihat produk dengan:
   - ❌ Overlay "STOK HABIS"
   - 🔴 Border merah
   - 🎨 Gambar hitam putih
2. Stock indicator: "⚠️ Stok: 0 (Habis)"
3. Quantity selector: Disabled (gray)
4. Button: "❌ Tidak Tersedia" (gray, disabled)
5. Customer **tidak bisa** klik apapun
6. ❌ Tidak bisa add to cart

### Scenario 4: Customer Coba Bypass (Quantity > Stok)

1. Produk stok: 3
2. Customer somehow set quantity ke 5 (misal via console)
3. Klik "Tambah ke Keranjang"
4. ⚠️ Alert: "Maaf, stok hanya tersisa 3 item!"
5. Quantity auto-reset ke 3
6. ❌ Tidak ditambahkan ke cart

## Styling Details

### Colors

| Element | Out of Stock | Low Stock (1-5) | In Stock (>5) |
|---------|--------------|-----------------|---------------|
| **Border** | 🔴 `border-red-600` | 🟡 `border-gray-700` + warning text | 🟢 `border-gray-700` |
| **Stock Text** | 🔴 `text-red-400` | 🟡 `text-yellow-400` | 🟢 `text-green-400` |
| **Button** | ⚫ `bg-gray-700` + `text-gray-500` | 🔵 `bg-blue-500` | 🔵 `bg-blue-500` |
| **Opacity** | 70% | 100% | 100% |
| **Image** | Grayscale | Color | Color |

### Effects

- **Hover**: Card border berubah biru (hanya jika stok > 0)
- **Disabled**: `cursor-not-allowed`
- **Transition**: `transition-all` untuk smooth animation
- **Backdrop Blur**: Overlay dengan `backdrop-blur-sm`

## Manfaat

### Untuk Customer

1. ✅ **Jelas & Transparan**
   - Langsung tahu produk habis atau tidak
   - Tidak perlu klik untuk tahu stok

2. ✅ **Tidak Frustasi**
   - Tidak bisa add to cart produk habis
   - Tidak ada error "Stok tidak cukup" setelah checkout

3. ✅ **Warning Stok Terbatas**
   - Tau jika stok tinggal sedikit
   - Bisa cepat ambil keputusan

### Untuk Owner

1. ✅ **Profesional**
   - UI yang clean dan modern
   - Tidak membingungkan customer

2. ✅ **Mengurangi Complain**
   - Customer sudah tau sebelum checkout
   - Tidak ada ekspektasi yang salah

3. ✅ **Motivasi Update Stok**
   - Visual "STOK HABIS" yang jelas
   - Owner termotivasi untuk segera restock

## Testing

### Test 1: Produk dengan Stok Normal
```
Stok di database: 50

Expected:
- Border: Gray
- Stock Text: "✓ Stok: 50 (Tersedia)" (Hijau)
- Button: "🛒 Tambah ke Keranjang" (Biru, Enabled)
- Quantity: Bisa tambah sampai 50
```

### Test 2: Produk dengan Stok Terbatas
```
Stok di database: 3

Expected:
- Border: Gray
- Stock Text: "⚡ Stok: 3 (Terbatas!)" (Kuning)
- Button: "🛒 Tambah ke Keranjang" (Biru, Enabled)
- Quantity: Max 3, tidak bisa lebih
```

### Test 3: Produk Stok Habis
```
Stok di database: 0

Expected:
- Border: Merah
- Overlay: "❌ STOK HABIS"
- Image: Grayscale
- Stock Text: "⚠️ Stok: 0 (Habis)" (Merah)
- Button: "❌ Tidak Tersedia" (Gray, Disabled)
- Quantity: Disabled
- Opacity: 70%
```

### Test 4: Owner Update Stok
```
1. Stok awalnya: 0 (Habis)
2. Customer lihat "STOK HABIS"
3. Owner update stok: 0 → 20
4. Customer refresh halaman
5. Expected: Produk sekarang bisa dibeli
```

## File yang Diubah

**[app/shop/page.js](app/shop/page.js)**

### Changes:
1. **Line 36-49**: Update `handleQuantityChange` dengan validasi max stok
2. **Line 51-75**: Update `handleAddToCart` dengan validasi stok
3. **Line 132-227**: Update UI card produk dengan:
   - Out of stock overlay
   - Conditional styling
   - Stock indicator dengan warna
   - Disabled controls untuk stok habis

## Dokumentasi Terkait

- **[STOCK_MANAGEMENT_SYSTEM.md](STOCK_MANAGEMENT_SYSTEM.md)** - Sistem manajemen stok
- **[DASHBOARD_STATUS_FIX.md](DASHBOARD_STATUS_FIX.md)** - Fix status dashboard

## Kesimpulan

**UI Stok Habis** yang telah ditambahkan memberikan:
- ✅ Visual yang jelas untuk produk habis
- ✅ Validasi yang ketat untuk quantity
- ✅ Better user experience
- ✅ Professional & modern design
- ✅ Tidak ada lagi customer frustasi karena produk habis

**Customer tidak bisa lagi memesan produk yang stoknya habis!** 🎉
