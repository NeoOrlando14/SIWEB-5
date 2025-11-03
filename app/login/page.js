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

    if (!isAdminMode && email === 'pembeli@gmail.com' && password === 'pembeli123') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/home');
    } 
    else if (isAdminMode && email === 'admin@gmail.com' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin-dashboard');
    } 
    else {
      alert('Email atau password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] bg-opacity-90 backdrop-blur-lg shadow-xl rounded-3xl px-10 py-12 w-full max-w-md text-center border border-gray-700">
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome</h1>
        <p className="text-sm text-gray-300 mb-6">
          {isAdminMode ? 'Login sebagai admin' : 'Masukkan Email dan Password'}
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Email</label>
            <div className="flex items-center border border-gray-600 rounded-full px-3 bg-[#2a2a2a]">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                className="flex-1 bg-transparent outline-none py-2 text-white"
                placeholder="emailmu@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Password</label>
            <div className="flex items-center border border-gray-600 rounded-full px-3 bg-[#2a2a2a]">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                className="flex-1 bg-transparent outline-none py-2 text-white"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 rounded-full transition shadow-lg"
          >
            LOGIN
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-400 mt-4">
          <Link href="/register" className="hover:text-white">Register?</Link>
          <Link href="/lupa-password" className="hover:text-white">Lupa Password?</Link>
        </div>

        <div className="mt-6 flex justify-center space-x-4 text-gray-500">
          <button className="hover:text-white">Google</button>
          <button className="hover:text-white">Facebook</button>
          <button className="hover:text-white">Apple</button>
        </div>

        <button
          onClick={() => setIsAdminMode(true)}
          className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-full transition shadow-md"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
}
