"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coffee, FileText, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();

  // ======================== PROTECT PAGE (SUPER AMAN) ========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem("isLoggedIn");
    const role = window.localStorage.getItem("role");

    if (!isLoggedIn || isLoggedIn !== "true" || role !== "customer") {
      router.replace("/login");
      return;
    }
  }, []);

  // ======================== LOGOUT ========================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a] text-white">

      {/* ============================= SIDEBAR ============================= */}
      <aside className="w-20 bg-[#1f1f1f] flex flex-col justify-between items-center py-6 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">

          {/* LOGO TEXT */}
          <h1 className="text-[12px] font-bold text-gray-300 tracking-widest">
            SEBELAH
          </h1>
          <h1 className="text-[12px] font-bold text-[#ffcf80] -mt-3 tracking-widest">
            KOPI
          </h1>

          {/* MENU */}
          <button
            onClick={() => router.push("/shop")}
            className="p-3 hover:bg-gray-700 rounded-xl transition"
            title="Menu"
          >
            <Coffee size={22} />
          </button>

          {/* TRANSAKSI */}
          <button
            onClick={() => router.push("/transaksi-saya")}
            className="p-3 hover:bg-gray-700 rounded-xl transition"
            title="Transaksi"
          >
            <FileText size={22} />
          </button>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition-all duration-300"
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* ============================= MAIN CONTENT ============================= */}
      <main className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-8">Menu Sebelah Kopi</h1>

        {/* ======================= MENU PRODUK ======================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: "Bunny Cake", price: 5000, img: "/placeholder.png" },
            { name: "Tedi Cake", price: 5000, img: "/placeholder.png" },
            { name: "Lava Choco", price: 7000, img: "/placeholder.png" },
            { name: "Sweet Dessert", price: 9000, img: "/placeholder.png" },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow hover:bg-[#272727] transition cursor-pointer"
            >
              <img
                src={p.img}
                alt={p.name}
                className="h-32 w-full object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-[#ffcf80] text-xl font-bold">
                Rp {p.price.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        {/* ======================= MAPS LOKASI ======================= */}
        <div className="mt-12 bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">
          <h2 className="text-2xl font-bold mb-4">Lokasi Sebelah Kopi</h2>

          <p className="mb-4 text-gray-300">
            Sebelah Kopi, Jl. Wijaya Kusuma No.234, Dero, Condongcatur, Depok, Sleman, DI Yogyakarta 55283.
          </p>

          <iframe
            className="w-full h-64 rounded-xl border border-gray-700"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.2058570580356!2d110.40084177406328!3d-7.775241777228003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5854b96aa1a5%3A0xa8799a39af994ed3!2sJl.%20Wijaya%20Kusuma%20No.234%2C%20Dero%2C%20Condongcatur%2C%20Depok%2C%20Sleman%2C%20Daerah%20Istimewa%20Yogyakarta%2055283!5e0!3m2!1sen!2sid!4v1732456378941!5m2!1sen!2sid"
          ></iframe>
        </div>

        {/* ======================= TESTIMONI ======================= */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Testimoni Pelanggan</h2>

          {[
            { nama: "Neo", warna: "bg-[#3a3a3a]", ulasan: "Rasanya mantap polll!" },
            { nama: "Hezron", warna: "bg-[#2d2d2d]", ulasan: "Pelayanan cepat dan ramah." },
            { nama: "Pivin", warna: "bg-[#404040]", ulasan: "Harga murah tapi kualitas tinggi." },
          ].map((u, idx) => (
            <div key={idx} className={`${u.warna} p-4 mb-4 rounded-xl border border-gray-700`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                  👤
                </div>
                <div>
                  <h3 className="font-bold">{u.nama}</h3>
                  <p className="text-sm text-gray-400">Ulasan pelanggan</p>
                </div>
              </div>
              <p className="mt-2">{u.ulasan}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
