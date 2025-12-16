"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditTransaksi() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [data, setData] = useState(null);
  const [produkDetail, setProdukDetail] = useState(null);
  const [bulkTransactions, setBulkTransactions] = useState([]);

  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");

  // Load transaksi existing + produk detail
  useEffect(() => {
    if (!id) return;

    async function loadTransaction() {
      try {
        // Get transaction data
        const trxRes = await fetch(`/api/admin-transaksi/${id}`);
        const trx = await trxRes.json();

        // 🛡️ PROTEKSI: Redirect jika transaksi sudah diterima
        if (trx.status === 'diterima') {
          alert("Transaksi yang sudah diterima tidak bisa diubah!");
          router.push("/admin-transaksi");
          return;
        }

        setData(trx);
        setNama(trx.nama_pembeli);
        setStatus(trx.status || "pending");

        // Get product detail
        const produkRes = await fetch(`/api/products/${trx.produkId}`);
        const produk = await produkRes.json();
        setProdukDetail(produk);

        // If bulk payment, get all transactions in the same bulk
        if (trx.bulk_payment_id) {
          const allTrxRes = await fetch("/api/admin-transaksi");
          const allTrx = await allTrxRes.json();
          const bulk = allTrx.filter(t => t.bulk_payment_id === trx.bulk_payment_id);

          // Get product details for each transaction
          const bulkWithProducts = await Promise.all(
            bulk.map(async (t) => {
              const pRes = await fetch(`/api/products/${t.produkId}`);
              const p = await pRes.json();
              return { ...t, produk: p };
            })
          );
          setBulkTransactions(bulkWithProducts);
        }
      } catch (err) {
        console.error("Error loading transaction:", err);
        alert("Gagal memuat data transaksi");
      }
    }

    loadTransaction();
  }, [id, router]);

  // Konfirmasi kembali
  const handleBack = () => {
    if (confirm("Yakin ingin kembali?")) {
      router.back();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // If bulk order, update all transactions
    if (bulkTransactions.length > 0) {
      const res = await fetch("/api/admin-transaksi/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk_payment_id: data.bulk_payment_id,
          status
        })
      });

      if (res.ok) {
        alert("Semua transaksi dalam bulk order berhasil diubah!");
        router.push("/admin-transaksi");
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengubah transaksi");
      }
    } else {
      // Single transaction update
      const res = await fetch(`/api/admin-transaksi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produkId: data.produkId,
          nama_pembeli: nama,
          total_harga: data.total_harga,
          status,
          userId: data.userId,
          poin_dipakai: data.poin_dipakai || 0,
          diskon_poin: data.diskon_poin || 0,
          harga_akhir: data.harga_akhir,
          bulk_payment_id: data.bulk_payment_id,
        }),
      });

      if (res.ok) {
        alert("Transaksi berhasil diubah!");
        router.push("/admin-transaksi");
      } else {
        const error = await res.json();
        alert(error.error || "Gagal mengubah transaksi");
      }
    }
  }

  const formatRupiah = (angka) => `Rp ${angka.toLocaleString("id-ID")}`;

  // Group products by produkId and count quantity
  const getProductSummary = () => {
    if (bulkTransactions.length > 0) {
      // Bulk order: group by product
      const productMap = {};
      bulkTransactions.forEach(trx => {
        const key = trx.produkId;
        if (!productMap[key]) {
          productMap[key] = {
            produk: trx.produk,
            quantity: 0,
            totalHarga: 0,
            transactions: []
          };
        }
        productMap[key].quantity += 1;
        productMap[key].totalHarga += trx.total_harga;
        productMap[key].transactions.push(trx);
      });
      return Object.values(productMap);
    } else {
      // Single order
      return [{
        produk: produkDetail,
        quantity: 1,
        totalHarga: data.total_harga,
        transactions: [data]
      }];
    }
  };

  if (!data || !produkDetail)
    return <p className="p-10 text-white text-xl">Loading...</p>;

  const productSummary = getProductSummary();

  return (
    <div className="min-h-screen p-10 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]">

      {/* Tombol Kembali */}
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
      >
        ← Kembali
      </button>

      <h1 className="text-3xl font-bold mb-6">Edit Transaksi #{String(data.id).padStart(4, "0")}</h1>

      {/* LAYOUT SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT SIDE - FORM EDIT */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-[#1f1f1f] p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4">Informasi Transaksi</h2>

            {/* NAMA */}
            <div>
              <label className="block mb-2 text-gray-300">Nama Pembeli</label>
              <input
                className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 outline-none"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                readOnly
              />
            </div>

            {/* TOTAL HARGA - READONLY */}
            <div>
              <label className="block mb-2 text-gray-300">Total Harga</label>
              <div className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-gray-600 text-gray-300">
                {bulkTransactions.length > 0
                  ? formatRupiah(bulkTransactions.reduce((sum, t) => sum + t.total_harga, 0))
                  : formatRupiah(data.total_harga)
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {bulkTransactions.length > 0
                  ? `Total dari ${bulkTransactions.length} transaksi`
                  : 'Transaksi tunggal'
                }
              </p>
            </div>

            {/* STATUS */}
            <div>
              <label className="block mb-2 text-gray-300">Status</label>
              <select
                className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">⏳ Pending</option>
                <option value="diterima">✅ Diterima</option>
                <option value="ditolak">❌ Ditolak</option>
              </select>
            </div>

            {/* BULK PAYMENT INFO */}
            {data.bulk_payment_id && (
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-sm text-blue-300">
                  📦 Bulk Payment ID: <span className="font-mono text-xs">{data.bulk_payment_id}</span>
                </p>
                {data.poin_dipakai > 0 && (
                  <p className="text-sm text-blue-300 mt-1">
                    🎁 Poin digunakan: {data.poin_dipakai} poin (Diskon: {formatRupiah(data.diskon_poin)})
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Update Transaksi
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE - PRODUK DISPLAY */}
        <div>
          <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">
              Detail Produk ({bulkTransactions.length > 0 ? `${bulkTransactions.length} items` : '1 item'})
            </h2>

            <div className="space-y-4">
              {productSummary.map((item, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4 bg-[#2a2a2a]">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {item.produk.image && (
                      <img
                        src={item.produk.image}
                        alt={item.produk.nama}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.produk.nama}</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p className="flex justify-between">
                          <span className="text-gray-400">Harga per item:</span>
                          <span className="font-semibold">{formatRupiah(item.produk.harga)}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Jumlah dibeli:</span>
                          <span className="font-semibold text-blue-400">x{item.quantity}</span>
                        </p>
                        <div className="border-t border-gray-600 pt-1 mt-1">
                          <p className="flex justify-between">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="font-bold text-green-400">{formatRupiah(item.totalHarga)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Show transaction IDs if bulk */}
                      {item.quantity > 1 && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <p className="text-xs text-gray-400 mb-1">ID Transaksi:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.transactions.map(trx => (
                              <span
                                key={trx.id}
                                className={`text-xs px-2 py-1 rounded ${
                                  trx.id === data.id
                                    ? 'bg-blue-500 text-white font-semibold'
                                    : 'bg-gray-700 text-gray-300'
                                }`}
                              >
                                #{String(trx.id).padStart(4, "0")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Total */}
            {bulkTransactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Keseluruhan:</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatRupiah(bulkTransactions.reduce((sum, t) => sum + t.total_harga, 0))}
                  </span>
                </div>
                {data.poin_dipakai > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                      <span>Diskon Poin ({data.poin_dipakai} poin):</span>
                      <span className="text-red-400">- {formatRupiah(data.diskon_poin)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-gray-600">
                      <span>Harga Akhir:</span>
                      <span className="text-yellow-400">
                        {formatRupiah(bulkTransactions.reduce((sum, t) => sum + t.total_harga, 0) - data.diskon_poin)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
