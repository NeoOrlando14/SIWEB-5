# Product Delete Protection

## Overview
Sistem proteksi untuk mencegah penghapusan produk yang masih memiliki stok.

## Alasan
- Mencegah kehilangan data produk yang masih relevan
- Memastikan integritas data inventory
- Menghindari kesalahan penghapusan yang tidak disengaja

## Implementasi

### 1. Frontend Validation
**File:** [app/admin-product/page.js](app/admin-product/page.js:62-93)

```javascript
async function deleteProduct(id) {
  // Find product to check stock
  const product = products.find(p => p.id === id);

  if (!product) {
    showToast("Produk tidak ditemukan", "error");
    return;
  }

  // Check if stock is 0
  if (product.stok > 0) {
    showToast(`Tidak dapat menghapus! Produk masih memiliki stok: ${product.stok}`, "error");
    return;
  }

  if (!confirm("Yakin ingin menghapus produk ini?")) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      showToast("Produk berhasil dihapus", "success");
      fetchProducts();
    } else {
      showToast(data.error || "Gagal menghapus produk", "error");
    }
  } catch (e) {
    showToast("Terjadi kesalahan saat menghapus produk", "error");
  }
}
```

### 2. Visual Indicator
**File:** [app/admin-product/page.js](app/admin-product/page.js:267-279)

Tombol delete akan:
- **Abu-abu** dan cursor not-allowed jika stok > 0
- **Merah** dan bisa diklik jika stok = 0
- Tooltip menampilkan informasi stok

```javascript
<Trash2
  onClick={() => deleteProduct(p.id)}
  className={`cursor-pointer ${
    p.stok > 0
      ? "text-gray-600 cursor-not-allowed"
      : "text-red-500 hover:text-red-400"
  }`}
  title={
    p.stok > 0
      ? `Tidak dapat dihapus (stok: ${p.stok})`
      : "Hapus produk"
  }
/>
```

### 3. Backend API Protection
**File:** [app/api/products/[id]/route.js](app/api/products/[id]/route.js:58-96)

```javascript
export async function DELETE(req, { params }) {
  const id = Number(params.id);

  try {
    // Check if product exists and get stock info
    const product = await prisma.produk.findUnique({
      where: { id }
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Produk tidak ditemukan" }),
        { status: 404 }
      );
    }

    // 🛡️ PROTEKSI: Tidak bisa delete produk yang masih ada stoknya
    if (product.stok > 0) {
      return new Response(
        JSON.stringify({
          error: `Tidak dapat menghapus produk yang masih memiliki stok (${product.stok} item). Habiskan stok terlebih dahulu.`
        }),
        { status: 400 }
      );
    }

    await prisma.produk.delete({
      where: { id },
    });

    return Response.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal menghapus produk" }),
      { status: 500 }
    );
  }
}
```

### 4. Toast Notification System
**File:** [app/admin-product/page.js](app/admin-product/page.js:23-29)

```javascript
// Toast notification helper
const showToast = (message, type = "success") => {
  setToast({ show: true, message, type });
  setTimeout(() => {
    setToast({ show: false, message: "", type: "" });
  }, 3000);
};
```

**Toast UI:**
```javascript
{toast.show && (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
    toast.type === "success" ? "bg-green-600" : "bg-red-600"
  }`}>
    <span className="text-2xl">
      {toast.type === "success" ? "✓" : "✕"}
    </span>
    <span className="font-semibold">{toast.message}</span>
  </div>
)}
```

**Animation:** [app/globals.css](app/globals.css:28-42)
```css
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

## Rules

| Kondisi | Dapat Dihapus | Pesan |
|---------|---------------|-------|
| Stok = 0 | ✅ Yes | "Produk berhasil dihapus" |
| Stok > 0 | ❌ No | "Tidak dapat menghapus! Produk masih memiliki stok: X" |
| Produk tidak ada | ❌ No | "Produk tidak ditemukan" |

## User Flow

1. Admin mengklik tombol delete (ikon trash)
2. **Frontend Check:**
   - Jika stok > 0: Tampilkan toast error, tidak lanjut
   - Jika stok = 0: Lanjut ke step 3
3. Konfirmasi dialog: "Yakin ingin menghapus produk ini?"
4. **Backend Check:**
   - Validasi produk exists
   - Validasi stok = 0
   - Jika lolos: Delete produk
5. **Response:**
   - Success: Toast hijau "Produk berhasil dihapus"
   - Error: Toast merah dengan pesan error

## Security

**Triple Layer Protection:**
1. **UI Layer**: Visual indicator (warna abu-abu)
2. **Frontend Layer**: Validasi sebelum API call
3. **Backend Layer**: Validasi final di database

Ini mencegah:
- API bypass melalui tools seperti Postman
- Race conditions
- Penghapusan tidak disengaja

## Benefits

1. **Data Integrity**: Produk dengan stok tidak bisa dihapus
2. **User Experience**: Feedback jelas dengan toast notification
3. **Error Prevention**: Triple layer validation
4. **Visual Feedback**: Warna dan tooltip yang jelas

## Date Implemented
2025-12-13
