'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function HeaderMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('isLoggedIn');
    }
    router.push('/login');
  };

  const goTo = (path) => {
    router.push(path);
    setMenuOpen(false); // Tutup menu mobile
  };

  return (
    <header className="w-full bg-pink-800 text-white py-4 z-50 relative shadow-lg">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        
        {/* Logo + Home */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => goTo('/home')}
        >
          <img src="/logotoko.png" alt="Logo" className="h-8 w-8 rounded-full" />
          <h1 className="text-xl font-bold">Toko Kue Pak Rangga</h1>
        </div>

        {/* Menu Desktop */}
        <ul className="hidden md:flex space-x-6 text-sm font-semibold">
          <li><button onClick={() => goTo('/home#peta')} className="hover:text-yellow-300">Maps</button></li>
          <li><button onClick={() => goTo('/home#testimoni')} className="hover:text-yellow-300">About</button></li>
          <li><button onClick={() => goTo('/contact')} className="hover:text-yellow-300">Contact</button></li>
          <li><button onClick={() => goTo('/shop')} className="hover:text-yellow-300">Shop</button></li>
          <li><button onClick={handleLogout} className="hover:text-yellow-300">Sign In</button></li>
        </ul>

        {/* Burger Menu Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-pink-700 px-6 py-4 space-y-3 text-sm font-semibold">
          <button onClick={() => goTo('/home#peta')} className="block w-full text-left hover:text-yellow-300">Maps</button>
          <button onClick={() => goTo('/home#testimoni')} className="block w-full text-left hover:text-yellow-300">About</button>
          <button onClick={() => goTo('/contact')} className="block w-full text-left hover:text-yellow-300">Contact</button>
          <button onClick={() => goTo('/shop')} className="block w-full text-left hover:text-yellow-300">Shop</button>
          <button onClick={handleLogout} className="block w-full text-left hover:text-yellow-300">Sign In</button>
        </div>
      )}
    </header>
  );
}
