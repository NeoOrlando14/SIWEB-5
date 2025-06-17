'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    // Login untuk pembeli
    if (!isAdminMode && email === 'pembeli@gmail.com' && password === 'pembeli123') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/home');
    }

    // Login untuk admin
    else if (isAdminMode && email === 'admin@gmail.com' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin-dashboard');
    }

    // Gagal login
    else {
      alert('Email atau password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD1DC] via-[#FFDEE9] to-[#FFF1F9] flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-80 backdrop-blur-lg shadow-2xl rounded-3xl px-10 py-12 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-2">Welcome</h1>
        <p className="text-sm text-pink-700 mb-6">
          {isAdminMode ? 'Login sebagai admin' : 'Tolong Masukkan Password dan Email anda'}
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-pink-800 font-semibold mb-1">Email</label>
            <div className="flex items-center border-2 border-pink-300 rounded-full px-3 bg-yellow-50">
              <FaEnvelope className="text-pink-500 mr-2" />
              <input
                type="email"
                className="flex-1 bg-transparent outline-none py-2 text-pink-800"
                placeholder="emailmu@cinta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-pink-800 font-semibold mb-1">Password</label>
            <div className="flex items-center border-2 border-pink-300 rounded-full px-3 bg-yellow-50">
              <FaLock className="text-pink-500 mr-2" />
              <input
                type="password"
                className="flex-1 bg-transparent outline-none py-2 text-pink-800"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-full transition shadow-md mt-4"
          >
            LOGIN
          </button>
        </form>

        <div className="flex justify-between text-sm text-pink-700 mt-4">
          <Link href="/register" className="hover:underline">Register?</Link>
          <Link href="/lupa-password" className="hover:underline">Lupa Password?</Link>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button className="text-gray-400">Google</button>
          <button className="text-gray-400">Facebook</button>
          <button className="text-gray-400">Apple</button>
        </div>

        <button
          onClick={() => setIsAdminMode(true)}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-full transition shadow-md"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}
