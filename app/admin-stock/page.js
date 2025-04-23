'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStockPage() {
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) router.push('/login');
  }, [router]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Apple Watch Series 4',
      category: 'Fast Bawah',
      price: 8000,
      stock: 63,
      colors: ['black', 'pink'],
      image: '/applewatch.jpg',
    },
    {
      id: 2,
      name: 'Girl Handy bag',
      category: 'Kue Kering',
      price: 280000,
      stock: 13,
      colors: ['blue', 'yellow', 'pink'],
      image: '/handybag.jpg',
    },
  ]);

  const [editId, setEditId] = useState(null);

  const handleEdit = (id, field, value) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleToggleEdit = (id) => {
    if (editId === id) {
      setEditId(null); // Save
    } else {
      setEditId(id); // Edit mode
    }
  };

  const iconClasses = (path) =>
    `text-xl hover:scale-125 transition-transform ${
      typeof window !== 'undefined' && window.location.pathname === path
        ? 'text-yellow-300'
        : 'text-white'
    }`;

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

      {/* Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8 overflow-x-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Product Stock</h1>

        <table className="min-w-full bg-pink-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-pink-600 text-white">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Product Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price (IDR)</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Available Color</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isEditing = editId === product.id;

              return (
                <tr key={product.id} className="text-black bg-pink-100 border-b border-pink-400">
                  <td className="px-4 py-2">
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        value={product.name}
                        onChange={(e) => handleEdit(product.id, 'name', e.target.value)}
                        className="bg-white px-2 py-1 rounded w-full"
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        value={product.category}
                        onChange={(e) => handleEdit(product.id, 'category', e.target.value)}
                        className="bg-white px-2 py-1 rounded w-full"
                      />
                    ) : (
                      product.category
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleEdit(product.id, 'price', e.target.value)}
                        className="bg-white px-2 py-1 rounded w-full"
                      />
                    ) : (
                      product.price.toLocaleString('id-ID')
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleEdit(product.id, 'stock', e.target.value)}
                        className="bg-white px-2 py-1 rounded w-full"
                      />
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-4 py-2 flex space-x-1 justify-center">
                    {product.colors.map((color, index) => (
                      <span key={index} className={`w-4 h-4 rounded-full`} style={{ backgroundColor: color }}></span>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleToggleEdit(product.id)}
                      className="text-blue-800 hover:scale-125 transition-transform"
                    >
                      {isEditing ? '💾' : '✏️'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <footer className="mt-10 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
