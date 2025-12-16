"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPoin() {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [jumlah, setJumlah] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch("/api/poin", {
      method: "POST",
      body: JSON.stringify({
        customerId: Number(customerId),
        jumlah: Number(jumlah),
      }),
    });

    router.push("/admin-poin");
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Tambah Poin</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">

        <div>
          <label className="block mb-1">ID Pelanggan</label>
          <input
            type="number"
            className="bg-gray-800 p-2 rounded w-full"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Jumlah Poin</label>
          <input
            type="number"
            className="bg-gray-800 p-2 rounded w-full"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />
        </div>

        <button className="bg-green-600 px-4 py-2 rounded">
          Simpan
        </button>
      </form>
    </div>
  );
}
