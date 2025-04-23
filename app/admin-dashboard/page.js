'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    }
  }, [router]);

  // Fungsi untuk styling icon sidebar
  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>

        <button
          title="Dashboard"
          onClick={() => router.push('/admin-dashboard')}
          className={iconClasses('/admin-dashboard')}
        >
          📊
        </button>

        <button
          title="Orders"
          onClick={() => router.push('/admin-product')}
          className={iconClasses('/admin-product')}
        >
          📦
        </button>

        <button
          title="Users"
          onClick={() => router.push('/admin-qcontact')}
          className={iconClasses('/admin-users')}
        >
          👤
        </button>

        <button
          title="Gifts"
          onClick={() => router.push('/admin-stock')}
          className={iconClasses('/admin-gifts')}
        >
          🎁
        </button>

        <button
          title="Customers"
          onClick={() => router.push('/admin-member')}
          className={iconClasses('/admin-member')}
        >
          👥
        </button>

        <button
          title="Settings"
          onClick={() => router.push('/admin-settings')}
          className={iconClasses('/admin-settings')}
        >
          ⚙️
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-black">Dashboard</h1>
          <Link
            href="/login"
            className="bg-white text-pink-600 px-4 py-2 rounded hover:bg-pink-100 font-bold text-sm"
          >
            Kembali ke Login
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Cards Data */}
          <div className="bg-pink-300 text-black p-4 rounded-xl">
            <p>Total User</p>
            <h2 className="text-2xl font-bold">40,689</h2>
            <p className="text-green-600 text-sm">⬆️ 8.5% Up from yesterday</p>
          </div>
          <div className="bg-yellow-300 text-black p-4 rounded-xl">
            <p>Total Order</p>
            <h2 className="text-2xl font-bold">10,293</h2>
            <p className="text-green-600 text-sm">⬆️ 1.3% Up from past week</p>
          </div>
          <div className="bg-pink-200 text-black p-4 rounded-xl">
            <p>Total Sales</p>
            <h2 className="text-2xl font-bold">Rp89,000</h2>
            <p className="text-red-600 text-sm">⬇️ Down from yesterday</p>
          </div>
          <div className="bg-red-300 text-black p-4 rounded-xl">
            <p>Total Pending</p>
            <h2 className="text-2xl font-bold">2040</h2>
            <p className="text-green-600 text-sm">⬆️ 1.8% Up from yesterday</p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-pink-300 rounded-xl p-4">
          <h2 className="text-xl font-bold mb-2">Sales Details</h2>
          <div className="bg-pink-200 rounded-md h-48 flex items-center justify-center text-black">
            <span>Grafik Penjualan (placeholder)</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
