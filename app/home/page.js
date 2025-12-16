"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, FileText, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ======================== PROTECT PAGE (SUPER AMAN) ========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem("isLoggedIn");
    const role = window.localStorage.getItem("role");

    if (!isLoggedIn || isLoggedIn !== "true" || role !== "customer") {
      router.replace("/login");
      return;
    }

    // Load products from database
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================== LOAD PRODUCTS ========================
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();

      // Get top 4 products (you can customize the logic)
      // Options:
      // 1. First 4 products
      // 2. Products with highest rating
      // 3. Products with most stock
      // 4. Random 4 products

      const topProducts = data.slice(0, 4); // Take first 4 products
      setProducts(topProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      // Fallback to empty array if error
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

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

        {/* ======================= MENU PRODUK (REAL DATA) ======================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loadingProducts ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow animate-pulse"
              >
                <div className="h-32 w-full bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Real products from database
            products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push("/shop")}
                className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-700 shadow hover:bg-[#272727] hover:scale-105 transition-all cursor-pointer"
              >
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.nama}
                  className="h-32 w-full object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-lg truncate">{product.nama}</h3>
                <p className="text-[#ffcf80] text-xl font-bold">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>

                {/* Stock indicator */}
                {product.stok > 0 ? (
                  <p className="text-green-400 text-xs mt-1">
                    Stok: {product.stok}
                  </p>
                ) : (
                  <p className="text-red-400 text-xs mt-1">
                    Habis
                  </p>
                )}

                {/* Rating (if available) */}
                {product.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-400">{product.rating}/5</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            // No products
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>Belum ada produk tersedia</p>
              <p className="text-sm mt-2">Admin sedang menambahkan produk...</p>
            </div>
          )}
        </div>

        {/* Button to see all products */}
        {!loadingProducts && products.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/shop")}
              className="px-8 py-3 bg-[#ffcf80] hover:bg-yellow-300 text-black font-bold rounded-full shadow-lg transition-all hover:scale-105"
            >
              Lihat Semua Menu →
            </button>
          </div>
        )}

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
            {
              nama: "Neo",
              warna: "bg-[#3a3a3a]",
              ulasan: "Rasanya mantap polll! Kopinya enak banget, tempatnya juga nyaman.",
              rating: 5
            },
            {
              nama: "Hezron",
              warna: "bg-[#2d2d2d]",
              ulasan: "Pelayanan cepat dan ramah. Harga terjangkau untuk mahasiswa.",
              rating: 5
            },
            {
              nama: "Pivin",
              warna: "bg-[#404040]",
              ulasan: "Harga murah tapi kualitas tinggi. Paling suka Lava Choco-nya!",
              rating: 5
            },
          ].map((u, idx) => (
            <div key={idx} className={`${u.warna} p-4 mb-4 rounded-xl border border-gray-700 hover:border-gray-600 transition`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg">
                  {u.nama.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{u.nama}</h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: u.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-gray-300 italic">&ldquo;{u.ulasan}&rdquo;</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
