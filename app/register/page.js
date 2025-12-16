'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !phone || !dob) {
      alert('Semua data harus diisi!');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, dob })
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.message);
        return;
      }

      alert('Registrasi berhasil!');
      router.push('/login');

    } catch (err) {
      console.error(err);
      alert("Server error, coba lagi!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1f1f1f] bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700 px-8 py-10">
        <h1 className="text-center text-3xl font-extrabold text-white mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-center text-sm text-gray-300 mb-8">
          Tolong isi data diri Anda dengan benar.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Email Baru</label>
            <input type="email" placeholder="emailmu@example.com"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">No. Telepon Baru</label>
            <input type="tel" placeholder="0823xxxxxxx"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-300 font-medium mb-1">Tanggal Lahir</label>
            <input type="date"
              className="w-full rounded-xl px-4 py-2.5 bg-[#2a2a2a] text-white border border-gray-600 outline-none"
              value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-full shadow-lg">
              Simpan
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-300">
          Sudah punya akun?{' '}
          <Link href="/login" className="hover:text-white transition underline decoration-gray-500">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
