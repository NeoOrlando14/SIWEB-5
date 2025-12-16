// app/owner-laporan/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, RefreshCcw, Home } from "lucide-react";

export default function OwnerLaporan() {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ================= AUTH OWNER ONLY =================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = window.localStorage.getItem("role");
    const isLoggedIn = window.localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true" || role !== "owner") {
      alert("Halaman ini khusus Owner!");
      router.push("/login");
    }
  }, [router]);

  // ================= LOAD TRANSAKSI =================
  async function loadTransaksi() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin-transaksi");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Aggregate data by product and buyer
        const aggregated = {};
        data.forEach((t) => {
          const key = `${t.produkId}_${t.nama_pembeli}_${t.status}`;
          if (!aggregated[key]) {
            aggregated[key] = {
              ...t,
              jumlah: 1,
            };
          } else {
            aggregated[key].jumlah += 1;
          }
        });
        setTransaksi(Object.values(aggregated));
      } else {
        setTransaksi([]);
      }
    } catch (err) {
      console.error("Load transaksi error:", err);
      setTransaksi([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTransaksi();
  }, []);

  // Filter hanya transaksi dengan status selesai/diterima (tidak termasuk proses/dibatalkan)
  const transaksiSelesai = transaksi.filter(t =>
    ["selesai", "Selesai", "diterima", "Diterima"].includes(t.status)
  );

  const totalTransaksi = transaksi.length;
  const totalTransaksiSelesai = transaksiSelesai.length;
  const totalPendapatan = transaksiSelesai.reduce(
    (sum, t) => sum + (t.total_harga || 0),
    0
  );
  const totalPendapatanAll = transaksi.reduce(
    (sum, t) => sum + (t.total_harga || 0),
    0
  );

  const formatTanggal = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
  };

  // ================= HANDLE UPLOAD =================
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/owner-laporan-upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMsg(
          `✅ Upload berhasil! ${json.inserted} transaksi berhasil dimasukkan ke database.`
        );
        // Refresh data
        loadTransaksi();
      } else if (json.error) {
        setErrorMsg("❌ Error upload: " + json.error);
      } else if (!res.ok) {
        setErrorMsg("❌ Upload gagal dengan status: " + res.status);
      }
    } catch (err) {
      setErrorMsg("❌ ERROR: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold">Laporan Owner – Sebelah Kopi</h1>
          <p className="text-sm text-gray-400">
            Pantau transaksi & import laporan dari file CSV/JSON
          </p>
        </div>

        <button
          onClick={() => router.push("/owner-dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1f1f1f] border border-gray-700 hover:bg-gray-800 transition"
        >
          <Home size={18} />
          <span>Ke Dashboard Owner</span>
        </button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 px-8 pb-10 pt-6 space-y-8">
        {/* STAT KARTU */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-400">Total Transaksi (Semua)</p>
            <p className="text-3xl font-bold mt-1">{totalTransaksi}</p>
            <p className="text-xs text-gray-500 mt-1">Termasuk proses & dibatalkan</p>
          </div>
          <div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-400">Transaksi Selesai</p>
            <p className="text-3xl font-bold mt-1 text-blue-400">{totalTransaksiSelesai}</p>
            <p className="text-xs text-gray-500 mt-1">Status: Selesai/Diterima</p>
          </div>
          <div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-400">Pendapatan (Selesai)</p>
            <p className="text-2xl font-bold mt-1 text-green-400">
              Rp {totalPendapatan.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hanya transaksi selesai</p>
          </div>
          <div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-400">Total Semua Status</p>
            <p className="text-2xl font-bold mt-1 text-yellow-400">
              Rp {totalPendapatanAll.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-500 mt-1">Termasuk semua status</p>
          </div>
        </div>

        {/* TABEL TRANSAKSI */}
        <section className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
            <button
              onClick={loadTransaksi}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-600 hover:bg-gray-800"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400">Memuat data...</p>
          ) : transaksi.length === 0 ? (
            <p className="text-gray-400">Belum ada transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-300">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Tanggal</th>
                    <th className="py-2 pr-3">Nama Pembeli</th>
                    <th className="py-2 pr-3">Nama Produk</th>
                    <th className="py-2 pr-3">Jumlah Terjual</th>
                    <th className="py-2 pr-3">Total Harga</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksi.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-800 hover:bg-[#242424]"
                    >
                      <td className="py-2 pr-3">{t.id}</td>
                      <td className="py-2 pr-3">{formatTanggal(t.tanggal)}</td>
                      <td className="py-2 pr-3">{t.nama_pembeli}</td>
                      <td className="py-2 pr-3">{t.produk?.nama || "N/A"}</td>
                      <td className="py-2 pr-3">{t.jumlah || 1}</td>
                      <td className="py-2 pr-3">
                        Rp {t.total_harga.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 pr-3 capitalize">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* UPLOAD & PREVIEW */}
        <section className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Upload Laporan CSV / JSON</h2>
              <p className="text-xs text-gray-400 mt-1">
                Kolom wajib: <code>nama_produk</code>, <code>nama_pembeli</code>,{" "}
                <code>total_harga</code>, <code>jumlah</code> (opsional:{" "}
                <code>tanggal</code>, <code>status</code>)
              </p>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer text-sm">
              <FileUp size={18} />
              <span>{uploading ? "Mengupload..." : "Pilih File"}</span>
              <input
                type="file"
                accept=".csv,application/json"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-green-400 bg-green-950/30 border border-green-700 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
