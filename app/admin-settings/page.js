'use client'

import { useRouter } from 'next/navigation'

export default function AdminSetting() {
  const router = useRouter()

  const navigateTo = (path) => {
    router.push(path)
  }

  const iconClasses = (path) => {
    return 'text-2xl hover:text-yellow-400'
  }

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

      {/* Konten */}
      <div className="flex-1 bg-gradient-to-br from-orange-200 via-red-200 to-yellow-100 p-10">
        <h1 className="text-4xl font-bold mb-8 text-black">Setting</h1>

        <div className="bg-[#6e2e2e] p-10 rounded-xl text-white w-full max-w-4xl mx-auto shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black text-xl">
                📷
              </div>
              <p className="mt-2 text-sm text-white">Upload Logo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-sm">Site Name</p>
              <input type="text" defaultValue="Toko Kue Pak Rangga" className="w-full p-2 rounded bg-gray-800" />
            </div>
            <div>
              <p className="mb-1 text-sm">Copy Right</p>
              <input type="text" defaultValue="Spesialis Kue Tradisional & Modern" className="w-full p-2 rounded bg-gray-800" />
            </div>
            <div>
              <p className="mb-1 text-sm">SEO Title</p>
              <input type="text" defaultValue="Rasa Warisan, Nikmat Tak Tertandingi" className="w-full p-2 rounded bg-gray-800" />
            </div>
            <div>
              <p className="mb-1 text-sm">SEO Description</p>
              <textarea
  className="w-full p-2 rounded bg-gray-800 h-24"
  defaultValue="Kami menyediakan kue basah, kue kering, kue tradisional dan kue custom terbaik di Bantul. Sampaikan kue apa yang mau tak tertandingi!"
/>
            </div>
            <div>
              <p className="mb-1 text-sm">SEO Keywords</p>
              <input type="text" defaultValue="CEO" className="w-full p-2 rounded bg-gray-800" />
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg">Save</button>
          </div>
        </div>

        <footer className="text-center text-black mt-10 text-sm">
          ©Rangga Store Copyright © 2023 - Developed by KSI UAJY. Powered by Moodle
        </footer>
      </div>
    </div>
  )
}
