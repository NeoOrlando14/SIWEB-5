"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, RotateCcw, X, Search } from "lucide-react";

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


  // ================= BULK UPDATE STATUS =================
  async function updateBulkStatus(bulkPaymentId, status, event) {
    event.stopPropagation(); // Prevent accordion toggle when clicking button
    if (!confirm(`Ubah status semua transaksi dalam bulk order ini menjadi "${status}"?`)) return;

    try {
      const res = await fetch("/api/admin-transaksi/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk_payment_id: bulkPaymentId,
          status
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert(`✅ Berhasil mengupdate ${result.updated} transaksi!`);
        fetchData();
      } else {
        alert(result.error || "Gagal mengupdate transaksi");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengupdate transaksi");
    }
  }

  // ================= GROUP TRANSACTIONS BY BUYER & DATE =================
  const groupTransactionsByBuyer = (transactions) => {
    const groups = {};

    transactions.forEach(trx => {
      // Create unique key based on bulk_payment_id or single transaction
      const key = trx.bulk_payment_id || `single_${trx.id}`;

      if (!groups[key]) {
        groups[key] = {
          key: key,
          nama_pembeli: trx.nama_pembeli,
          tanggal: trx.tanggal,
          status: trx.status,
          bulk_payment_id: trx.bulk_payment_id,
          firstTransactionId: trx.id, // For navigation to edit page
          itemCount: 0,
          total_harga: 0
        };
      }

      groups[key].itemCount += 1;
      groups[key].total_harga += trx.total_harga;
    });

    return Object.values(groups);
  };

  // ================= FILTER =================
  const filtered = transaksi.filter((t) =>
    t.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
    String(t.id).includes(search)
  );

  const groupedTransactions = groupTransactionsByBuyer(filtered);

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

          {/* CONTENT */}
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : groupedTransactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Tidak ada transaksi</div>
          ) : (
            <div className="space-y-3">
              {groupedTransactions.map((group) => (
                <div
                  key={group.key}
                  onClick={() => router.push(`/admin-transaksi/edit/${group.firstTransactionId}`)}
                  className="border border-gray-700 rounded-lg p-4 bg-[#2a2a2a] hover:bg-[#2d2d2d] cursor-pointer transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{group.nama_pembeli}</h3>
                        {group.bulk_payment_id && (
                          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-700">
                            📦 Bulk ({group.itemCount} items)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>📅 {formatTanggal(group.tanggal)}</span>
                        <span>💰 {formatRupiah(group.total_harga)}</span>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="flex items-center gap-3">
                      {group.status === "diterima" && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-lg">
                          <Check className="text-green-400" size={16} />
                          <span className="text-green-400 text-sm">Diterima</span>
                        </span>
                      )}
                      {group.status === "pending" && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                          <RotateCcw className="text-yellow-400" size={16} />
                          <span className="text-yellow-400 text-sm">Pending</span>
                        </span>
                      )}
                      {group.status === "ditolak" && (
                        <span className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-700 rounded-lg">
                          <X className="text-red-400" size={16} />
                          <span className="text-red-400 text-sm">Ditolak</span>
                        </span>
                      )}

                      {/* ACTION BUTTONS */}
                      {group.status !== "diterima" && group.bulk_payment_id && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => updateBulkStatus(group.bulk_payment_id, "diterima", e)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
                            title="Terima Semua"
                          >
                            ✅
                          </button>
                          <button
                            onClick={(e) => updateBulkStatus(group.bulk_payment_id, "ditolak", e)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                            title="Tolak Semua"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
