'use client';

import { useRouter } from 'next/navigation';
import HeaderMenu from '../components/headermenu';

export default function Contact() {
  const router = useRouter();

  return (
    <>
      <HeaderMenu />
      <main className="bg-pink-200 min-h-screen p-8 text-center text-pink-900 font-serif">
        <h1 className="text-4xl font-bold mb-6">Hubungi Kami</h1>
        <p className="text-lg mb-4">Kami senang mendengar kabar dari Anda!</p>

        <div className="max-w-xl mx-auto bg-white bg-opacity-70 p-6 rounded-xl shadow-md mb-6">
          <p className="mb-2">
            <span className="font-semibold">📍 Alamat:</span> Jl. Barbasari, Yogyakarta
          </p>
          <p className="mb-2">
            <span className="font-semibold">📞 Telepon:</span>{' '}
            <a href="tel:081298765432" className="text-pink-700 underline">
              0812-9876-5432
            </a>
          </p>
          <p className="mb-4">
            <span className="font-semibold">📧 Email:</span>{' '}
            <a href="mailto:toko@kuerangga.com" className="text-pink-700 underline">
              tokopakrangga@gmail.com
            </a>
          </p>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63342.45698708322!2d107.5731166!3d-6.9034498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7bf2a738ddd%3A0x7c7aa0a08ccdf8e6!2sYogyakarta!5e0!3m2!1sen!2sid!4v1615973681024!5m2!1sen!2sid"
            width="100%"
            height="300"
            allowFullScreen=""
            loading="lazy"
            className="rounded-md"
          ></iframe>
        </div>

        {/* Tombol kembali */}
        <button
          onClick={() => router.push('/home')}
          className="bg-pink-700 hover:bg-pink-800 text-white font-semibold px-6 py-2 rounded-full transition"
        >
          ⬅ Kembali ke Home
        </button>
      </main>
    </>
  );
}
