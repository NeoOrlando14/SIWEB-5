import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET detail
export async function GET(_, { params }) {
  try {
    const trx = await prisma.transaksi.findUnique({
      where: { id: Number(params.id) },
    });

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE transaksi
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const transactionId = Number(params.id);

    // Ambil data transaksi lama untuk cek perubahan status
    const oldTransaction = await prisma.transaksi.findUnique({
      where: { id: transactionId }
    });

    // 🛡️ PROTEKSI: Tidak bisa edit transaksi yang sudah diterima
    if (oldTransaction.status === 'diterima') {
      return Response.json(
        { error: "Transaksi yang sudah diterima tidak bisa diubah" },
        { status: 403 }
      );
    }

    // Update transaksi (dengan tracking poin yang dipakai)
    const trx = await prisma.transaksi.update({
      where: { id: transactionId },
      data: {
        produkId: Number(body.produkId),
        nama_pembeli: body.nama_pembeli,
        total_harga: Number(body.total_harga),
        poin_dipakai: Number(body.poin_dipakai) || oldTransaction.poin_dipakai || 0,
        diskon_poin: Number(body.diskon_poin) || oldTransaction.diskon_poin || 0,
        harga_akhir: body.harga_akhir ? Number(body.harga_akhir) : (oldTransaction.harga_akhir || Number(body.total_harga)),
        status: body.status,
        userId: body.userId || oldTransaction.userId,
      },
    });

    // 🎯 SISTEM POIN & STOK & RIWAYAT: Jika status berubah menjadi "diterima"
    if (body.status === 'diterima' && oldTransaction.status !== 'diterima') {
      // 📦 PENGURANGAN STOK PRODUK & SIMPAN RIWAYAT
      try {
        const produk = await prisma.produk.findUnique({
          where: { id: Number(body.produkId) }
        });

        if (produk) {
          // Save to RiwayatPemesanan (permanent history)
          await prisma.riwayatPemesanan.create({
            data: {
              transaksiId: transactionId,
              userId: trx.userId,
              nama_pembeli: body.nama_pembeli,
              nama_produk: produk.nama,
              harga_produk: produk.harga,
              jumlah: 1,
              total_harga: trx.total_harga,
              poin_dipakai: trx.poin_dipakai,
              diskon_poin: trx.diskon_poin,
              harga_akhir: trx.harga_akhir,
              bulk_payment_id: trx.bulk_payment_id,
              status: 'diterima',
              tanggal: trx.tanggal,
            }
          });
          console.log(`📋 Riwayat pemesanan saved: ${produk.nama} for ${body.nama_pembeli}`);

          // Decrease stock
          if (produk.stok > 0) {
            await prisma.produk.update({
              where: { id: Number(body.produkId) },
              data: { stok: produk.stok - 1 }
            });
            console.log(`📦 Stok produk #${body.produkId} berkurang: ${produk.stok} → ${produk.stok - 1}`);
          } else {
            console.warn(`⚠️ Stok produk #${body.produkId} sudah habis (0)`);
          }
        }
      } catch (stockError) {
        console.error('Error updating stok/riwayat:', stockError.message);
        // Tidak throw error, biar transaksi tetap update meskipun stok gagal
      }

      // Cari user berdasarkan email dari nama_pembeli
      const email = `${body.nama_pembeli.toLowerCase()}@gmail.com`;

      try {
        const user = await prisma.users.findUnique({
          where: { email: email },
          select: {
            id: true,
            role: true,
            poin: true
          }
        });

        if (user) {

          // Hanya untuk customer
          if (user.role === 'customer') {
            // 🎁 BONUS POIN: Transaksi >= Rp 50.000 dapat +2 poin (base +1, bonus +1)
            const BONUS_THRESHOLD = 50000;
            const hargaFinal = trx.harga_akhir || trx.total_harga;

            let basePoin = 1; // Poin dasar per transaksi
            let bonusPoin = 0; // Bonus poin untuk transaksi besar

            if (hargaFinal >= BONUS_THRESHOLD) {
              bonusPoin = 1; // +1 bonus untuk transaksi >= Rp 50.000
            }

            let totalReward = basePoin + bonusPoin; // Total poin reward
            let poinChange = totalReward; // Default: reward saja

            // 🛡️ CRITICAL FIX: Prevent double deduction in bulk payments
            let shouldDeductPoin = false;

            if (trx.poin_dipakai > 0) {
              // Check if this is part of a bulk payment
              if (trx.bulk_payment_id) {
                console.log(`📦 Bulk payment detected: ${trx.bulk_payment_id}`);

                // Check if ANY transaction in this bulk has already been deducted
                const bulkTransactions = await prisma.transaksi.findMany({
                  where: { bulk_payment_id: trx.bulk_payment_id }
                });

                const alreadyDeducted = bulkTransactions.some(t => t.poin_deducted);

                if (alreadyDeducted) {
                  console.log(`⚠️ Poin already deducted for bulk ${trx.bulk_payment_id}, skipping deduction`);
                  poinChange = totalReward; // Only add reward, no deduction
                } else {
                  console.log(`✅ First transaction in bulk ${trx.bulk_payment_id}, will deduct poin`);
                  shouldDeductPoin = true;
                  poinChange = totalReward - trx.poin_dipakai;

                  // Mark ALL transactions in this bulk as deducted
                  await prisma.transaksi.updateMany({
                    where: { bulk_payment_id: trx.bulk_payment_id },
                    data: { poin_deducted: true }
                  });
                }
              } else {
                // Single transaction (no bulk_payment_id)
                console.log(`📦 Single transaction, normal deduction`);
                shouldDeductPoin = true;
                poinChange = totalReward - trx.poin_dipakai;

                // Mark this transaction as deducted
                await prisma.transaksi.update({
                  where: { id: transactionId },
                  data: { poin_deducted: true }
                });
              }

              console.log(`✅ Transaksi #${transactionId}:`);
              console.log(`   - Bulk ID: ${trx.bulk_payment_id || 'none (single)'}`);
              console.log(`   - Total harga: Rp ${trx.total_harga.toLocaleString()}`);
              console.log(`   - Harga final: Rp ${hargaFinal.toLocaleString()}`);
              console.log(`   - Poin dipakai: ${trx.poin_dipakai}`);
              console.log(`   - Diskon: Rp ${trx.diskon_poin.toLocaleString()}`);
              console.log(`   - Poin base: +${basePoin}`);
              console.log(`   - Poin bonus: +${bonusPoin} ${bonusPoin > 0 ? '(>= Rp 50.000)' : ''}`);
              console.log(`   - Total reward: +${totalReward}`);
              console.log(`   - Deduct poin: ${shouldDeductPoin ? 'YES' : 'NO (already deducted)'}`);
              console.log(`   - Net poin change: ${poinChange > 0 ? '+' : ''}${poinChange}`);
            } else if (bonusPoin > 0) {
              console.log(`✅ Transaksi #${transactionId}:`);
              console.log(`   - Harga: Rp ${hargaFinal.toLocaleString()}`);
              console.log(`   - Poin base: +${basePoin}`);
              console.log(`   - Poin bonus: +${bonusPoin} (>= Rp 50.000)`);
              console.log(`   - Total reward: +${totalReward}`);
            }

            await prisma.users.update({
              where: { id: user.id },
              data: { poin: { increment: poinChange } }
            });

            const action = poinChange > 0 ? `+${poinChange}` : poinChange;
            console.log(`✅ Poin ${action} untuk user ${email} (transaksi #${transactionId})`);
          }
        }
      } catch (poinError) {
        console.error('Error updating poin:', poinError.message);
        // Tidak throw error, biar transaksi tetap update meskipun poin gagal
      }
    }

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE transaksi
export async function DELETE(_, { params }) {
  try {
    const transactionId = Number(params.id);

    // Cek status transaksi sebelum menghapus
    const transaction = await prisma.transaksi.findUnique({
      where: { id: transactionId }
    });

    // 🛡️ PROTEKSI: Tidak bisa delete transaksi yang sudah diterima
    if (transaction && transaction.status === 'diterima') {
      return Response.json(
        { error: "Transaksi yang sudah diterima tidak bisa dihapus" },
        { status: 403 }
      );
    }

    await prisma.transaksi.delete({
      where: { id: transactionId },
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
