'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Komponen sementara pengganti HeaderMenu jika belum ada
const HeaderMenu = () => (
  <div className="bg-pink-500 text-white text-center py-3 text-lg font-semibold">
    Toko Kue Pak Rangga 🍰
  </div>
);

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const router = useRouter();

  // Ambil data produk dari API
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

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((p) => p.id === parseInt(id));
    return total + (product?.harga || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-rose-300 to-yellow-100">
      <HeaderMenu />

      <div className="container mx-auto px-4 py-6">
        {/* Search & Back Button */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-2/3 px-4 py-2 rounded-full border-2 border-pink-400 focus:outline-none"
          />
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full"
          >
            ⬅ Kembali ke Home
          </button>
        </div>

        {/* Produk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white bg-opacity-30 rounded-xl p-4 shadow-lg text-center"
            >
              <Image
                src={product.image.startsWith('/') ? product.image : '/' + product.image}
                alt={product.nama}
                width={100}
                height={100}
                className="mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-700 mt-2">{product.nama}</p>
              <p className="text-pink-600 font-bold mt-1">
                Rp.{product.harga.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Jumlah: {cart[product.id] || 0}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => handleRemove(product)}
                  className="bg-red-300 hover:bg-red-400 text-white px-3 py-1 rounded-full text-sm"
                >
                  Hapus
                </button>
                <button
                  onClick={() => handleAdd(product)}
                  className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                >
                  Tambah
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Harga */}
        <div className="mt-6 text-right font-bold text-xl text-[#6B3E26]">
          Total Harga: Rp.{totalPrice.toLocaleString()}
        </div>
      </div>

      <footer className="text-center text-xs text-gray-600 mt-10 py-4">
        © 2025 Toko Kue Pak Rangga. All Rights Reserved.
      </footer>
    </div>
  );
}
