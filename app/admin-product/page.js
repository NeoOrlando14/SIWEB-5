"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Edit3, Trash2, Search } from "lucide-react";

export default function AdminProductPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const iconClasses = (targetPath) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === targetPath
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  // ===================== FETCH PRODUCTS =====================
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error("Error fetch:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===================== UPDATE STOK =====================
  async function updateStok(id, amount) {
    try {
      await fetch("/api/products/update-stok", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount }),
      });
      fetchProducts();
    } catch (e) {
      console.error("Update stok error:", e);
    }
  }

  // ===================== DELETE PRODUCT =====================
  async function deleteProduct(id) {
    if (!confirm("Yakin ingin menghapus produk?")) return;

    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (e) {
      console.error("Delete error:", e);
    }
  }

  const filtered = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  // ===================== LOGOUT (AMANKAN localStorage) =====================
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* ---------------- SIDEBAR ---------------- */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">
        <div className="flex flex-col items-center space-y-8">
          <span title="Menu" className="text-2xl text-gray-300">
            ☰
          </span>

          <button
            title="Dashboard"
            onClick={() => router.push("/admin-dashboard")}
            className={iconClasses("/admin-dashboard")}
          >
            📊
          </button>
          <button
            title="Products"
            onClick={() => router.push("/admin-product")}
            className={iconClasses("/admin-product")}
          >
            📦
          </button>
          <button
            title="Users"
            onClick={() => router.push("/admin-qcontact")}
            className={iconClasses("/admin-qcontact")}
          >
            👤
          </button>
          <button
            title="Transactions"
            onClick={() => router.push("/admin-transaksi")}
            className={iconClasses("/admin-transaksi")}
          >
            🧾
          </button>
          <button
            title="pelanggan"
            onClick={() => router.push("/admin-pelanggan")}
            className={iconClasses("/admin-pelanggan")}
          >
            👥
          </button>
          <button
            onClick={() => router.push("/admin-poin")}
            className={iconClasses("/admin-poin")}
          >
            🎁
          </button>
        </div>

        <div className="mb-2">
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            🚪
          </button>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#3e3e3e] p-8">
        <h1 className="text-3xl font-bold mb-6">Daftar Produk</h1>

        {/* SEARCH BAR */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search product..."
              className="bg-transparent outline-none text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="ml-2 text-gray-400" />
          </div>
        </div>

        {/* TOMBOL TAMBAH */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/admin-product/add")}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold shadow-md"
          >
            ➕ Tambah Produk
          </button>
        </div>

        {/* TABEL */}
        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 text-left">ID Produk</th>
                <th className="text-left">Nama Produk</th>
                <th className="text-left">Harga</th>
                <th className="text-left">Stok</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">
                    Produk tidak ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-700 hover:bg-[#2a2a2a] transition"
                  >
                    <td className="py-3">{p.id}</td>
                    <td>{p.nama}</td>
                    <td>Rp {p.harga.toLocaleString("id-ID")}</td>

                    <td>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateStok(p.id, -1)}
                          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-gray-800 rounded">
                          {p.stok}
                        </span>
                        <button
                          onClick={() => updateStok(p.id, +1)}
                          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center space-x-4">
                        <Edit3
                          onClick={() => router.push(`/admin-product/edit/${p.id}`)}
                          className="cursor-pointer text-blue-400 hover:text-blue-300"
                        />
                        <Trash2
                          onClick={() => deleteProduct(p.id)}
                          className="cursor-pointer text-red-500 hover:text-red-400"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
