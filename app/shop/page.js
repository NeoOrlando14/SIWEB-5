'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HeaderMenu = () => (
  <div className="bg-pink-500 text-white text-center py-4 text-xl font-bold shadow-md">
    Toko Kue Pak Rangga 🍰
  </div>
);

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Gagal memuat produk:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAdd = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleRemove = (product) => {
    setCart((prev) => {
      if (!prev[product.id]) return prev;
      const updated = { ...prev, [product.id]: prev[product.id] - 1 };
      if (updated[product.id] <= 0) delete updated[product.id];
      return updated;
    });
  };

  const handleBuy = async (product) => {
    const nama = prompt('Masukkan nama pembeli:');
    if (!nama) return;

    const payload = {
      nama_pembeli: nama,
      produkId: product.id,
      total_harga: product.harga,
      tanggal: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/admin-transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Gagal Buy: ' + err.error);
      } else {
        alert('Transaksi berhasil dikirim!');
      }
    } catch (err) {
      alert('Error saat membeli: ' + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((p) => p.id === parseInt(id));
    return total + (product?.harga || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-100 via-rose-200 to-pink-100">
      <HeaderMenu />

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Search & Back Button */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-2/3 px-5 py-3 rounded-full border-2 border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow text-gray-700 placeholder:text-gray-500"
          />
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-full shadow font-semibold"
          >
            ⬅ Kembali ke Home
          </button>
        </div>

        {/* Produk Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white bg-opacity-70 shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition duration-300"
            >
              <img
                src={product.image}
                alt={product.nama}
                className="object-cover w-full h-48"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-pink-800">{product.nama}</h3>
                <p className="text-pink-600 font-bold text-base mt-1">
                  Rp.{product.harga.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Jumlah: {cart[product.id] || 0}
                </p>
                <div className="flex justify-center flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleRemove(product)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => handleAdd(product)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => handleBuy(product)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full text-sm font-bold shadow ${
                currentPage === i + 1
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-pink-600 hover:bg-pink-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Total Harga */}
        <div className="mt-8 text-right font-bold text-xl text-rose-800">
          Total Harga: Rp.{totalPrice.toLocaleString()}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-600 mt-auto py-4">
        © 2025 Toko Kue Pak Rangga. All Rights Reserved.
      </footer>
    </div>
  );
}
