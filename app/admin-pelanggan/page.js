"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Check, X } from "lucide-react";

export default function AdminPelanggan() {
  const router = useRouter();
  const pathname = usePathname();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ==== CEK LOGIN ====
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem("isLoggedIn");
    const role = window.localStorage.getItem("role");

    if (isLoggedIn !== "true" || role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  // Sidebar active style
  const iconClasses = (path) =>
    `text-xl p-2 rounded-lg transition-all duration-300 cursor-pointer ${
      pathname === path
        ? "bg-gray-100 text-black scale-110"
        : "hover:bg-gray-700 text-white"
    }`;

  // ==== LOAD DATA ====
  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();

      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
        console.warn("API returned invalid:", data);
      }
    } catch (err) {
      console.error(err);
      setCustomers([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==== UPDATE POIN ====
  async function updatePoin(id, amount) {
    await fetch("/api/customers/update-point", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, amount }),
    });
    fetchCustomers();
  }

  // ==== DELETE ====
  async function deleteCustomer(id) {
    if (!confirm("Hapus pelanggan ini?")) return;

    await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });

    fetchCustomers();
  }

  // ==== FILTER ====
  const filtered = Array.isArray(customers)
    ? customers.filter((c) =>
        c.nama.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // ==== LOGOUT ====
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex text-white">

      {/* ========== SIDEBAR ========== */}
      <div className="w-16 bg-[#1f1f1f] flex flex-col justify-between items-center py-4 border-r border-gray-700">

        <div className="flex flex-col items-center space-y-8">
          <span title="Menu" className="text-2xl text-gray-300">☰</span>

          <button onClick={() => router.push("/admin-dashboard")} className={iconClasses("/admin-dashboard")}>📊</button>
          <button onClick={() => router.push("/admin-product")} className={iconClasses("/admin-product")}>📦</button>
          <button onClick={() => router.push("/admin-transaksi")} className={iconClasses("/admin-transaksi")}>🧾</button>
          <button onClick={() => router.push("/admin-pelanggan")} className={iconClasses("/admin-pelanggan")}>👥</button>
          <button onClick={() => router.push("/admin-poin")} className={iconClasses("/admin-poin")}>🎁</button>
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

      {/* ========== MAIN PAGE ========== */}
      <div className="flex-1 p-8 bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a]">

        <h1 className="text-3xl font-bold mb-6">Daftar Pelanggan</h1>

        {/* SEARCH BAR */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search Customer..."
              className="bg-transparent outline-none text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="ml-2 text-gray-400" />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">

          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 text-left">ID</th>
                <th className="text-left">Nama</th>
                <th className="text-left">Telepon</th>
                <th className="text-left">Poin</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-gray-400">Tidak ada pelanggan</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                    <td className="py-3">{String(c.id).padStart(5, "0")}</td>
                    <td>{c.nama}</td>
                    <td>{c.telepon}</td>

                    {/* Poin */}
                    <td>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updatePoin(c.id, -1)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">-</button>
                        <span className="px-4 py-1 bg-gray-800 rounded">{c.poin}</span>
                        <button onClick={() => updatePoin(c.id, +1)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">+</button>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td>
                      <div className="flex items-center space-x-5 text-xl">
                        <X className="text-red-500 hover:text-red-400 cursor-pointer" onClick={() => deleteCustomer(c.id)} />
                        <Check className="text-green-400 hover:text-green-300 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* BOTTOM BUTTONS */}
          <div className="flex justify-between mt-6">

            {/* ===== FIXED BUTTON TAMBAH ===== */}
            <button
              onClick={() => router.push("/admin-pelanggan/add")}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              ➕ Tambah
            </button>

            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">
              Berikutnya
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
