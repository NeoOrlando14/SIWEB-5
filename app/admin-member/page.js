'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminMemberPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    address: '',
    gender: 'Male',
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin-member');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error('Gagal mengambil data member:', err);
    }
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (!adminStatus) {
      router.push('/login');
    } else {
      setIsAdmin(true);
      fetchMembers();
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin-member${editingId ? '/' + editingId : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(editingId ? 'Gagal mengedit member' : 'Gagal menambahkan member');
      alert(editingId ? 'Member berhasil diedit' : 'Member berhasil ditambahkan');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', position: '', address: '', gender: 'Male' });
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus member ini?')) return;
    try {
      const res = await fetch(`/api/admin-member/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus member');
      fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({ ...member });
  };

  if (!isAdmin) return null;

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  return (
    <div className="min-h-screen flex text-white font-sans">
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Orders" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-qcontact')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="Gifts" onClick={() => router.push('/admin-transaksi')} className={iconClasses('/admin-transaksi')}>🧾</button>
        <button title="Customers" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      <div className="flex-1 bg-gradient-to-br from-rose-100 via-pink-200 to-amber-100 p-10 overflow-auto">
        <h1 className="text-4xl font-bold text-pink-700 mb-8 text-center drop-shadow">{editingId ? 'Edit Member' : 'Tambah Member Baru'}</h1>

        <div className="bg-white/60 backdrop-blur-md max-w-4xl mx-auto p-8 rounded-3xl shadow-xl text-pink-900">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-md border-4 border-pink-300">
              <span className="text-4xl">📷</span>
            </div>
          </div>
          <h2 className="text-center text-pink-600 font-semibold mb-6 text-sm italic">Upload Foto Member</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="Position" name="position" value={formData.position} onChange={handleChange} />
            <input className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" placeholder="Address" name="address" value={formData.address} onChange={handleChange} />
            <select className="bg-white border border-pink-200 p-3 rounded-xl shadow-inner focus:outline-none" name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-full shadow-md">{editingId ? 'Update Member' : 'Add Now'}</button>
          </form>
        </div>

        {members.length > 0 && (
          <div className="bg-white text-pink-900 max-w-4xl mx-auto mt-10 p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">📋 Daftar Member</h2>
            <ul className="space-y-4">
              {members.map((member) => (
                <li key={member.id} className="p-4 border border-pink-200 rounded-xl bg-white/70 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>👤 Nama:</strong> {member.firstName} {member.lastName}</p>
                      <p><strong>✉️ Email:</strong> {member.email}</p>
                      <p><strong>📞 Phone:</strong> {member.phone}</p>
                      <p><strong>🎓 Position:</strong> {member.position}</p>
                      <p><strong>🏡 Address:</strong> {member.address}</p>
                      <p><strong>⚥ Gender:</strong> {member.gender}</p>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEdit(member)} className="bg-yellow-300 hover:bg-yellow-400 text-black px-3 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(member.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-pink-700 italic">
          © Rangga Store 2023 — Tumbuh bersama pelanggan penuh cinta 💌
        </footer>
      </div>
    </div>
  );
}
