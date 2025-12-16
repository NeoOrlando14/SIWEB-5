"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { LogOut } from "lucide-react";

function Analytics({ metrics }) {
  return (
    <>
      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow text-white">
          <p className="text-gray-400">Total Produk</p>
          <h2 className="text-2xl font-bold">{metrics.totalProduk.toLocaleString()}</h2>
          <p className="text-green-500 text-sm">⬆️ Up from yesterday</p>
        </div>

        <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow text-white">
          <p className="text-gray-400">Total Order</p>
          <h2 className="text-2xl font-bold">{metrics.totalOrder.toLocaleString()}</h2>
          <p className="text-green-500 text-sm">⬆️ Up from past week</p>
        </div>

        <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow text-white">
          <p className="text-gray-400">Total Sales</p>
          <h2 className="text-2xl font-bold">Rp {metrics.totalSales.toLocaleString()}</h2>
          <p className="text-red-500 text-sm">⬇️ Down from yesterday</p>
        </div>

        <div className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow text-white">
          <p className="text-gray-400">Produk Terlaris</p>
          <h2 className="text-2xl font-bold">{metrics.produkTerlaris}</h2>
          <p className="text-yellow-400 text-sm">⭐ Best Seller</p>
        </div>
      </div>

      {/* Grafik */}
      <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 shadow">
        <h2 className="text-xl font-bold mb-4 text-white">Grafik Penjualan</h2>

        <div className="bg-[#1e1e1e] rounded-md h-64 p-2 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="tanggal" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", borderColor: "#555", color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#00bcd4"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#00bcd4", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e1e1e] rounded-md h-64 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="tanggal" stroke="#bbb" />
              <YAxis stroke="#bbb" />
              <Tooltip contentStyle={{ backgroundColor: "#2a2a2a", borderColor: "#555", color: "#fff" }} />
              <Bar dataKey="total" fill="#4ade80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("month"); // default: month
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  const [customYear, setCustomYear] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin-metric?filter=${filter}`;

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
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (typeof window === "undefined") return;

      const isLoggedIn = window.localStorage.getItem("isLoggedIn");
      const role = window.localStorage.getItem("role");

      if (isLoggedIn !== "true") {
        router.push("/login");
        return;
      }

      if (role !== "admin") {
        alert("Halaman ini khusus Admin!");
        router.push("/login");
        return;
      }

      await fetchMetrics();
    };

    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Re-fetch when filter or custom date changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = window.localStorage.getItem("isLoggedIn");
      const role = window.localStorage.getItem("role");

      if (isLoggedIn === "true" && role === "admin") {
        fetchMetrics();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, customDate, customMonth, customYear]);

  const handleLogout = async () => {
    try {
      // Panggil API logout untuk hapus cookie
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout error:", err);
    }

    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? "bg-gray-100 text-black scale-110" : "hover:bg-gray-700 text-white"
    }`;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span title="Menu" className="text-2xl text-gray-300">☰</span>
          <button onClick={() => router.push("/admin-dashboard")} className={iconClasses("/admin-dashboard")}>📊</button>
          <button onClick={() => router.push("/admin-product")} className={iconClasses("/admin-product")}>📦</button>
          <button onClick={() => router.push("/admin-transaksi")} className={iconClasses("/admin-transaksi")}>🧾</button>
          <button onClick={() => router.push("/admin-pelanggan")} className={iconClasses("/admin-pelanggan")}>👥</button>
          <button onClick={() => router.push("/admin-poin")} className={iconClasses("/admin-poin")}>🎁</button>
        </div>

        <div className="mb-2">
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Konten */}
      <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

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

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 h-24 rounded-xl"></div>
              ))}
            </div>
            <div className="bg-gray-800 h-64 rounded-xl"></div>
            <div className="bg-gray-800 h-64 rounded-xl"></div>
          </div>
        )}

        {error && <p className="text-red-500 font-bold">Error: {error}</p>}

        {!loading && metrics && (
          <Suspense fallback={<div className="text-gray-300">Memuat analitik...</div>}>
            <Analytics metrics={metrics} />
          </Suspense>
        )}

        <footer className="mt-6 text-center text-sm text-gray-400">
          © Admin Dashboard — Developed by SPLSK Team
        </footer>
      </div>
    </div>
  );
}
