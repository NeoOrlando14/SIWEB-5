'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !phone || !dob) {
      alert('Semua data harus diisi!');
      return;
    }

    alert('Registrasi berhasil!');
    router.push('/login');
  };

  return (
    <div
      className="min-h-screen bg-pink-300 bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('/register-bg.png')" }}
    >
      <div className="absolute inset-0 bg-[#d88b87]/80 z-0" />
      <div className="relative z-10 p-8 rounded-xl w-full max-w-4xl">
        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6 text-black font-serif">
          Tolong buat data diri anda
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1">Email Baru</label>
            <input
              type="email"
              placeholder="exmpaill@gmail.com"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1">Password Baru</label>
            <input
              type="password"
              placeholder="xxxxxxxxx"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1">No.Tlpn Baru</label>
            <input
              type="tel"
              placeholder="082317XXXXXX"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-black font-semibold mb-1">Tanggal Lahir</label>
            <input
              type="date"
              className="rounded-md px-4 py-2 bg-white text-gray-700"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 mt-6 flex justify-center">
            <button
              type="submit"
              className="bg-white px-6 py-2 rounded-md font-semibold text-pink-700 shadow-md hover:bg-pink-100 transition"
            >
              Simpan
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-white">
          Sudah punya akun?{' '}
          <Link href="/login" className="underline text-white hover:text-pink-200">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
