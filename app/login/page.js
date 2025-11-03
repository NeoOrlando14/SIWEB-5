'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Email atau password salah");
      return;
    }

    // ✅ Save session
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("isLoggedIn", "true");

    // ✅ Redirect based on role
    if (data.user.role === "admin") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin-dashboard");
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] bg-opacity-90 backdrop-blur-lg shadow-xl rounded-3xl px-10 py-12 w-full max-w-md text-center border border-gray-700">
        
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome</h1>
        <p className="text-sm text-gray-300 mb-6">
          {isAdminMode ? "Login sebagai admin" : "Masukkan Email dan Password"}
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
