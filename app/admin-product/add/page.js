"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        harga: Number(harga),
        stok: Number(stok),
      }),
    });

    if (!res.ok) {
      alert("Gagal menambahkan produk");
      return;
    }

    router.push("/admin-product");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center
      bg-gradient-to-br from-[#0d0d0d] via-[#171717] to-[#2b2b2b] text-white px-6">

      <div className="w-full max-w-xl bg-gradient-to-br from-[#141414] to-[#222222]
        border border-gray-700 rounded-xl shadow-xl shadow-black/40 p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">Tambah Produk</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nama Produk */}
          <div>
            <label className="block mb-1 text-gray-300">Nama Produk</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white 
                border border-gray-700 focus:border-gray-500 
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block mb-1 text-gray-300">Harga</label>
            <input
              required
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white 
                border border-gray-700 focus:border-gray-500 
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="block mb-1 text-gray-300">Stok</label>
            <input
              required
              type="number"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white 
                border border-gray-700 focus:border-gray-500 
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Tombol */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin-product")}
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#3b3b3b] to-[#101010]
                hover:from-[#505050] hover:to-[#1a1a1a] transition border border-gray-700 shadow-md"
            >
              Kembali
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-green-600 to-green-700
                hover:from-green-700 hover:to-green-800 transition shadow-md font-bold"
            >
              Simpan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
