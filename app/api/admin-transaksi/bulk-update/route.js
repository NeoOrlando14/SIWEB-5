import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Bulk update status for all transactions with the same bulk_payment_id
export async function POST(req) {
  try {
    const { bulk_payment_id, status } = await req.json();

    if (!bulk_payment_id) {
      return Response.json(
        { error: "bulk_payment_id is required" },
        { status: 400 }
      );
    }

    // Get all transactions in this bulk
    const transactions = await prisma.transaksi.findMany({
      where: { bulk_payment_id },
      include: { produk: true }
    });

    if (transactions.length === 0) {
      return Response.json(
        { error: "No transactions found with this bulk_payment_id" },
        { status: 404 }
      );
    }

    // Check if any transaction is already accepted
    const hasAccepted = transactions.some(t => t.status === 'diterima');
    if (hasAccepted && status !== 'diterima') {
      return Response.json(
        { error: "Bulk order sudah diterima, tidak bisa diubah" },
        { status: 403 }
      );
    }

    const results = [];

    // Process each transaction
    for (const trx of transactions) {
      // Skip if already accepted
      if (trx.status === 'diterima' && status !== 'diterima') {
        continue;
      }

      // Update transaction status
      const updated = await prisma.transaksi.update({
        where: { id: trx.id },
        data: { status }
      });

      results.push(updated);

      // If status is "diterima", handle stock, history, and points
      if (status === 'diterima' && trx.status !== 'diterima') {
        // 📦 STOCK DEDUCTION & SAVE HISTORY
        try {
          const produk = await prisma.produk.findUnique({
            where: { id: trx.produkId }
          });

          if (produk) {
            // Save to RiwayatPemesanan
            await prisma.riwayatPemesanan.create({
              data: {
                transaksiId: trx.id,
                userId: trx.userId,
                nama_pembeli: trx.nama_pembeli,
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
            console.log(`📋 Riwayat saved: ${produk.nama} for ${trx.nama_pembeli}`);

            // Decrease stock
            if (produk.stok > 0) {
              await prisma.produk.update({
                where: { id: trx.produkId },
                data: { stok: produk.stok - 1 }
              });
              console.log(`📦 Stok #${trx.produkId}: ${produk.stok} → ${produk.stok - 1}`);
            }
          }
        } catch (stockError) {
          console.error('Error updating stock/history:', stockError.message);
        }
      }
    }

    // Handle points only ONCE per bulk (for the first transaction)
    if (status === 'diterima') {
      const firstTrx = transactions[0];

      // Check if points already deducted
      const alreadyDeducted = transactions.some(t => t.poin_deducted);

      if (!alreadyDeducted && firstTrx.userId) {
        try {
          const user = await prisma.users.findUnique({
            where: { id: firstTrx.userId },
            select: {
              id: true,
              role: true,
              poin: true
            }
          });

          if (user && user.role === 'customer') {

            // Calculate total transaction value
            const totalHarga = transactions.reduce((sum, t) => sum + (t.harga_akhir || t.total_harga), 0);

            // 🎁 BONUS POINTS: >= Rp 50,000 gets +2 points (base +1, bonus +1)
            const BONUS_THRESHOLD = 50000;
            let basePoin = 1;
            let bonusPoin = totalHarga >= BONUS_THRESHOLD ? 1 : 0;
            let totalReward = basePoin + bonusPoin;

            // Calculate net point change
            let poinChange = totalReward - (firstTrx.poin_dipakai || 0);

            // Update user points
            await prisma.users.update({
              where: { id: firstTrx.userId },
              data: { poin: { increment: poinChange } }
            });

            // Mark all transactions as deducted
            await prisma.transaksi.updateMany({
              where: { bulk_payment_id },
              data: { poin_deducted: true }
            });

            console.log(`✅ Bulk ${bulk_payment_id}:`);
            console.log(`   - Total harga: Rp ${totalHarga.toLocaleString()}`);
            console.log(`   - Poin dipakai: ${firstTrx.poin_dipakai || 0}`);
            console.log(`   - Poin reward: +${totalReward} (base: ${basePoin}, bonus: ${bonusPoin})`);
            console.log(`   - Net change: ${poinChange > 0 ? '+' : ''}${poinChange}`);
          }
        } catch (poinError) {
          console.error('Error updating points:', poinError.message);
        }
      }
    }

    return Response.json({
      success: true,
      updated: results.length,
      transactions: results
    });

  } catch (err) {
    console.error('Bulk update error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
