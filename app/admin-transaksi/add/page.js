"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTransaksi() {
  const router = useRouter();

  const [produk, setProduk] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");

  // Load data produk
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProduk);
  }, []);

  // Konfirmasi kembali
  const handleBack = () => {
    if (confirm("Yakin ingin kembali?")) {
      router.back();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin-transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produkId,
        nama_pembeli: nama,
        total_harga: Number(harga),
        status: "pending"
      }),
    });

    if (res.ok) {
      alert("Transaksi berhasil ditambahkan!");
      router.back();
    } else {
      alert("Gagal menambahkan transaksi");
    }
  }

  return (
    <div className="min-h-screen p-10 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]">

      {/* Tombol Kembali */}
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ← Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6">Tambah Transaksi</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 max-w-xl"
      >
        {/* PRODUK */}
        <div>
          <label className="block mb-1">Produk</label>
          <select
            className="w-full p-2 rounded bg-[#2a2a2a]"
            value={produkId}
            onChange={(e) => setProdukId(e.target.value)}
            required
          >
            <option value="">-- Pilih Produk --</option>
            {produk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        {/* NAMA */}
        <div>
          <label className="block mb-1">Nama Pembeli</label>
          <input
            className="w-full p-2 rounded bg-[#2a2a2a]"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        {/* HARGA */}
        <div>
          <label className="block mb-1">Total Harga</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-[#2a2a2a]"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            required
          />
        </div>

        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
          Simpan
        </button>
      </form>
    </div>
  );
}
