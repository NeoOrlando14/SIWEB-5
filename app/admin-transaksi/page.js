"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Pencil, Trash2, Check, RotateCcw, X, Search } from "lucide-react";

export default function AdminTransaksi() {
  const router = useRouter();
  const pathname = usePathname();

  const [transaksi, setTransaksi] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Sidebar Active Indicator
  const iconClasses = (path) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === path
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  // ================= FETCH DATA =================
  async function fetchData() {
    try {
      const res = await fetch("/api/admin-transaksi");
      const data = await res.json();
      setTransaksi(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTransaksi([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Format Rupiah
  const formatRupiah = (angka) => `Rp ${angka.toLocaleString("id-ID")}`;

  // Format Tanggal
  const formatTanggal = (date) => {
    const t = new Date(date);
    return t.toLocaleDateString("id-ID");
  };

  // ================= DELETE =================
  async function deleteTransaksi(id) {
    if (!confirm("Hapus transaksi ini?")) return;

    await fetch(`/api/admin-transaksi/${id}`, {
      method: "DELETE",
    });
    fetchData();
  }

  // ================= FILTER =================
  const filtered = transaksi.filter((t) =>
    String(t.id).includes(search.toLowerCase())
  );

  // ================= LOGOUT (AMAN) =================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* ========== SIDEBAR ========== */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span title="Menu" className="text-2xl text-gray-300">☰</span>

          <button onClick={() => router.push("/admin-dashboard")} className={iconClasses("/admin-dashboard")}>📊</button>
          <button onClick={() => router.push("/admin-product")} className={iconClasses("/admin-product")}>📦</button>
          <button onClick={() => router.push("/admin-transaksi")} className={iconClasses("/admin-transaksi")}>🧾</button>
          <button onClick={() => router.push("/admin-pelanggan")} className={iconClasses("/admin-pelanggan")}>👥</button>
          <button onClick={() => router.push("/admin-poin")} className={iconClasses("/admin-poin")}>🎁</button>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all shadow-md mb-2"
        >
          🚪
        </button>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 p-8 bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a]">
        <h1 className="text-3xl font-bold mb-6">Daftar Transaksi</h1>

        {/* SEARCH BAR */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search transaction..."
              className="bg-transparent outline-none text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="ml-2 text-gray-400" />
          </div>
        </div>

        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">
          {/* BUTTON ADD */}
          <div className="flex justify-end mb-5">
            <button
              onClick={() => router.push("/admin-transaksi/add")}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
              ➕ Tambah Transaksi
            </button>
          </div>

          {/* TABLE */}
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 text-left">ID Transaksi</th>
                <th className="text-left">Tanggal</th>
                <th className="text-left">Harga</th>
                <th className="text-left">Status</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-gray-400">Tidak ada transaksi</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                    <td className="py-3">{String(t.id).padStart(4, "0")}</td>
                    <td>{formatTanggal(t.tanggal)}</td>
                    <td>{formatRupiah(t.total_harga)}</td>

                    {/* STATUS FIX */}
                    <td>
                      {t.status === "diterima" && (
                        <Check className="text-green-400 text-xl" />
                      )}

                      {t.status === "pending" && (
                        <RotateCcw className="text-yellow-400 text-xl" />
                      )}

                      {t.status === "ditolak" && (
                        <X className="text-red-500 text-xl" />
                      )}
                    </td>

                    {/* ACTION */}
                    <td>
                      <div className="flex items-center space-x-4 text-xl">
                        {/* EDIT BUTTON */}
                        <Pencil
                          onClick={() => router.push(`/admin-transaksi/edit/${t.id}`)}
                          className="text-blue-400 hover:text-blue-300 cursor-pointer"
                        />

                        {/* DELETE BUTTON */}
                        <Trash2
                          className="text-red-500 hover:text-red-400 cursor-pointer"
                          onClick={() => deleteTransaksi(t.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
