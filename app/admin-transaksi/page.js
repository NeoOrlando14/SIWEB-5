'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminTransaksiPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [transaksi, setTransaksi] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ nama_pembeli: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [trashedTransaksi, setTrashedTransaksi] = useState([]);
  const itemsPerPage = 5;

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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, nama_pembeli: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const restored = trashedTransaksi.find(t => t.nama_pembeli.toLowerCase() === formData.nama_pembeli.toLowerCase());
    if (!restored) return alert('Tidak ditemukan transaksi sebelumnya untuk nama ini.');

    const res = await fetch('/api/admin-transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_pembeli: restored.nama_pembeli,
        produkId: restored.produkId,
        total_harga: restored.total_harga,
        tanggal: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      alert('Transaksi berhasil dikembalikan.');
      setFormData({ nama_pembeli: '' });
      fetchData();
    } else {
      alert('Gagal mengembalikan transaksi.');
    }
  };

  const handleDelete = async (id) => {
    const tx = transaksi.find((t) => t.id === id);
    if (tx && !trashedTransaksi.some(t => t.id === id)) {
      setTrashedTransaksi([...trashedTransaksi, tx]);
    }
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    await fetch(`/api/admin-transaksi/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (tx) => {
    setFormData({ nama_pembeli: tx.nama_pembeli });
    setEditingId(tx.id);
  };

  const filtered = transaksi.filter((tx) =>
    tx.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
    tx.produk?.nama?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  return (
    <div className="min-h-screen flex text-white">
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Orders" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-qcontact')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="Gifts" onClick={() => router.push('/admin-transaksi')} className={iconClasses('/admin-transaksi')}>🧾</button>
        <button title="Customers" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      <div className="flex-1 bg-gradient-to-br from-rose-100 via-pink-200 to-rose-300 p-10 overflow-x-auto text-black">
        <h1 className="text-4xl font-bold mb-8 text-pink-700 text-center">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi / Restore'}</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl mb-10 shadow-xl max-w-lg mx-auto">
          <input
            type="text"
            name="nama_pembeli"
            placeholder="Nama Pembeli yang ingin dikembalikan"
            value={formData.nama_pembeli}
            onChange={handleChange}
            className="p-3 w-full rounded-md border border-pink-400"
            required
          />
          <div className="text-center mt-4 space-x-2">
            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full shadow-lg">
              Kembalikan Transaksi
            </button>
          </div>
        </form>

        <input
          type="text"
          placeholder="Cari nama pembeli atau produk..."
          className="p-3 w-full mb-6 rounded-full border border-pink-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-pink-600 text-white">
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Nama Pembeli</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Produk</th>
                <th className="px-6 py-3 text-left">Total Harga</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((tx, index) => (
                <tr key={tx.id} className="odd:bg-pink-100 even:bg-rose-100 border-b border-pink-300">
                  <td className="px-6 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-3">{tx.nama_pembeli}</td>
                  <td className="px-6 py-3">{new Date(tx.tanggal).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-3">{tx.produk?.nama || `Produk #${tx.produkId}`}</td>
                  <td className="px-6 py-3">Rp {parseInt(tx.total_harga).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-3 space-x-3">
                    <button onClick={() => handleEdit(tx)} className="text-yellow-600 hover:text-yellow-800">✏️</button>
                    <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow ${
                currentPage === i + 1 ? 'bg-pink-600 text-white' : 'bg-white text-pink-600'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-pink-700">
          © Rangga Store 2025 – Developed with 💕 by KSI ULAY
        </footer>
      </div>
    </div>
  );
}