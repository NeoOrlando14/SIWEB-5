"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  User,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    pelanggan: 1000,
    pendapatan: 5000000,
    produkTerjual: 20,
  });

  const [pesanan, setPesanan] = useState([
    { id: "001", nama: "Lontar", tanggal: "12-10-2025", harga: 15000, status: "Selesai" },
  ]);

  const [chartData, setChartData] = useState([
    { bulan: "Jan", hijau: 400, merah: 300 },
    { bulan: "Feb", hijau: 500, merah: 350 },
    { bulan: "Mar", hijau: 600, merah: 400 },
    { bulan: "Apr", hijau: 550, merah: 420 },
  ]);

  const [userName, setUserName] = useState("Owner");

  // ============ PROTECT PAGE (AMANKAN SSR) ============
  useEffect(() => {
    if (typeof window === "undefined") return;

    const email = window.localStorage.getItem("email") || "Owner";
    const role = window.localStorage.getItem("role");

    if (!role || role !== "owner") {
      alert("Halaman ini khusus Owner!");
      router.push("/login");
      return;
    }

    const name = email.split("@")[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
  }, [router]);

  // ================= LOGOUT AMAN ==================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("email");
      window.localStorage.removeItem("role");
      window.localStorage.removeItem("isLoggedIn");
      window.localStorage.removeItem("isAdmin");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] text-white">
      
      {/* ========== Sidebar ========== */}
      <aside className="w-20 bg-[#1f1f1f] flex flex-col justify-between items-center py-6 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-2xl font-bold text-[#00bcd4]">POS</h1>

          <Link href="#" className="hover:bg-gray-700 p-2 rounded-lg" title="Home">
            <Home size={22} />
          </Link>
          <Link href="#" className="hover:bg-gray-700 p-2 rounded-lg" title="Barang">
            <Package size={22} />
          </Link>
          <Link href="#" className="hover:bg-gray-700 p-2 rounded-lg" title="Transaksi">
            <ShoppingCart size={22} />
          </Link>
          <Link href="#" className="hover:bg-gray-700 p-2 rounded-lg" title="Laporan">
            <FileText size={22} />
          </Link>
        </div>

        {/* Logout */}
        <div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition-all duration-300"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">HOME OWNER</h1>
          <div className="flex items-center space-x-3 bg-[#1f1f1f] px-4 py-2 rounded-lg border border-gray-700">
            <User size={18} className="text-gray-300" />
            <span className="font-semibold">{userName}</span>
          </div>
        </div>

        {/* Dashboard Container */}
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-bold mb-6 text-white">Business Dashboard</h2>

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Pelanggan</p>
              <p className="text-2xl font-bold text-white">
                {stats.pelanggan.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Pendapatan</p>
              <p className="text-2xl font-bold text-green-400">
                Rp {stats.pendapatan.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Produk Terjual</p>
              <p className="text-2xl font-bold text-[#00bcd4]">
                {stats.produkTerjual}
              </p>
            </div>
          </div>

          {/* Grafik Penjualan */}
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-white font-semibold mb-3">Grafik Penjualan</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="bulan" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#555', color: '#fff' }} />
                  <Bar dataKey="hijau" fill="#4ade80" />
                  <Bar dataKey="merah" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabel Pesanan */}
          <div className="bg-[#1f1f1f] rounded-lg border border-gray-700 p-4">
            <h3 className="text-white font-semibold mb-3">Pesanan Sekarang</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-t border-gray-600">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Harga</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pesanan.map((p) => (
                    <tr key={p.id} className="border-b border-gray-700 hover:bg-[#2d2d2d]">
                      <td className="py-2 px-3">{p.id}</td>
                      <td className="py-2 px-3">{p.nama}</td>
                      <td className="py-2 px-3">{p.tanggal}</td>
                      <td className="py-2 px-3">Rp {p.harga.toLocaleString()}</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          © Owner Dashboard — Developed by SPLSK Team
        </footer>
      </main>
    </div>
  );
}
