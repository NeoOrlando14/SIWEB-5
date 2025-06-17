'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminContactPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  const contacts = [
    { id: 1, name: 'Pikachu', email: 'rumiy.bambank@wilds.id', image: 'pika.jpg' },
    { id: 2, name: 'Duane Dean', email: 'rumiy.bambank@wilds.id', image: 'duane.jpg' },
    { id: 3, name: 'Jonathan Barker', email: 'rumiy.bambank@wilds.id', image: 'jona.jpg' },
    { id: 4, name: 'Erland', email: 'rumiy.bambank@wilds.id', image: 'erland.jpeg' },
    { id: 5, name: 'Fyyyy', email: 'rumiy.bambank@wilds.id', image: 'fyfy.jpg' },
    { id: 6, name: 'Herzorn', email: 'rumiy.bambank@wilds.id', image: 'hz.jpg' },
    { id: 7, name: 'Neo', email: 'rumiy.bambank@wilds.id', image: 'Neo.jpg' },
    { id: 8, name: 'Dave', email: 'rumiy.bambank@wilds.id', image: 'dv.jpg' },
    { id: 9, name: 'Dion', email: 'rumiy.bambank@wilds.id', image: 'dn.jpg' },
  ];

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  const handleMessageClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSendMessage = () => {
    alert(`Pesan dikirim ke ${selectedUser.name}`);
    setShowModal(false);
  };

  if (!isAllowed) return null;

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8">
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>☰</button>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Product" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-qcontact')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="Stock" onClick={() => router.push('/admin-transaksi')} className={iconClasses('/admin-transaksi')}>🧾</button>
        <button title="Customers" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-pink-200 via-rose-400 to-pink-300 p-8">
        <h1 className="text-4xl font-bold text-black mb-8">Contact</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contacts.map((user) => (
            <div key={user.id} className="rounded-lg overflow-hidden bg-white shadow-lg">
              <img src={user.image} alt={user.name} className="w-full h-48 object-cover" />
              <div className="bg-pink-500 text-white text-center py-4">
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-sm">{user.email}</p>
                <button
                  onClick={() => handleMessageClick(user)}
                  className="mt-2 bg-white text-pink-600 px-4 py-1 rounded font-semibold text-sm hover:bg-pink-100"
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4 text-black">Kirim Pesan ke {selectedUser.name}</h2>
              <textarea
                rows="4"
                className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
                placeholder="Tulis pesan di sini..."
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                  onClick={handleSendMessage}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-10 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
