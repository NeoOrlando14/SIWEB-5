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

      try {
        const res = await fetch("/api/admin-metric");
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("isLoggedIn");
      window.localStorage.removeItem("email");
      window.localStorage.removeItem("role");
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
