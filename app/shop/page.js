'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error("Gagal memuat produk:", err));
  }, []);

  const handleBuy = async (product) => {
    const email = window.localStorage.getItem("email");

    if (!email) {
      alert("Anda harus login dulu!");
      router.push("/login");
      return;
    }

    const namaPembeli = email.split("@")[0];

    const payload = {
      nama_pembeli: namaPembeli,
      produkId: product.id,
      total_harga: product.harga,
      status: "pending",
      tanggal: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin-transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Gagal Buy: " + err.error);
        return;
      }

      alert("Transaksi dibuat! Silakan cek Transaksi Saya");
      router.push("/transaksi-saya");

    } catch (err) {
      alert("Error: " + err.message);
    }
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

      {/* Search + Back */}
      <div className="flex justify-between mb-6">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-full bg-[#1f1f1f] border border-gray-600 w-2/3 text-white"
        />

        <button
          onClick={() => router.push('/home')}
          className="px-5 py-2 bg-[#ffcf80] hover:bg-yellow-300 text-black font-semibold rounded-full shadow"
        >
          ⬅ Kembali
        </button>
      </div>

      {/* Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-[#1f1f1f] border border-gray-700 rounded-xl shadow p-3">
            <img src={product.image} className="h-40 w-full object-cover rounded-lg" />

            <h3 className="text-lg font-bold mt-2 text-white">{product.nama}</h3>
            <p className="text-[#ffcf80] text-xl font-extrabold">
              Rp {product.harga.toLocaleString()}
            </p>

            <button
              onClick={() => handleBuy(product)}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
