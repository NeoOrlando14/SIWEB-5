'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTransaksiPage() {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    } else {
      fetch('/api/admin-transaksi')
        .then(res => res.json())
        .then(data => setTransaksi(data))
        .catch(err => console.error('Fetch error:', err));
    }
  }, [router]);

  const iconClasses = (path) =>
    `text-xl hover:scale-125 transition-transform ${
      typeof window !== 'undefined' && window.location.pathname === path
        ? 'text-yellow-300'
        : 'text-white'
    }`;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>

        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Produk" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-users')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="Transaksi" onClick={() => router.push('/admin-transaksi')} className={iconClasses('/admin-transaksi')}>🧾</button>
        <button title="Member" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8 overflow-x-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Dashboard Transaksi</h1>

        <table className="min-w-full bg-pink-300 rounded-lg overflow-hidden text-black">
          <thead>
            <tr className="bg-pink-600 text-white">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nama Pembeli</th>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Produk</th>
              <th className="px-4 py-2">Total Harga</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((tx, index) => (
              <tr key={tx.id} className="bg-pink-100 border-b border-pink-400">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{tx.nama_pembeli}</td>
                <td className="px-4 py-2">{new Date(tx.tanggal).toLocaleString('id-ID')}</td>
                <td className="px-4 py-2">{tx.produk?.nama || 'Produk tidak ditemukan'}</td>
                <td className="px-4 py-2">{tx.total_harga.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="mt-10 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
