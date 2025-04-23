'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch data produk berdasarkan ID (simulasi)
    const fetchedProduct = {
      id,
      name: 'Produk Contoh',
      price: 'Rp.5.000',
      image: 'bearcake.png',
    };

    setProduct(fetchedProduct);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulasi penyimpanan perubahan (bisa tambahkan logic backend nanti)
    console.log('Perubahan disimpan');

    // Redirect ke halaman admin-product
    router.push('/admin-product');
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-700 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-4">Edit Produk ID: {id}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg max-w-md">
        <label className="block mb-4">
          Nama Produk:
          <input
            type="text"
            defaultValue={product.name}
            className="block w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          Harga:
          <input
            type="text"
            defaultValue={product.price}
            className="block w-full mt-1 p-2 border rounded"
          />
        </label>

        <button
          type="submit"
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
