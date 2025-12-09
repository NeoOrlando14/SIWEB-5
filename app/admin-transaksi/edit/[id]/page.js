"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditTransaksi() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [produk, setProduk] = useState([]);
  const [data, setData] = useState(null);

  const [produkId, setProdukId] = useState("");
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [status, setStatus] = useState("");

  // Load produk list
  useEffect(() => {
    fetch("/api/products").then((res) => res.json()).then(setProduk);
  }, []);

  // Load transaksi existing
  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin-transaksi/${id}`)
      .then((res) => res.json())
      .then((trx) => {
        setData(trx);
        setProdukId(trx.produkId);
        setNama(trx.nama_pembeli);
        setHarga(trx.total_harga);
        setStatus(trx.status || "pending");
      });
  }, [id]);

  // Konfirmasi kembali
  const handleBack = () => {
    if (confirm("Yakin ingin kembali?")) {
      router.back();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`/api/admin-transaksi/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produkId,
        nama_pembeli: nama,
        total_harga: Number(harga),
        status,
      }),
    });

    if (res.ok) {
      alert("Transaksi berhasil diubah!");
      router.back();
    } else {
      alert("Gagal mengubah transaksi");
    }
  }

  if (!data)
    return <p className="p-10 text-white text-xl">Loading...</p>;

  return (
    <div className="min-h-screen p-10 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]">

      {/* Tombol Kembali */}
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ← Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6">Edit Transaksi</h1>

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

        {/* TOTAL HARGA */}
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

        {/* STATUS */}
        <div>
          <label className="block mb-1">Status</label>
          <select
            className="w-full p-2 rounded bg-[#2a2a2a]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
          Update
        </button>
      </form>
    </div>
  );
}
