"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPelanggan() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        telepon,
      }),
    });

    if (res.ok) {
      alert("Pelanggan berhasil ditambahkan!");
      router.push("/admin-pelanggan");
    } else {
      alert("Gagal menambahkan pelanggan");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3a3a3a] p-10 text-white">

      <button
        onClick={() => router.push("/admin-pelanggan")}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ⬅ Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6">Tambah Pelanggan</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow-xl max-w-xl"
      >
        {/* NAMA */}
        <div>
          <label className="block mb-2 text-gray-300">Nama Pelanggan</label>
          <input
            type="text"
            className="w-full p-3 rounded bg-[#2a2a2a] border border-gray-600 outline-none"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        {/* TELEPON */}
        <div>
          <label className="block mb-2 text-gray-300">Nomor Telepon</label>
          <input
            type="text"
            className="w-full p-3 rounded bg-[#2a2a2a] border border-gray-600 outline-none"
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            required
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-semibold shadow-md"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
