'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderMenu from '../components/headermenu';

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // <- ini dia
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    }
  }, []);
    return (
      <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
        {/* Navbar */}
        <HeaderMenu />
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
          Direktur Layanan Makanan bertanggung jawab atas keseluruhan operasi dan manajemen departemen layanan makanan di rumah sakit, universitas, kafetaria perusahaan, penjara, dan tempat-tempat kelembagaan lainnya. Tanggung jawab dapat mencakup penganggaran, perencanaan menu, pembelian, pengendalian inventaris, sanitasi, pelatihan staf, dan layanan pelanggan. Mereka juga memastikan bahwa layanan makanan memenuhi semua peraturan dan standar kesehatan dan keselamatan.
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
            <p>Seorang Supervisor Restoran bertanggung jawab untuk mengawasi operasional restoran sehari-hari. Ini termasuk mengelola staf, memastikan kepuasan pelanggan, menegakkan peraturan kesehatan dan keselamatan, dan memastikan restoran memenuhi tujuan keuangannya. Supervisor Restoran juga memastikan bahwa semua staf dilatih dengan benar dan mengikuti pedoman dan prosedur perusahaan. Selain itu, mereka mungkin juga bertanggung jawab untuk memantau inventaris makanan dan minuman, mengadakan rapat staf, dan menyelesaikan keluhan pelanggan.</p>
          </div>
        </section>
  
        {/* Testimoni */}
        <section id="testimoni" className="w-full text-white">
          {[
            {
              nama: "Neo",
              warna: "bg-[#8B6F4E]",
              ulasan:
                "Tukang roti adalah seseorang yang memanggang dan menyiapkan kue, roti, pastry, dan makanan panggang lainnya. Mereka dapat bekerja di toko roti, restoran, atau tempat layanan makanan lainnya. Tukang roti juga dapat menyiapkan adonan untuk kue, biskuit, pai, dan makanan panggang lainnya. Selain memanggang, tukang roti juga dapat memberi lapisan gula dan menghias kue, roti, dan makanan panggang lainnya. Mereka juga dapat membuat kue khusus dan makanan panggang lainnya untuk acara-acara khusus.",
            },
            {
              nama: "Hezron",
              warna: "bg-[#2D2318]",
              ulasan:
                "Kasir bertanggung jawab untuk menangani transaksi di toko atau tempat usaha lainnya. Tugasnya meliputi pemrosesan pembayaran, penghitungan uang kembalian, menjawab pertanyaan pelanggan, dan memberikan layanan pelanggan. Kasir juga bertanggung jawab untuk mengisi rak, mengelola inventaris, dan menjaga area kasir tetap bersih dan teratur.",
            },
            {
              nama: "Pivin",
              warna: "bg-[#C59B6D]",
              ulasan:
                "Mesin pencuci piring adalah mesin yang membersihkan dan mencuci piring, peralatan, dan barang dapur lainnya. Mesin pencuci piring biasanya menggunakan kombinasi air panas, deterjen, dan uap untuk membersihkan dan menghilangkan partikel makanan dari barang yang dicuci. Beberapa model juga menggunakan pemilihan sanitasi yang menghilangkan suhu tinggi untuk membunuh bakteri.",
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
  