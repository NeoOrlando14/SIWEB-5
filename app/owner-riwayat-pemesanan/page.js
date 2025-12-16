"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Filter } from "lucide-react";

export default function OwnerRiwayatPemesananPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  // ===================== FETCH RIWAYAT =====================
  async function fetchRiwayat() {
    try {
      const res = await fetch("/api/riwayat-pemesanan");
      const data = await res.json();
      setRiwayat(data);
    } catch (e) {
      console.error("Error fetch riwayat:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // ===================== FILTER & SEARCH =====================
  const filtered = riwayat.filter((r) => {
    const matchSearch =
      r.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
      r.nama_produk.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" || r.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // ===================== LOGOUT =====================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* ---------------- SIDEBAR ---------------- */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span title="Menu" className="text-2xl text-gray-300">
            ☰
          </span>

          <button
            title="Dashboard"
            onClick={() => router.push("/owner-dashboard")}
            className={iconClasses("/owner-dashboard")}
          >
            📊
          </button>

          <button
            title="Owner Laporan"
            onClick={() => router.push("/owner-laporan")}
            className={iconClasses("/owner-laporan")}
          >
            📊
          </button>

          <button
            title="Riwayat Pemesanan"
            onClick={() => router.push("/owner-riwayat-pemesanan")}
            className={iconClasses("/owner-riwayat-pemesanan")}
          >
            📋
          </button>

          <button
            title="Poin"
            onClick={() => router.push("/owner-poin")}
            className={iconClasses("/owner-poin")}
          >
            🎁
          </button>
        </div>

        <div className="mb-2">
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            🚪
          </button>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] p-8">
        <h1 className="text-3xl font-bold mb-6">Riwayat Pemesanan</h1>
        <p className="text-gray-400 mb-6">
          Data history pemesanan yang tersimpan permanent, bahkan jika produk sudah dihapus
        </p>

        {/* SEARCH & FILTER BAR */}
        <div className="flex justify-between mb-6 gap-4">
          {/* Search */}
          <div className="flex items-center bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari pembeli atau produk..."
              className="bg-transparent outline-none text-white w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="ml-2 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent outline-none text-white cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-sm">Total Riwayat</div>
            <div className="text-2xl font-bold">{riwayat.length}</div>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-sm">Diterima</div>
            <div className="text-2xl font-bold text-green-500">
              {riwayat.filter((r) => r.status === "diterima").length}
            </div>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-sm">Pending</div>
            <div className="text-2xl font-bold text-yellow-500">
              {riwayat.filter((r) => r.status === "pending").length}
            </div>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-sm">Ditolak</div>
            <div className="text-2xl font-bold text-red-500">
              {riwayat.filter((r) => r.status === "ditolak").length}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 text-left">ID</th>
                <th className="text-left">Tanggal</th>
                <th className="text-left">Pembeli</th>
                <th className="text-left">Produk</th>
                <th className="text-left">Harga Produk</th>
                <th className="text-left">Jumlah</th>
                <th className="text-left">Total Harga</th>
                <th className="text-left">Poin Dipakai</th>
                <th className="text-left">Diskon Poin</th>
                <th className="text-left">Harga Akhir</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center text-gray-500 py-6">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center text-gray-500 py-6">
                    Tidak ada riwayat pemesanan
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-700 hover:bg-[#2a2a2a] transition"
                  >
                    <td className="py-3">{r.id}</td>
                    <td>
                      {new Date(r.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{r.nama_pembeli}</td>
                    <td className="font-semibold text-blue-400">{r.nama_produk}</td>
                    <td>Rp {r.harga_produk.toLocaleString("id-ID")}</td>
                    <td className="text-center">{r.jumlah}</td>
                    <td>Rp {r.total_harga.toLocaleString("id-ID")}</td>
                    <td className="text-center">{r.poin_dipakai}</td>
                    <td>Rp {r.diskon_poin.toLocaleString("id-ID")}</td>
                    <td className="font-semibold">
                      Rp {(r.harga_akhir || r.total_harga).toLocaleString("id-ID")}
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          r.status === "diterima"
                            ? "bg-green-600"
                            : r.status === "pending"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-6 bg-[#1f1f1f] p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">
            💡 <strong>Info:</strong> Riwayat pemesanan ini tersimpan secara permanent.
            Data produk (nama & harga) di-snapshot saat transaksi diterima,
            sehingga tetap dapat dilihat meskipun produk sudah dihapus dari database.
          </p>
        </div>
      </div>
    </div>
  );
}
