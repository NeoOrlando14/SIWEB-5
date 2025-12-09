"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OwnerPoin() {
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  // ============= ROLE PROTECTION =============
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "owner") {
      router.push("/login");
    }
  }, [router]);

  // ============= LOAD DATA POIN =============
  async function loadData() {
    try {
      const res = await fetch("/api/poin");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ============= SEARCH FILTER =============
  const filtered = data.filter((p) =>
    p.customer.nama.toLowerCase().includes(search.toLowerCase())
  );

  // ============= ADD POIN =============
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

  // ============= EDIT POIN (+/-) =============
  async function updateJumlah(id, newJumlah) {
    await fetch(`/api/poin/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ jumlah: newJumlah }),
    });
    loadData();
  }

  // ============= DELETE POIN =============
  async function handleDelete(id) {
    if (!confirm("Hapus poin ini?")) return;

    await fetch(`/api/poin/${id}`, { method: "DELETE" });
    loadData();
  }

  // ============= LOGOUT =============
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // ============= SIDEBAR ACTIVE ICON =============
  const iconClasses = (path) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === path
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  return (
    <div className="min-h-screen flex text-white">

      {/* ========== SIDEBAR OWNER ========== */}
      <div className="w-20 bg-[#1f1f1f] flex flex-col justify-between items-center py-6 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-2xl font-bold text-[#00bcd4]">POS</h1>

          <button onClick={() => router.push("/owner-dashboard")} className={iconClasses("/owner-dashboard")}>🏠</button>
          <button onClick={() => router.push("/owner-laporan")} className={iconClasses("/owner-laporan")}>🧾</button>
          <button onClick={() => router.push("/owner-poin")} className={iconClasses("/owner-poin")}>🎁</button>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition-all duration-300 mb-4"
        >
          🚪
        </button>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a] p-8">

        <h1 className="text-3xl font-bold mb-6">Poin & Reward (Owner)</h1>

        {/* SEARCH + ADD */}
        <div className="flex justify-between mb-5">
          <input
            placeholder="Search pelanggan..."
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded"
          >
            ➕ Tambah Poin
          </button>
        </div>

        {/* TABEL */}
        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-gray-300">
                <th className="py-3">ID</th>
                <th>Pelanggan</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((poin) => (
                <tr key={poin.id} className="border-b border-gray-700">
                  <td className="py-3">{poin.id}</td>
                  <td>{poin.customer?.nama}</td>

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
                    {poin.status === "success" ? (
                      <span className="text-green-400">✔</span>
                    ) : (
                      <span className="text-yellow-400">⟳</span>
                    )}
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
