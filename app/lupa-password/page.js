'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    alert('Password berhasil diubah!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] bg-opacity-90 backdrop-blur-lg shadow-xl rounded-3xl w-full max-w-md px-8 py-10 border border-gray-700">
        <h1 className="text-3xl font-extrabold text-white mb-2">Ubah Password</h1>
        <p className="text-sm text-gray-300 mb-6">
          Tolong buat password Anda dengan benar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Password Lama</label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Password Baru</label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Konfirmasi Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-full transition shadow-lg mt-2"
          >
            Simpan
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" className="text-gray-300 text-sm hover:text-white transition">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
