'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderMenu from '../components/headermenu';

export default function Home() {
  const router = useRouter();

  // ======================== LOGOUT AMAN ========================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("isLoggedIn");
      window.localStorage.removeItem("email");
      window.localStorage.removeItem("role");
    }
    router.push("/login");
  };

  // ======================== PROTECT PAGE ========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem("isLoggedIn");
    const role = window.localStorage.getItem("role");

    if (isLoggedIn !== "true") {
      router.push("/login");
      return;
    }

    if (role !== "customer") {
      alert("Halaman ini khusus untuk pembeli!");
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
      {/* Navbar */}
      <HeaderMenu />

      {/* 🔥 BUTTON LOGOUT */}
      <button 
        onClick={handleLogout}
        className="fixed top-4 right-4 bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold">Selamat Datang di Halaman Home</h1>

      {/* Produk */}
      <section id="produk" className="bg-orange-400 w-full p-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-1">
        {[
          { name: 'Bunny', price: '5.000', originalPrice: '150.000', img: '/Labubucake.png' },
          { name: 'Tedi', price: '5.000', originalPrice: '150.000', img: '/bearcake.png' },
        ].map((item) => (
          <div key={item.name} className="relative bg-orange-300 rounded-xl p-2 shadow-md flex flex-col items-center">
            <div className="absolute top-2 right-2 bg-pink-300 text-yellow-300 font-bold px-3 py-1 rounded-full text-sm shadow-md">
              99%
            </div>
            <img src={item.img} alt={item.name} className="mx-auto h-32 object-contain" />
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-white line-through text-sm">Rp. {item.originalPrice}</p>
            <p className="text-white text-2xl font-semibold">Rp. {item.price}</p>
          </div>
        ))}
      </section>

      {/* Deklarasi */}
      <section id="deklarasi" className="bg-[#8B5E3C] w-full p-6 text-center italic text-lg leading-loose">
        Direktur Layanan Makanan bertanggung jawab atas keseluruhan operasi dan manajemen departemen layanan makanan...
      </section>

      {/* Peta */}
      <section id="peta" className="bg-[#A67849] w-full p-4 flex justify-between items-center">
        <img src="/Map.png" alt="Lokasi" className="rounded-md w-[70%] mb-4 object-contain" />
        <img src="/hearsky.png" alt="Heart" className="w-40 object-contain" />
      </section>

      {/* Event & Ulasan */}
      <section id="event" className="bg-[#6B3E26] w-full p-10 text-white flex justify-between items-start gap-15">
        <img src="/Kalender14.png" alt="Calendar" className="w-100 mb-7" />
        <div className="max-w-xl text-center items-end">
          <h2 className="text-2xl font-bold mb-2">Romansa</h2>
          <p>Seorang Supervisor Restoran bertanggung jawab...</p>
        </div>
      </section>

      {/* Testimoni */}
      <section id="testimoni" className="w-full text-white">
        {[
          {
            nama: "Neo",
            warna: "bg-[#8B6F4E]",
            ulasan: "Tukang roti adalah seseorang yang memanggang..."
          },
          {
            nama: "Hezron",
            warna: "bg-[#2D2318]",
            ulasan: "Kasir bertanggung jawab untuk menangani transaksi..."
          },
          {
            nama: "Pivin",
            warna: "bg-[#C59B6D]",
            ulasan: "Mesin pencuci piring adalah mesin yang membersihkan..."
          }
        ].map((user, idx) => (
          <div key={idx} className={`${user.warna} p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black">👤</div>
              <div>
                <h3 className="text-lg font-bold">{user.nama}</h3>
                <p className="text-sm italic">Ulasan pada 14 Februari</p>
              </div>
            </div>
            <p className="mt-2">{user.ulasan}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
