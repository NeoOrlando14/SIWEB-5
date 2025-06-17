'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function AdminSetting() {
  const router = useRouter()
  const pathname = usePathname()

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath
        ? 'bg-white text-pink-600 scale-110'
        : 'hover:bg-pink-200 text-white'
    }`

  return (
    <div className="min-h-screen flex text-white font-sans">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8 text-xl">
        <span title="Menu" className="text-2xl">☰</span>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Product" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-qcontact')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="Transaksi" onClick={() => router.push('/admin-transaksi')} className={iconClasses('/admin-transaksi')}>🧾</button>
        <button title="Member" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      {/* Konten */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-pink-100 via-rose-200 to-amber-100 flex flex-col items-center justify-center py-10">
        <h1 className="text-5xl font-bold text-pink-700 mb-10 drop-shadow-sm">💒 Profil Toko Kue</h1>

        <div className="bg-white/60 backdrop-blur-lg border border-pink-200 rounded-3xl shadow-xl p-10 w-full max-w-4xl text-pink-800 space-y-6">
          {/* Upload Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-white border-4 border-pink-300 rounded-full flex items-center justify-center text-4xl shadow-lg">
              📸
            </div>
            <p className="mt-2 text-pink-600 italic text-sm">Upload Logo Toko</p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">🍰 Nama Toko</label>
              <input
                type="text"
                defaultValue="Toko Kue Pak Rangga"
                className="w-full p-3 rounded-xl bg-white border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">©️ Copyright</label>
              <input
                type="text"
                defaultValue="Spesialis Kue Tradisional & Modern"
                className="w-full p-3 rounded-xl bg-white border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">🎯 SEO Judul</label>
              <input
                type="text"
                defaultValue="Rasa Warisan, Nikmat Tak Tertandingi"
                className="w-full p-3 rounded-xl bg-white border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">📝 Deskripsi SEO</label>
              <textarea
                rows="4"
                defaultValue="Kami menyediakan kue basah, kue kering, kue tradisional dan kue custom terbaik di Bantul. Sampaikan kue apa yang mau tak tertandingi!"
                className="w-full p-3 rounded-xl bg-white border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none shadow-inner"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1">🔑 Kata Kunci SEO</label>
              <input
                type="text"
                defaultValue="kue basah, kue tradisional, kue ulang tahun, kue custom"
                className="w-full p-3 rounded-xl bg-white border border-pink-300 focus:ring-2 focus:ring-pink-400 outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="text-center pt-4">
            <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-10 rounded-full shadow-md hover:shadow-lg transition duration-300">
              💾 Simpan Profil
            </button>
          </div>
        </div>

        <footer className="mt-12 text-pink-700 italic text-sm">
          🍮 Toko Kue Rangga — Rasa penuh kenangan © 2023. Dibuat penuh cinta oleh KSI UAJY
        </footer>
      </div>
    </div>
  )
}
