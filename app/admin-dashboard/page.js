'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
} from 'recharts';


export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi fetch data metrics dari API
  useEffect(() => {
    const fetchMetrics = async () => {
      if (typeof window !== 'undefined') {
        // Cek autentikasi admin, contoh dari localStorage
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
          router.push('/login');
          return;
        }

        try {
          const res = await fetch('/api/admin-metric');
          if (!res.ok) throw new Error('Gagal mengambil data');
          const data = await res.json();
          setMetrics(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMetrics();
  }, [router]);

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>

        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>
          📊
        </button>
        <button title="Orders" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>
          📦
        </button>
        <button title="Users" onClick={() => router.push('/admin-users')} className={iconClasses('/admin-users')}>
          👤
        </button>
        <button title="Gifts" onClick={() => router.push('/admin-gifts')} className={iconClasses('/admin-gifts')}>
          🎁
        </button>
        <button title="Customers" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>
          👥
        </button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>
          ⚙️
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-black">Dashboard</h1>
          <Link
            href="/login"
            onClick={() => localStorage.removeItem('isAdmin')}
            className="bg-white text-pink-600 px-4 py-2 rounded hover:bg-pink-100 font-bold text-sm"
          >
            Logout
          </Link>
        </div>

        {loading && <p>Loading data...</p>}
        {error && <p className="text-red-700 font-bold">Error: {error}</p>}

        {metrics && (
          <>
            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-pink-300 text-black p-4 rounded-xl">
                <p>Total Produk</p>
                <h2 className="text-2xl font-bold">{metrics.totalProduk.toLocaleString()}</h2>
                <p className="text-green-600 text-sm">⬆️ Up from yesterday</p>
              </div>
              <div className="bg-yellow-300 text-black p-4 rounded-xl">
                <p>Total Order</p>
                <h2 className="text-2xl font-bold">{metrics.totalOrder.toLocaleString()}</h2>
                <p className="text-green-600 text-sm">⬆️ Up from past week</p>
              </div>
              <div className="bg-pink-200 text-black p-4 rounded-xl">
                <p>Total Sales</p>
                <h2 className="text-2xl font-bold">Rp {metrics.totalSales.toLocaleString()}</h2>
                <p className="text-red-600 text-sm">⬇️ Down from yesterday</p>
              </div>
              <div className="bg-red-300 text-black p-4 rounded-xl">
                <p>Produk Terlaris</p>
                <h2 className="text-2xl font-bold">{metrics.produkTerlaris}</h2>
                <p className="text-green-600 text-sm">⭐</p>
              </div>
            </div>

            {/* Grafik Penjualan */}
<div className="bg-pink-300 rounded-xl p-4">
  <h2 className="text-xl font-bold mb-4 text-black">Grafik Penjualan</h2>

  {/* Grafik Garis */}
  <div className="bg-white rounded-md h-64 p-2 mb-6">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={metrics.grafikData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#fce7f3" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="tanggal" stroke="#000" />
        <YAxis stroke="#000" />
        <Tooltip contentStyle={{ backgroundColor: '#fce7f3', borderColor: '#ec4899' }} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#ec4899"
          strokeWidth={3}
          dot={{ r: 4, stroke: '#ec4899', strokeWidth: 2, fill: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Grafik Batang */}
  <div className="bg-white rounded-md h-64 p-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={metrics.grafikData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="tanggal" stroke="#000" />
        <YAxis stroke="#000" />
        <Tooltip contentStyle={{ backgroundColor: '#fce7f3', borderColor: '#f59e0b' }} />
        <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-black">
          © Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
