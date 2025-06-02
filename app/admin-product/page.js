'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminProductPage() {
  const router = useRouter();
  const pathname = usePathname();

  // cek admin
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

  // state produk dan form input
  const [products, setProducts] = useState([
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
  ]);

  const [search, setSearch] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', rating: 5, reviews: 0 });

  // state untuk edit product
  const [editProductId, setEditProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', image: '' });

  // Filter produk berdasarkan search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Tambah produk baru
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('Mohon isi semua data produk baru!');
      return;
    }
    const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts([...products, { ...newProduct, id: newId }]);
    setNewProduct({ name: '', price: '', image: '', rating: 5, reviews: 0 });
  };

  // Hapus produk
  const handleDeleteProduct = (id) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      setProducts(products.filter((p) => p.id !== id));
      if (editProductId === id) setEditProductId(null);
    }
  };

  // Mulai edit
  const handleEditClick = (product) => {
    setEditProductId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  // Batalkan edit
  const handleCancelEdit = () => {
    setEditProductId(null);
  };

  // Simpan edit
  const handleSaveEdit = (id) => {
    if (!editFormData.name || !editFormData.price || !editFormData.image) {
      alert('Mohon isi semua data produk!');
      return;
    }
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, ...editFormData } : p
      )
    );
    setEditProductId(null);
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gradient-to-b from-[#351c1c] via-[#44221b] to-[#291510] flex flex-col items-center py-4 space-y-8">
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>☰</button>
        <button title="Dashboard" onClick={() => router.push('/admin-dashboard')} className={iconClasses('/admin-dashboard')}>📊</button>
        <button title="Product" onClick={() => router.push('/admin-product')} className={iconClasses('/admin-product')}>📦</button>
        <button title="Users" onClick={() => router.push('/admin-qcontact')} className={iconClasses('/admin-qcontact')}>👤</button>
        <button title="stock" onClick={() => router.push('/admin-stock')} className={iconClasses('/admin-stock')}>🎁</button>
        <button title="Customers" onClick={() => router.push('/admin-member')} className={iconClasses('/admin-member')}>👥</button>
        <button title="Settings" onClick={() => router.push('/admin-settings')} className={iconClasses('/admin-settings')}>⚙️</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-orange-700 via-orange-400 to-yellow-300 p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-black mb-6">Product</h1>

        {/* Search & Add Product */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Cari produk..."
            className="p-2 rounded border text-black flex-grow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Nama produk"
            className="p-2 rounded border text-black"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Harga"
            className="p-2 rounded border text-black"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL Gambar"
            className="p-2 rounded border text-black"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          />
          <button
            onClick={handleAddProduct}
            className="bg-white text-orange-600 font-bold px-4 py-2 rounded hover:bg-orange-100"
          >
            Tambah
          </button>
        </div>

        {/* Daftar Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />

              <div className="bg-purple-900 text-white p-4">
                {editProductId === product.id ? (
                  <>
                    <input
                      type="text"
                      className="w-full mb-2 p-1 rounded text-black"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Nama produk"
                    />
                    <input
                      type="text"
                      className="w-full mb-2 p-1 rounded text-black"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      placeholder="Harga"
                    />
                    <input
                      type="text"
                      className="w-full mb-2 p-1 rounded text-black"
                      value={editFormData.image}
                      onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                      placeholder="URL Gambar"
                    />
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => handleSaveEdit(product.id)}
                        className="bg-white text-purple-900 font-semibold px-3 py-1 rounded hover:bg-purple-100 text-sm"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="font-semibold text-lg">{product.name}</h2>
                    <p>{product.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                      <span className="text-sm">({product.reviews})</span>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="bg-white text-purple-900 font-semibold px-3 py-1 rounded hover:bg-purple-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <p className="text-black col-span-full text-center mt-10">Produk tidak ditemukan.</p>
          )}
        </div>

        <footer className="mt-6 text-center text-sm text-black">
          ©Rangga Store Copyright © 2023 - Developed by KSI ULAY. Powered by Moodle
        </footer>
      </div>
    </div>
  );
}
