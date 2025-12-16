"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransaksiSaya() {
  const [cartItems, setCartItems] = useState([]); // Cart from localStorage
  const [transactions, setTransactions] = useState([]); // Transactions from database
  const [userPoin, setUserPoin] = useState(0);
  const [selectedCart, setSelectedCart] = useState([]);
  const [bulkPaymentPopup, setBulkPaymentPopup] = useState(false);

  // Redeem poin states
  const [usePoin, setUsePoin] = useState(false);
  const [poinToUse, setPoinToUse] = useState(0);
  const [diskonPoin, setDiskonPoin] = useState(0);

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
      // Load cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);

      // Load transactions from database
      const trx = await fetch("/api/admin-transaksi").then((r) => r.json());
      const filtered = trx.filter(
        (t) => t.nama_pembeli.toLowerCase() === nama.toLowerCase()
      );
      setTransactions(filtered);

      // Load user poin
      const poinRes = await fetch(`/api/user-poin?email=${encodeURIComponent(email)}`);
      const poinData = await poinRes.json();
      if (poinData.ok) {
        setUserPoin(poinData.poin);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= CART FUNCTIONS =================
  const toggleSelectItem = (id) => {
    if (selectedCart.includes(id)) {
      setSelectedCart(selectedCart.filter((item) => item !== id));
    } else {
      setSelectedCart([...selectedCart, id]);
    }
  };

  const selectAllCart = () => {
    const allIds = cartItems.map((item) => item.id);
    setSelectedCart(allIds);
  };

  const clearCart = () => {
    setSelectedCart([]);
  };

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    setSelectedCart(selectedCart.filter(itemId => itemId !== id));
  };

  const getTotalCart = () => {
    return cartItems
      .filter((item) => selectedCart.includes(item.id))
      .reduce((sum, item) => sum + item.harga, 0);
  };

  // ================= REDEEM POIN CALCULATION =================
  const calculateDiskon = (poin) => {
    if (poin < 1000) return 0;
    return poin * 1; // 1 poin = Rp 1
  };

  const handlePoinChange = (value) => {
    const poin = parseInt(value) || 0;

    if (poin < 0) {
      setPoinToUse(0);
      setDiskonPoin(0);
      return;
    }

    if (poin > userPoin) {
      alert(`Poin tidak cukup. Anda hanya memiliki ${userPoin} poin`);
      return;
    }

    setPoinToUse(poin);
    setDiskonPoin(calculateDiskon(poin));
  };

  const getMaxUsablePoin = (totalHarga) => {
    const maxFromPrice = Math.floor(totalHarga / 1);
    return Math.min(userPoin, maxFromPrice);
  };

  // ================= CHECKOUT & CREATE TRANSACTIONS =================
  const handleCheckout = async () => {
    if (selectedCart.length === 0) {
      alert("Pilih minimal 1 item untuk dibayar!");
      return;
    }

    setBulkPaymentPopup(true);
  };

  const confirmPayment = async () => {
    const selectedItems = cartItems.filter(item => selectedCart.includes(item.id));

    if (selectedItems.length === 0) {
      alert("Tidak ada item yang dipilih!");
      return;
    }

    try {
      // Generate unique bulk_payment_id if there are multiple items
      const bulkPaymentId = selectedItems.length > 1
        ? `BULK-${Date.now()}`
        : null;

      // Create transactions in database
      const createdTransactions = [];

      for (const item of selectedItems) {
        const payload = {
          nama_pembeli: item.nama_pembeli,
          produkId: item.produkId,
          total_harga: item.harga,
          status: "pending",
          tanggal: new Date().toISOString(),
          userId: item.userId,
          bulk_payment_id: bulkPaymentId,
        };

        const res = await fetch("/api/admin-transaksi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const trx = await res.json();
          createdTransactions.push(trx);
        }
      }

      // Apply poin discount if used
      if (usePoin && poinToUse >= 1000 && createdTransactions.length > 0) {
        const transactionIds = createdTransactions.map(t => t.id);

        await fetch('/api/apply-poin-discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionIds,
            poinDipakai: poinToUse,
            diskonPoin: diskonPoin
          })
        });
        console.log(`💰 Applied ${poinToUse} poin discount to ${transactionIds.length} transaction(s)`);
      }

      // Remove selected items from cart
      const remainingCart = cartItems.filter(item => !selectedCart.includes(item.id));
      setCartItems(remainingCart);
      localStorage.setItem('cart', JSON.stringify(remainingCart));

      // Clear selection
      setSelectedCart([]);
      setBulkPaymentPopup(false);

      // Reset poin states
      setUsePoin(false);
      setPoinToUse(0);
      setDiskonPoin(0);

      // Reload transactions
      const email = window.localStorage.getItem("email");
      const nama = email.split("@")[0];
      const trx = await fetch("/api/admin-transaksi").then((r) => r.json());
      const filtered = trx.filter(
        (t) => t.nama_pembeli.toLowerCase() === nama.toLowerCase()
      );
      setTransactions(filtered);

      alert(`✅ ${createdTransactions.length} transaksi berhasil dibuat dan menunggu verifikasi admin!`);

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Gagal membuat transaksi: " + err.message);
    }
  };

  const formatTanggal = (date) => {
    const t = new Date(date);
    return t.toLocaleDateString("id-ID");
  };

  // Pisahkan transaksi berdasarkan status
  const pendingTransactions = transactions.filter((t) => t.status === "pending");
  const historyTransactions = transactions.filter((t) => t.status !== "pending").sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="min-h-screen p-8 text-white bg-gradient-to-br from-[#1a1a1a] via-[#2b2b2b] to-[#3a3a3a]">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/home")}
        className="mb-6 bg-[#ffcf80] text-black font-semibold px-4 py-2 rounded-lg"
      >
        ⬅ Kembali
      </button>

      {/* HEADER WITH POIN */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#ffcf80]">Keranjang & Transaksi Saya</h1>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-xs text-white/80">Poin Anda</p>
              <p className="text-2xl font-bold text-white">{userPoin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== KERANJANG BELANJA (CART) ==================== */}
      <div className="bg-[#1f1f1f] p-6 rounded-xl border border-orange-500 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-400">🛒 Keranjang Belanja</h2>

          {cartItems.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={selectAllCart}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                Pilih Semua
              </button>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                Batal Pilih
              </button>
              <button
                onClick={handleCheckout}
                disabled={selectedCart.length === 0}
                className={`px-6 py-2 rounded-lg text-sm font-bold ${
                  selectedCart.length === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                💳 Bayar ({selectedCart.length || 0})
              </button>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">🛍️</p>
            <p>Keranjang kosong - Belum ada produk yang ditambahkan</p>
            <button
              onClick={() => router.push('/shop')}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCart.length === cartItems.length && cartItems.length > 0}
                      onChange={(e) => e.target.checked ? selectAllCart() : clearCart()}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </th>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr className="border-b border-gray-800" key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCart.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 flex items-center gap-3">
                      <img
                        src={item.image}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                        alt={item.nama_produk}
                      />
                      <span className="font-semibold">{item.nama_produk}</span>
                    </td>

                    <td>Rp {item.harga.toLocaleString()}</td>

                    <td>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 font-bold"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* CART FOOTER */}
            {selectedCart.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">
                    {selectedCart.length} item dipilih
                  </p>
                  <p className="text-2xl font-bold text-white">
                    Total: Rp {getTotalCart().toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold shadow-lg"
                >
                  💳 Lanjut Pembayaran ({selectedCart.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== TRANSAKSI PENDING ==================== */}
      {pendingTransactions.length > 0 && (
        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-yellow-500 shadow mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">⏳ Menunggu Verifikasi Admin</h2>
          <p className="text-gray-400 text-sm mb-4">
            Transaksi di bawah sudah dibayar dan menunggu persetujuan admin
          </p>

          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th>ID</th>
                <th>Produk</th>
                <th>Tanggal</th>
                <th>Harga</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pendingTransactions.map((t) => (
                <tr className="border-b border-gray-800" key={t.id}>
                  <td className="py-3">#{t.id}</td>
                  <td className="font-semibold">{t.produk?.nama || 'Produk'}</td>
                  <td>{formatTanggal(t.tanggal)}</td>
                  <td>Rp {t.total_harga.toLocaleString()}</td>
                  <td className="font-bold">
                    <span className="text-yellow-400">⟳ Pending</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== RIWAYAT PEMESANAN ==================== */}
      <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 shadow">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">📜 Riwayat Pemesanan</h2>

        {historyTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>Belum ada riwayat pemesanan</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th>ID</th>
                <th>Produk</th>
                <th>Tanggal</th>
                <th>Harga</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {historyTransactions.map((t) => (
                <tr className="border-b border-gray-800" key={t.id}>
                  <td className="py-3">#{t.id}</td>
                  <td className="font-semibold">{t.produk?.nama || 'Produk'}</td>
                  <td>{formatTanggal(t.tanggal)}</td>
                  <td>Rp {t.total_harga.toLocaleString()}</td>

                  <td className="font-bold">
                    {t.status === "diterima" && (
                      <span className="text-green-400">✔ Diterima</span>
                    )}
                    {t.status === "ditolak" && (
                      <span className="text-red-500">✘ Ditolak</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= POPUP BULK PAYMENT ================= */}
      {bulkPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
          <div className="bg-[#1f1f1f] p-6 rounded-xl border border-gray-700 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              💳 Pembayaran ({selectedCart.length} item)
            </h2>

            {/* Total Harga */}
            <div className="bg-[#2a2a2a] p-4 rounded-lg mb-3">
              <p className="text-gray-400 text-sm mb-2">{selectedCart.length} transaksi dipilih</p>
              <p className="text-gray-300 text-sm mb-1">Total Harga:</p>
              <p className="text-white text-2xl font-bold">
                Rp {getTotalCart().toLocaleString()}
              </p>
            </div>

            {/* Redeem Poin Section */}
            {userPoin >= 1000 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="usePoinBulk"
                    checked={usePoin}
                    onChange={(e) => {
                      setUsePoin(e.target.checked);
                      if (!e.target.checked) {
                        setPoinToUse(0);
                        setDiskonPoin(0);
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="usePoinBulk" className="text-yellow-400 text-sm font-semibold cursor-pointer">
                    🎁 Gunakan Poin untuk Diskon
                  </label>
                </div>

                {usePoin && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                    <p className="text-gray-300 text-xs mb-2">
                      Poin tersedia: <span className="font-bold text-yellow-400">{userPoin}</span>
                    </p>
                    <p className="text-gray-400 text-xs mb-2">
                      Minimal 1000 poin (1000 poin = Rp 1.000)
                    </p>

                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1000"
                        max={getMaxUsablePoin(getTotalCart())}
                        step="100"
                        value={poinToUse || ''}
                        onChange={(e) => handlePoinChange(e.target.value)}
                        placeholder="Min. 1000"
                        className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={() => handlePoinChange(getMaxUsablePoin(getTotalCart()))}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-xs font-bold"
                      >
                        Max
                      </button>
                    </div>

                    {poinToUse >= 1000 && (
                      <div className="mt-2 p-2 bg-green-500/20 border border-green-500/40 rounded">
                        <p className="text-green-300 text-xs font-bold">
                          Diskon: - Rp {diskonPoin.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {poinToUse > 0 && poinToUse < 1000 && (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ Minimal 1000 poin untuk mendapat diskon
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Total Bayar Setelah Diskon */}
            {usePoin && poinToUse >= 1000 && (
              <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg mb-3">
                <p className="text-gray-300 text-sm mb-1">Total Bayar:</p>
                <p className="text-green-400 text-3xl font-bold">
                  Rp {(getTotalCart() - diskonPoin).toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Hemat Rp {diskonPoin.toLocaleString()} dari {poinToUse.toLocaleString()} poin
                </p>
              </div>
            )}

            <p className="text-gray-400 text-xs mb-3">
              Scan QR Code di bawah untuk melakukan pembayaran:
            </p>

            <img
              src="/qris-demo.png"
              alt="QRIS"
              className="w-full rounded-lg border border-gray-600 mb-3"
            />

            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg mb-4">
              <p className="text-blue-300 text-xs">
                ℹ️ Setelah pembayaran selesai, transaksi akan dibuat dan menunggu verifikasi admin. Poin akan otomatis bertambah setelah admin menyetujui.
              </p>
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setBulkPaymentPopup(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold"
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
