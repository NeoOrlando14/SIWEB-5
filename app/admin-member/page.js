'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMemberPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (!adminStatus) {
      router.push('/login');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  const iconClasses = (path) =>
    `text-xl hover:scale-125 transition-transform ${
      typeof window !== 'undefined' && window.location.pathname === path
        ? 'text-yellow-300'
        : 'text-white'
    }`;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>

        <button
          title="Dashboard"
          onClick={() => router.push('/admin-dashboard')}
          className={iconClasses('/admin-dashboard')}
        >
          📊
        </button>

        <button
          title="Orders"
          onClick={() => router.push('/admin-product')}
          className={iconClasses('/admin-product')}
        >
          📦
        </button>

        <button
          title="Users"
          onClick={() => router.push('/admin-qcontact')}
          className={iconClasses('/admin-users')}
        >
          👤
        </button>

        <button
          title="Gifts"
          onClick={() => router.push('/admin-stock')}
          className={iconClasses('/admin-gifts')}
        >
          🎁
        </button>

        <button
          title="Customers"
          onClick={() => router.push('/admin-member')}
          className={iconClasses('/admin-member')}
        >
          👥
        </button>

        <button
          title="Settings"
          onClick={() => router.push('/admin-settings')}
          className={iconClasses('/admin-settings')}
        >
          ⚙️
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8">
        <h1 className="text-4xl font-bold text-black mb-8">Add Member</h1>

        <div className="bg-[#873636] text-white max-w-4xl mx-auto p-8 rounded shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-4xl">📷</span>
            </div>
          </div>
          <h2 className="text-center text-blue-300 font-semibold mb-6">Upload Photo</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="bg-gray-800 p-2 rounded" placeholder="First Name" />
            <input className="bg-gray-800 p-2 rounded" placeholder="Last Name" />
            <input className="bg-gray-800 p-2 rounded col-span-1" placeholder="Your email" />
            <input className="bg-gray-800 p-2 rounded col-span-1" placeholder="Phone Number" />
            <input className="bg-gray-800 p-2 rounded col-span-1" placeholder="Position" />
            <input className="bg-gray-800 p-2 rounded col-span-1" placeholder="Address" />
            <select className="bg-gray-800 p-2 rounded col-span-1">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </form>

          <div className="flex justify-center mt-8">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded shadow">Add Now</button>
          </div>
        </div>

        <footer className="mt-10 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
