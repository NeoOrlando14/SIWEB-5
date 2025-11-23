"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminPoin() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  async function loadData() {
    try {
      const res = await fetch("/api/poin");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error load:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter((p) =>
    p.customer.nama.toLowerCase().includes(search.toLowerCase())
  );

  // ==== ADD ====
  async function handleAdd() {
    const customerId = prompt("Masukkan ID Pelanggan:");
    if (!customerId) return;

    const jumlah = Number(prompt("Jumlah poin:") || 0);

    await fetch("/api/poin", {
      method: "POST",
      body: JSON.stringify({ customerId: Number(customerId), jumlah }),
    });

    loadData();
  }

  // ==== UPDATE JUMLAH ====
  async function updateJumlah(id, newJumlah) {
    await fetch(`/api/poin/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ jumlah: newJumlah }),
    });
    loadData();
  }

  // ==== DELETE ====
  async function handleDelete(id) {
    if (!confirm("Hapus poin ini?")) return;

    await fetch(`/api/poin/${id}`, { method: "DELETE" });
    loadData();
  }

  // ==== LOGOUT (AMANKAN localStorage) ====
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex text-white">

      {/* Sidebar */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span className="text-2xl text-gray-300">☰</span>

          <button onClick={() => router.push("/admin-dashboard")} className={iconClasses("/admin-dashboard")}>📊</button>
          <button onClick={() => router.push("/admin-product")} className={iconClasses("/admin-product")}>📦</button>
          <button onClick={() => router.push("/admin-pelanggan")} className={iconClasses("/admin-pelanggan")}>👥</button>
          <button onClick={() => router.push("/admin-transaksi")} className={iconClasses("/admin-transaksi")}>🧾</button>
          <button onClick={() => router.push("/admin-poin")} className={iconClasses("/admin-poin")}>🎁</button>
        </div>

        <div className="mb-2">
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] p-8">
        <h1 className="text-3xl font-bold mb-6">Poin & Reward</h1>

        {/* Search + Add */}
        <div className="flex justify-between items-center mb-5">
          <input
            placeholder="Search pelanggan..."
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-500 rounded text-black font-bold"
          >
            ➕ Tukar
          </button>
        </div>

        {/* Tabel */}
        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-gray-300">
                <th className="py-3">ID Poin</th>
                <th>ID Pelanggan</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((poin) => (
                <tr key={poin.id} className="border-b border-gray-700">
                  <td className="py-3">{poin.id}</td>
                  <td>{poin.customerId}</td>

                  <td>
                    <button
                      onClick={() => updateJumlah(poin.id, poin.jumlah - 1)}
                      className="px-2"
                    >
                      −
                    </button>
                    <span className="px-3">{poin.jumlah}</span>
                    <button
                      onClick={() => updateJumlah(poin.id, poin.jumlah + 1)}
                      className="px-2"
                    >
                      +
                    </button>
                  </td>

                  <td>
                    {poin.status === "success" ? "✔" : "⟳"}
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(poin.id)}
                      className="text-red-400 text-xl"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
