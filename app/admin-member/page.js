'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMemberPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen flex text-white">
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')}>📊</button>
        <button title="Product" onClick={() => router.push('/admin-product')}>📦</button>
        <button title="Contact" onClick={() => router.push('/admin-qcontact')}>👤</button>
        <button title="Stock" onClick={() => router.push('/admin-stock')}>🎁</button>
        <button title="Member" onClick={() => router.push('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')}>⚙️</button>
      </div>

      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-black mb-8">{editingId ? 'Edit Member' : 'Add Member'}</h1>

        <div className="bg-[#873636] max-w-4xl mx-auto p-8 rounded-xl shadow-2xl text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-md">
              <span className="text-4xl">📷</span>
            </div>
          </div>
          <h2 className="text-center text-blue-300 font-semibold mb-6 text-lg">Upload Photo</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <input className="bg-gray-800 p-3 rounded-md" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <input className="bg-gray-800 p-3 rounded-md" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <input className="bg-gray-800 p-3 rounded-md" placeholder="Your email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <input className="bg-gray-800 p-3 rounded-md" placeholder="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
            <input className="bg-gray-800 p-3 rounded-md" placeholder="Position" name="position" value={formData.position} onChange={handleChange} />
            <input className="bg-gray-800 p-3 rounded-md" placeholder="Address" name="address" value={formData.address} onChange={handleChange} />
            <select className="bg-gray-800 p-3 rounded-md" name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
              {editingId ? 'Update Member' : 'Add Now'}
            </button>
          </form>
        </div>

        {/* Member List */}
        {members.length > 0 && (
          <div className="bg-white text-black max-w-4xl mx-auto mt-10 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Members List</h2>
            <ul className="space-y-4">
              {members.map((member) => (
                <li key={member.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p><strong>Name:</strong> {member.firstName} {member.lastName}</p>
                      <p><strong>Email:</strong> {member.email}</p>
                      <p><strong>Phone:</strong> {member.phone}</p>
                      <p><strong>Position:</strong> {member.position}</p>
                      <p><strong>Address:</strong> {member.address}</p>
                      <p><strong>Gender:</strong> {member.gender}</p>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEdit(member)} className="bg-yellow-400 px-3 py-1 rounded text-black hover:bg-yellow-500">Edit</button>
                      <button onClick={() => handleDelete(member.id)} className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-black">
          © Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Neon
        </footer>
      </div>
    </div>
  );
}
