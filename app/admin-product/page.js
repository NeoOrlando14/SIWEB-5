'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminProductPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) router.push('/login');
  }, [router]);

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath ? 'bg-white text-pink-600 scale-110' : 'hover:bg-pink-200 text-white'
    }`;

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [newProduct, setNewProduct] = useState({
    nama: '',
    harga: 0,
    image: '',
    rating: 5,
    reviews: 0,
  });
  const [editProductId, setEditProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nama: '',
    harga: 0,
    image: '',
    rating: 5,
    reviews: 0,
  });

  // Fetch data dari database (via API)
  const fetchProducts = async () => {
    const res = await fetch('/api/admin-product');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = async () => {
    const res = await fetch('/api/admin-product', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    });
    const result = await res.json();
    setProducts([...products, result]);
    setNewProduct({ nama: '', harga: 0, image: '', rating: 5, reviews: 0 });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    await fetch('/api/admin-product', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEditClick = (product) => {
    setEditProductId(product.id);
    setEditFormData({
      nama: product.nama,
      harga: product.harga,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
    });
  };

  const handleCancelEdit = () => setEditProductId(null);

  const handleSaveEdit = async (id) => {
    const res = await fetch('/api/admin-product', {
      method: 'PUT',
      body: JSON.stringify({ id, ...editFormData }),
    });

    const updated = await res.json();
    setProducts(products.map((p) => (p.id === id ? updated : p)));
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
        <button title="Stock" onClick={() => router.push('/admin-stock')} className={iconClasses('/admin-stock')}>🎁</button>
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
            value={newProduct.nama}
            onChange={(e) => setNewProduct({ ...newProduct, nama: e.target.value })}
          />
          <input
            type="number"
            placeholder="Harga"
            className="p-2 rounded border text-black"
            value={newProduct.harga}
            onChange={(e) => setNewProduct({ ...newProduct, harga: Number(e.target.value) })}
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
          {filteredProducts.map((product) => {
            const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));
            const reviews = product.reviews || 0;

            return (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <img src={product.image} alt={product.nama} className="w-full h-48 object-cover" />
                <div className="bg-purple-900 text-white p-4">
                  {editProductId === product.id ? (
                    <>
                      <input
                        type="text"
                        className="w-full mb-2 p-1 rounded text-black"
                        value={editFormData.nama}
                        onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                      />
                      <input
                        type="number"
                        className="w-full mb-2 p-1 rounded text-black"
                        value={editFormData.harga}
                        onChange={(e) => setEditFormData({ ...editFormData, harga: Number(e.target.value) })}
                      />
                      <input
                        type="text"
                        className="w-full mb-2 p-1 rounded text-black"
                        value={editFormData.image}
                        onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                      />
                      <div className="flex justify-between mt-2">
                        <button onClick={() => handleSaveEdit(product.id)} className="bg-white text-purple-900 font-semibold px-3 py-1 rounded hover:bg-purple-100 text-sm">Simpan</button>
                        <button onClick={handleCancelEdit} className="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:bg-red-600 text-sm">Batal</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-semibold text-lg">{product.nama}</h2>
                      <p>Rp {product.harga.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400">
                          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                        </span>
                        <span className="text-sm text-white">({reviews} review)</span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <button onClick={() => handleEditClick(product)} className="bg-white text-purple-900 font-semibold px-3 py-1 rounded hover:bg-purple-100 text-sm">Edit</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:bg-red-600 text-sm">Hapus</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <p className="text-black col-span-full text-center mt-10">Produk tidak ditemukan.</p>
          )}
        </div>

        <footer className="mt-6 text-center text-sm text-black">
          © Rangga Store 2023 - Developed by KSI ULAY. Powered by Neon
        </footer>
      </div>
    </div>
  );
}
