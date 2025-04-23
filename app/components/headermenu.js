'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars } from 'react-icons/fa';

export default function HeaderMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <header className="w-full bg-pink-800 text-white py-4 relative z-10">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo dan Judul */}
        <div  className="flex items-center space-x-3 cursor-pointer"
  onClick={() => router.push('/home')}>
          <img src="/logotoko.png" alt="Logo" className="h-8 w-8 rounded-full" />
          <h1 className="text-xl font-bold">Toko Kue Pak Rangga</h1>
        </div>

        {/* Menu Desktop */}
        <ul className="hidden md:flex space-x-6">
          <li><a href="#peta" className="hover:text-yellow-300">Maps</a></li>
          <li><a href="#testimoni" className="hover:text-yellow-300">About</a></li>
          <li><button onClick={() => router.push('/contact')} className="hover:text-yellow-300">Contact</button></li>
          <li><button onClick={() => router.push('/shop')} className="hover:text-yellow-300">Shop</button></li>
          <li><button onClick={handleLogout} className="hover:text-yellow-300">Sign in</button></li>
        </ul>

        {/* Tombol Menu Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
          <FaBars />
        </button>
      </nav>

      {/* Menu Dropdown Mobile */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-700 text-white px-4 py-4 space-y-3">
          <a href="#peta" className="block w-full text-left hover:text-yellow-300">Maps</a>
          <a href="#testimoni" className="block w-full text-left hover:text-yellow-300">About</a>
          <a href="#contact" className="block w-full text-left hover:text-yellow-300">Contact</a>
          <button
            onClick={() => router.push('/shop')}
            className="block w-full text-left hover:text-yellow-300"
          >
            Shop
          </button>
          <button
            onClick={() => alert('Account Info')}
            className="block w-full text-left hover:text-yellow-300"
          >
            Account Info
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left hover:text-yellow-300"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
