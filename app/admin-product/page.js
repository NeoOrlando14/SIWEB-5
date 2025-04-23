'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminProductPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    }
  }, [router]);

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  const products = [
    {
      id: 1,
      name: 'Kue kelinci',
      price: 'Rp.5.000',
      rating: 4,
      reviews: 113,
      image: 'Labubucake.png',
    },
    {
      id: 2,
      name: 'Kelinci cewe',
      price: 'Rp.5.000',
      rating: 4,
      reviews: 24,
      image: 'Labubucake.png',
    },
    {
      id: 3,
      name: 'Headphone kelinci',
      price: 'Rp.5.000',
      rating: 4,
      reviews: 24,
      image: 'Labubucake.png',
    },
    {
      id: 4,
      name: 'Buahh Beruang',
      price: 'Rp.5.000',
      rating: 5,
      reviews: 334,
      image: 'bearcake.png',
    },
    {
      id: 5,
      name: 'Cewe beruang',
      price: 'Rp.5.000',
      rating: 5,
      reviews: 94,
      image: 'bearcake.png',
    },
    {
      id: 6,
      name: 'Bearuang Headphone',
      price: 'Rp.5.000',
      rating: 5,
      reviews: 94,
      image: 'bearcake.png',
    },
  ];

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8">
        <button
          title="Dashboard"
          onClick={() => router.push('/admin-dashboard')}
          className={iconClasses('/admin-dashboard')}
        >
          ☰
        </button>

        <button
          title="Dashboard"
          onClick={() => router.push('/admin-dashboard')}
          className={iconClasses('/admin-dashboard')}
        >
          📊
        </button>

        <button
          title="Product"
          onClick={() => router.push('/admin-product')}
          className={iconClasses('/admin-product')}
        >
          📦
        </button>

        <button
          title="Users"
          onClick={() => router.push('/admin-qcontact')}
          className={iconClasses('/admin-qcontact')}
        >
          👤
        </button>

        <button
          title="stock"
          onClick={() => router.push('/admin-stock')}
          className={iconClasses('/admin-stock')}
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
        <h1 className="text-4xl font-bold text-black mb-6">Product</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="bg-purple-900 text-white p-4">
                <h2 className="font-semibold text-lg">{product.name}</h2>
                <p>{product.price}</p>
                <div className="flex items-center gap-2 mt-1">
                  {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                  <span className="text-sm">({product.reviews})</span>
                </div>
                <button onClick={() => router.push(`/admin-product/edit/${product.id}`)}
                 className="mt-4 bg-white text-purple-900 font-semibold px-3 py-1 rounded hover:bg-purple-100 text-sm">
                  Edit Product
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-6 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
