"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransaksiSaya() {
  const [data, setData] = useState([]);
  const [produk, setProduk] = useState([]);
  const [popup, setPopup] = useState(null); // transaksi yang ingin dibayar
  const [successPopup, setSuccessPopup] = useState(false);
  const router = useRouter();

  // ================= LOAD DATA =================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const email = window.localStorage.getItem("email");
    if (!email) {
      router.push("/login");
      return;
    }

    const nama = email.split("@")[0];

    const load = async () => {
      const p = await fetch("/api/products").then((r) => r.json());
      setProduk(p);

      const trx = await fetch("/api/admin-transaksi").then((r) => r.json());

      const filtered = trx.filter(
        (t) => t.nama_pembeli.toLowerCase() === nama.toLowerCase()
      );

      setData(filtered);
    };

    load();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id) => {
    await fetch(`/api/admin-transaksi/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "diterima" }),
    });

    setPopup(null);
    setSuccessPopup(true);

    // reload data
    const name = window.localStorage.getItem("email")?.split("@")[0];
    const trx = await fetch("/api/admin-transaksi").then((r) => r.json());

    setData(trx.filter((t) => t.nama_pembeli.toLowerCase() === name.toLowerCase()));
  };

  const formatTanggal = (date) => {
    const t = new Date(date);
    return t.toLocaleDateString("id-ID");
  };

  const getProductImage = (id) => {
    const p = produk.find((x) => x.id === id);
    return p?.image || "/placeholder.png";
  };

  const getProductName = (id) => {
    const p = produk.find((x) => x.id === id);
    return p?.nama || "Produk";
  };

  return (
    <div className="min-h-screen p-8 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a]">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/home")}
        className="mb-6 bg-[#ffcf80] text-black font-semibold px-4 py-2 rounded-lg"
      >
        ⬅ Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6 text-[#ffcf80]">Transaksi Saya</h1>

      {/* TABLE */}
      <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th>Produk</th>
              <th>Tanggal</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((t) => (
              <tr className="border-b border-gray-800" key={t.id}>
                <td className="py-3 flex items-center gap-3">
                  <img
                    src={getProductImage(t.produkId)}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                  />
                  <span className="font-semibold">{getProductName(t.produkId)}</span>
                </td>

                <td>{formatTanggal(t.tanggal)}</td>
                <td>Rp {t.total_harga.toLocaleString()}</td>

                {/* STATUS */}
                <td className="font-bold">
                  {t.status === "pending" && (
                    <span className="text-yellow-400">⟳ Pending</span>
                  )}
                  {t.status === "diterima" && (
                    <span className="text-green-400">✔ Diterima</span>
                  )}
                  {t.status === "ditolak" && (
                    <span className="text-red-500">✘ Ditolak</span>
                  )}
                </td>

                {/* BUTTON BAYAR */}
                <td>
                  {t.status === "pending" && (
                    <button
                      onClick={() => setPopup(t)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= POPUP QRIS ================= */}
      {popup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4">
          <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 max-w-sm w-full shadow-xl animate-fadeIn">

            <h2 className="text-xl font-bold mb-4 text-[#ffcf80]">
              Pembayaran QRIS
            </h2>

            <p className="text-gray-300 mb-3">Scan dan lakukan pembayaran:</p>

            <img
              src="/qris-demo.png"
              alt="QRIS"
              className="w-full rounded-lg border border-gray-600 mb-4"
            />

            <p className="text-gray-300 mb-4 text-sm">
              Total yang harus dibayar:
              <br />
              <span className="text-[#ffcf80] text-xl font-bold">
                Rp {popup.total_harga.toLocaleString()}
              </span>
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => setPopup(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={() => updateStatus(popup.id)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
              >
                Saya sudah bayar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============= SUCCESS POPUP ============= */}
      {successPopup && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#1f1f1f] p-8 rounded-xl border border-green-600 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-green-400 mb-3">
              Pembayaran Berhasil!
            </h2>
            <p className="text-gray-300">Terima kasih sudah bertransaksi di Sebelah Kopi ☕</p>

            <button
              onClick={() => setSuccessPopup(false)}
              className="mt-5 px-5 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
