'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminTransaksiPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [transaksi, setTransaksi] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    nama_pembeli: '',
    tanggal: '',
    produkId: '',
    total_harga: '',
  });

  const fetchData = () => {
    fetch('/api/admin-transaksi')
      .then(res => res.json())
      .then(data => setTransaksi(data))
      .catch(err => console.error('Fetch error:', err));
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin-transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Gagal menambahkan transaksi: ' + err.error);
        return;
      }

      // Reset form dan ambil ulang data
      setFormData({ nama_pembeli: '', tanggal: '', produkId: '', total_harga: '' });
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Terjadi kesalahan saat mengirim data');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/admin-transaksi/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredTransaksi = transaksi.filter((tx) =>
    tx.nama_pembeli.toLowerCase().includes(search.toLowerCase())
  );

  const iconClasses = (path) =>
    `text-xl hover:scale-125 transition-transform ${
      pathname === path ? 'text-yellow-300' : 'text-white'
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
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8 overflow-x-auto text-black">
        <h1 className="text-4xl font-bold mb-6">Dashboard Transaksi</h1>

        {/* Form Tambah Transaksi */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg mb-6 space-y-3 shadow">
          <h2 className="font-semibold text-lg">Tambah Transaksi</h2>
          <input type="text" name="nama_pembeli" placeholder="Nama Pembeli" value={formData.nama_pembeli} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="datetime-local" name="tanggal" value={formData.tanggal} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="number" name="produkId" placeholder="ID Produk" value={formData.produkId} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="number" name="total_harga" placeholder="Total Harga" value={formData.total_harga} onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded">Add Now</button>
        </form>

        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama pembeli..."
          className="p-2 w-full mb-4 rounded border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Table */}
        <table className="min-w-full bg-pink-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-pink-600 text-white">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nama Pembeli</th>
              <th className="px-4 py-2">Tanggal</th>
              <th className="px-4 py-2">Produk</th>
              <th className="px-4 py-2">Total Harga</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransaksi.map((tx, index) => (
              <tr key={tx.id} className="bg-pink-100 border-b border-pink-400">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{tx.nama_pembeli}</td>
                <td className="px-4 py-2">{new Date(tx.tanggal).toLocaleString('id-ID')}</td>
                <td className="px-4 py-2">{tx.produk?.nama || 'Produk tidak ditemukan'}</td>
                <td className="px-4 py-2">{tx.total_harga.toLocaleString('id-ID')}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-red-600 hover:underline mr-2"
                    onClick={() => handleDelete(tx.id)}
                  >
                    Hapus
                  </button>
                </td>
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
