import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Apply poin discount to transaction(s)
 * Customer calls this when closing payment popup with poin applied
 */
export async function POST(req) {
  try {
    const { transactionIds, poinDipakai, diskonPoin } = await req.json();

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return Response.json(
        { ok: false, message: "Transaction IDs required" },
        { status: 400 }
      );
    }

    if (!poinDipakai || poinDipakai < 1000) {
      return Response.json(
        { ok: false, message: "Minimal 1000 poin untuk diskon" },
        { status: 400 }
      );
    }

    // Generate unique bulk_payment_id if multiple transactions
    const bulkPaymentId = transactionIds.length > 1
      ? `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : null;

    console.log(`📦 Bulk Payment ID: ${bulkPaymentId || 'single transaction'}`);

    const results = [];

    // Update each transaction with poin info
    for (const id of transactionIds) {
      const transaction = await prisma.transaksi.findUnique({
        where: { id: Number(id) }
      });

      if (!transaction) {
        console.warn(`Transaction #${id} not found`);
        continue;
      }

      // Calculate harga_akhir
      const hargaAkhir = transaction.total_harga - diskonPoin;

      // Update transaction with poin discount info
      const updated = await prisma.transaksi.update({
        where: { id: Number(id) },
        data: {
          poin_dipakai: poinDipakai,
          diskon_poin: diskonPoin,
          harga_akhir: hargaAkhir,
          bulk_payment_id: bulkPaymentId,
          poin_deducted: false
        }
      });

      results.push(updated);
      console.log(`✅ Applied ${poinDipakai} poin discount to transaction #${id} (bulk: ${bulkPaymentId || 'none'})`);
    }

    return Response.json({
      ok: true,
      message: `Poin discount applied to ${results.length} transaction(s)`,
      transactions: results
    });

  } catch (err) {
    console.error("Error applying poin discount:", err);
    return Response.json(
      { ok: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
