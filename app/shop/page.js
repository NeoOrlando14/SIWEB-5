'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [successPopup, setSuccessPopup] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [quantities, setQuantities] = useState({}); // Track quantity for each product
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        // Initialize quantities to 1 for all products
        const initialQty = {};
        data.forEach(p => initialQty[p.id] = 1);
        setQuantities(initialQty);
      })
      .catch(err => console.error("Gagal memuat produk:", err));

    // Load cart count
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

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

  const handleAddToCart = (product) => {
    const email = window.localStorage.getItem("email");
    const userIdStr = window.localStorage.getItem("userId");

    if (!email) {
      alert("Anda harus login dulu!");
      router.push("/login");
      return;
    }

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

    const namaPembeli = email.split("@")[0];

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Add item to cart (add multiple times based on quantity)
    for (let i = 0; i < quantity; i++) {
      cart.push({
        id: Date.now() + i + Math.random(), // Unique ID for cart item
        produkId: product.id,
        nama_produk: product.nama,
        harga: product.harga,
        image: product.image,
        nama_pembeli: namaPembeli,
        addedAt: new Date().toISOString(),
        userId: userIdStr ? Number(userIdStr) : null,
      });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Show success popup
    setAddedProduct({ ...product, quantity });
    setSuccessPopup(true);

    // Reset quantity to 1
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));

    // Update cart count
    updateCartCount();
  };

  const filteredProducts = products.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a]">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-[#ffcf80] text-center">
        Menu Sebelah Kopi
      </h1>

      {/* Search + Cart + Back */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full bg-[#1f1f1f] border border-gray-600 text-white"
        />

        <button
          onClick={() => router.push('/transaksi-saya')}
          className="relative px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow"
        >
          🛒 Keranjang
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/home')}
          className="px-5 py-2 bg-[#ffcf80] hover:bg-yellow-300 text-black font-semibold rounded-full shadow"
        >
          ⬅ Kembali
        </button>
      </div>

      {/* Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const isOutOfStock = !product.stok || product.stok === 0;

          return (
            <div
              key={product.id}
              className={`bg-[#1f1f1f] border rounded-xl shadow p-3 relative transition-all ${
                isOutOfStock
                  ? 'border-red-600 opacity-70'
                  : 'border-gray-700 hover:border-blue-500'
              }`}
            >
              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="text-5xl mb-2">❌</div>
                    <p className="text-red-400 font-bold text-xl">STOK HABIS</p>
                    <p className="text-gray-300 text-sm mt-1">Mohon maaf, produk<br/>sementara tidak tersedia</p>
                  </div>
                </div>
              )}

              <img
                src={product.image}
                className={`h-40 w-full object-cover rounded-lg ${isOutOfStock ? 'grayscale' : ''}`}
                alt={product.nama}
              />

              <h3 className="text-lg font-bold mt-2 text-white">{product.nama}</h3>
              <p className="text-[#ffcf80] text-xl font-extrabold">
                Rp {product.harga.toLocaleString()}
              </p>

              {/* Stock Indicator */}
              <div className="mt-1 mb-2">
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
              </div>

              {/* Quantity Selector */}
              <div className={`flex items-center justify-center gap-3 mt-3 mb-2 ${isOutOfStock ? 'opacity-50' : ''}`}>
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
                <span className="text-white font-bold text-lg w-8 text-center">
                  {quantities[product.id] || 1}
                </span>
                <button
                  onClick={() => !isOutOfStock && handleQuantityChange(product.id, 1)}
                  disabled={isOutOfStock}
                  className={`w-8 h-8 rounded-full font-bold ${
                    isOutOfStock
                      ? 'bg-gray-800 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
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
            </div>
          );
        })}
      </div>

      {/* ================= SUCCESS POPUP ================= */}
      {successPopup && addedProduct && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#1f1f1f] p-6 rounded-xl border border-green-500 shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                Berhasil Ditambahkan!
              </h2>

              <div className="bg-[#2a2a2a] p-4 rounded-lg mb-4">
                <img
                  src={addedProduct.image}
                  className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                  alt={addedProduct.nama}
                />
                <p className="text-white font-semibold">{addedProduct.nama}</p>
                <p className="text-[#ffcf80] text-lg">
                  Rp {addedProduct.harga.toLocaleString()} × {addedProduct.quantity}
                </p>
                <p className="text-green-400 text-xl font-bold mt-1">
                  Total: Rp {(addedProduct.harga * addedProduct.quantity).toLocaleString()}
                </p>
              </div>

              <p className="text-gray-300 mb-4">
                {addedProduct.quantity} item telah ditambahkan ke keranjang Anda.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSuccessPopup(false);
                    updateCartCount();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Lanjut Belanja
                </button>

                <button
                  onClick={() => router.push('/transaksi-saya')}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold"
                >
                  Lihat Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
