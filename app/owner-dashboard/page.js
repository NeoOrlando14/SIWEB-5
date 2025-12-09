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

  // ==================== DATA SEMENTARA ====================
  const [stats, setStats] = useState({
    totalProduk: 13,
    totalOrder: 5,
    totalSales: 11205000,
    produkTerlaris: "Kue Rumah Natal",
  });

  const [chartData, setChartData] = useState([
    { tanggal: "2025-11-18", jumlah: 0 },
    { tanggal: "2025-11-19", jumlah: 0 },
    { tanggal: "2025-11-20", jumlah: 0 },
    { tanggal: "2025-11-21", jumlah: 0 },
    { tanggal: "2025-11-22", jumlah: 0 },
    { tanggal: "2025-11-23", jumlah: 0 },
    { tanggal: "2025-11-24", jumlah: 1 },
  ]);

  const [userName, setUserName] = useState("Owner");

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
  }, [router]);

  // ==================== LOGOUT ====================
  const handleLogout = () => {
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
            🧾
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

        {/* ==================== STAT KOTAK ==================== */}
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

        {/* ==================== GRAFIK ==================== */}
        <div className="bg-[#1f1f1f] border border-gray-700 p-6 rounded-xl mb-8 shadow">
          <h2 className="text-lg font-bold mb-4">Grafik Penjualan</h2>

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
        </div>

        {/* ==================== FOOTER ==================== */}
        <footer className="mt-2 text-center text-sm text-gray-500">
          © Owner Dashboard — Developed by SPLSK Team
        </footer>
      </main>
    </div>
  );
}
