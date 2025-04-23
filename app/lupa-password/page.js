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
    // Simulasi reset password
    alert('Password berhasil diubah!');
  };

  return (
    <div
      className="min-h-screen bg-pink-300 bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('/register-bg.png')" }} // Ganti dengan gambar kamu
    >
      <div className="absolute inset-0 bg-[#d88b87]/80 z-0" />
      <div className="relative z-10 p-8 rounded-xl w-full max-w-md bg-transparent text-black font-serif">
        <h1 className="text-2xl font-semibold mb-6 text-left text-white">
          Tolong buat password anda <br /> dengan benar.
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="mb-1 text-white">Password Lama</label>
            <input
              type="password"
              placeholder="XXXXXXXXX"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-white">Password Baru</label>
            <input
              type="password"
              placeholder="XXXXXXXXX"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-white">Konfirmasi Password</label>
            <input
              type="password"
              placeholder="XXXXXXXXX"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-start mt-4">
            <button
              type="submit"
              className="w-full bg-white text-pink-600 font-bold px-6 py-2 rounded-md shadow-md hover:bg-pink-100 transition"
            >
              Simpan
            </button>
          </div>
        </form>

        <div className="mt-4">
        <Link href="/login" className="text-white text-sm hover:underline">
        Kembali ke Login
        </Link>
        </div>
      </div>
    </div>
  );
}
