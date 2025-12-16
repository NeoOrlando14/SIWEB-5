"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  User,
  LogOut,
  Users,
  Gift,
} from "lucide-react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  // ==================== STATE ====================
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [userName, setUserName] = useState("Owner");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("month"); // default: month
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  const [customYear, setCustomYear] = useState("");

  // ==================== FETCH METRICS ====================
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/owner-metric?filter=${filter}`;

      // Add custom date parameters if available
      if (filter === "custom_date" && customDate) {
        url += `&date=${customDate}`;
      } else if (filter === "custom_month" && customMonth) {
        url += `&month=${customMonth}`;
      } else if (filter === "custom_year" && customYear) {
        url += `&year=${customYear}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();

      setStats({
        totalProduk: data.totalProduk,
        totalOrder: data.totalOrder,
        totalSales: data.totalSales,
        produkTerlaris: data.produkTerlaris,
      });
      setChartData(data.grafikData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== PROTECT ROLE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const email = window.localStorage.getItem("email") || "owner";
    const role = window.localStorage.getItem("role");

    if (!role || role !== "owner") {
      alert("Halaman ini khusus Owner!");
      router.push("/login");
      return;
    }

    const name = email.split("@")[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));

    // Fetch initial metrics
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ==================== RE-FETCH ON FILTER CHANGE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = window.localStorage.getItem("role");
    if (role === "owner") {
      fetchMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, customDate, customMonth, customYear]);

  // ==================== LOGOUT ====================
  const handleLogout = async () => {
    try {
      // Panggil API logout untuk hapus cookie
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Hapus localStorage
    window.localStorage.clear();
    router.push("/login");
  };

  // ==================== ICON ACTIVE ====================
  const iconClasses = (path) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === path
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3a3a3a] text-white">

      {/* ==================== SIDEBAR ==================== */}
      <aside className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span className="text-2xl text-gray-300">☰</span>

          <button onClick={() => router.push("/owner-dashboard")} className={iconClasses("/owner-dashboard")}>
            🏠
          </button>

          <button onClick={() => router.push("/owner-laporan")} className={iconClasses("/owner-laporan")}>
            📊
          </button>

          <button onClick={() => router.push("/owner-riwayat-pemesanan")} className={iconClasses("/owner-riwayat-pemesanan")}>
            📋
          </button>

          <button onClick={() => router.push("/owner-poin")} className={iconClasses("/owner-poin")}>
            🎁
          </button>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all duration-300 shadow-md mb-2"
        >
          🚪
        </button>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="flex items-center bg-[#1f1f1f] border border-gray-700 px-4 py-2 rounded-lg">
            <User size={20} className="text-gray-300" />
            <span className="ml-2 font-semibold">{userName}</span>
          </div>
        </div>

        {/* ==================== FILTER BUTTONS ==================== */}
        {/* Filter Buttons Row 1 - Quick Filters */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setFilter("day")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "day"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
            }`}
          >
            📅 Hari Ini
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "month"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
            }`}
          >
            📊 Bulan Ini
          </button>
          <button
            onClick={() => setFilter("year")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === "year"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
            }`}
          >
            📈 Tahun Ini
          </button>
        </div>

        {/* Filter Buttons Row 2 - Custom Date Filters */}
        <div className="flex gap-3 mb-6 items-center flex-wrap">
          {/* Filter by Specific Date */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("custom_date")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === "custom_date"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
              }`}
            >
              📆 Tanggal Tertentu
            </button>
            {filter === "custom_date" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-green-500"
              />
            )}
          </div>

          {/* Filter by Specific Month */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("custom_month")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === "custom_month"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
              }`}
            >
              📅 Bulan Tertentu
            </button>
            {filter === "custom_month" && (
              <input
                type="month"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* Filter by Specific Year */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("custom_year")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === "custom_year"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-[#1f1f1f] text-gray-300 border border-gray-700 hover:bg-[#2a2a2a]"
              }`}
            >
              📊 Tahun Tertentu
            </button>
            {filter === "custom_year" && (
              <input
                type="number"
                min="2020"
                max="2099"
                placeholder="YYYY"
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white outline-none focus:border-orange-500 w-24"
              />
            )}
          </div>
        </div>

        {/* ==================== STAT KOTAK ==================== */}
        {loading && (
          <div className="grid grid-cols-4 gap-6 mb-10 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-800 h-24 rounded-xl"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-10 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            Error: {error}
          </div>
        )}

        {!loading && stats && (
          <div className="grid grid-cols-4 gap-6 mb-10">
            {/* TOTAL PRODUK */}
            <div className="bg-[#1f1f1f] border border-gray-700 p-5 rounded-xl shadow">
              <p className="text-gray-400 text-sm">Total Produk</p>
              <p className="text-3xl font-bold mt-2">{stats.totalProduk}</p>
              <p className="text-green-400 text-xs mt-1">⬆ Up from yesterday</p>
            </div>

            {/* TOTAL ORDER */}
            <div className="bg-[#1f1f1f] border border-gray-700 p-5 rounded-xl shadow">
              <p className="text-gray-400 text-sm">Total Order</p>
              <p className="text-3xl font-bold mt-2">{stats.totalOrder}</p>
              <p className="text-green-400 text-xs mt-1">⬆ Up from last week</p>
            </div>

            {/* TOTAL SALES */}
            <div className="bg-[#1f1f1f] border border-gray-700 p-5 rounded-xl shadow">
              <p className="text-gray-400 text-sm">Total Sales</p>
              <p className="text-2xl font-bold mt-2 text-white">
                Rp {stats.totalSales.toLocaleString("id-ID")}
              </p>
              <p className="text-red-400 text-xs mt-1">⬇ Down from yesterday</p>
            </div>

            {/* PRODUK TERLARIS */}
            <div className="bg-[#1f1f1f] border border-gray-700 p-5 rounded-xl shadow">
              <p className="text-gray-400 text-sm">Produk Terlaris</p>
              <p className="text-[19px] font-bold mt-2 text-yellow-400">
                {stats.produkTerlaris}
              </p>
              <p className="text-yellow-300 text-xs mt-1">⭐ Best Seller</p>
            </div>
          </div>
        )}

        {/* ==================== GRAFIK ==================== */}
        <div className="bg-[#1f1f1f] border border-gray-700 p-6 rounded-xl mb-8 shadow">
          <h2 className="text-lg font-bold mb-4">Grafik Penjualan</h2>

          {loading && (
            <div className="w-full h-72 bg-gray-800 rounded animate-pulse"></div>
          )}

          {!loading && chartData.length > 0 && (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="tanggal" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ background: "#222", borderColor: "#555", color: "#fff" }} />
                  <Line type="monotone" dataKey="jumlah" stroke="#4fc3f7" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loading && chartData.length === 0 && (
            <div className="w-full h-72 flex items-center justify-center text-gray-500">
              Tidak ada data untuk periode ini
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <footer className="mt-2 text-center text-sm text-gray-500">
          © Owner Dashboard — Developed by SPLSK Team
        </footer>
      </main>
    </div>
  );
}
