"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [image, setImage] = useState(""); // Base64 string
  const [imagePreview, setImagePreview] = useState(""); // Preview URL

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!image) {
      alert("Gambar produk wajib diupload!");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        harga: Number(harga),
        stok: Number(stok),
        image: image, // Base64 string
      }),
    });

    if (!res.ok) {
      alert("Gagal menambahkan produk");
      return;
    }

    router.push("/admin-product");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center
      bg-gradient-to-br from-[#0d0d0d] via-[#171717] to-[#2b2b2b] text-white px-6">

      <div className="w-full max-w-xl bg-gradient-to-br from-[#141414] to-[#222222]
        border border-gray-700 rounded-xl shadow-xl shadow-black/40 p-8">

        <h1 className="text-3xl font-bold mb-6 text-center">Tambah Produk</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nama Produk */}
          <div>
            <label className="block mb-1 text-gray-300">Nama Produk</label>
            <input
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white 
                border border-gray-700 focus:border-gray-500 
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block mb-1 text-gray-300">Harga</label>
            <input
              required
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white 
                border border-gray-700 focus:border-gray-500 
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="block mb-1 text-gray-300">Stok</label>
            <input
              required
              type="number"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1b1b1b] text-white
                border border-gray-700 focus:border-gray-500
                focus:ring-1 focus:ring-gray-400 outline-none"
            />
          </div>

          {/* Gambar Produk */}
          <div>
            <label className="block mb-1 text-gray-300">Gambar Produk</label>

            {/* Upload Button */}
            <div className="mb-3">
              <label className="flex items-center justify-center w-full px-4 py-3 rounded-lg
                bg-[#1b1b1b] border-2 border-dashed border-gray-600
                hover:border-gray-500 cursor-pointer transition">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage("");
                    setImagePreview("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white
                    rounded-full p-2 shadow-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Tombol */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.push("/admin-product")}
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#3b3b3b] to-[#101010]
                hover:from-[#505050] hover:to-[#1a1a1a] transition border border-gray-700 shadow-md"
            >
              Kembali
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-green-600 to-green-700
                hover:from-green-700 hover:to-green-800 transition shadow-md font-bold"
            >
              Simpan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
