import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // TOTAL PRODUK
    const totalProduk = await prisma.produk.count();

    // TOTAL ORDER
    const totalOrder = await prisma.transaksi.count();

    // TOTAL SALES
    const totalSalesAgg = await prisma.transaksi.aggregate({
      _sum: { total_harga: true },
    });

    const totalSales = totalSalesAgg._sum.total_harga || 0;

    // PRODUK TERLARIS
    const top = await prisma.transaksi.groupBy({
      by: ["produkId"],
      _count: { produkId: true },
      orderBy: { _count: { produkId: "desc" } },
      take: 1,
    });

    let produkTerlaris = "-";

    if (top.length > 0) {
      const p = await prisma.produk.findUnique({
        where: { id: top[0].produkId },
      });

      produkTerlaris = p?.nama ?? "-";
    }

    // GRAFIK 7 HARI TERAKHIR
    const today = new Date();
    const seven = new Date();
    seven.setDate(today.getDate() - 6);

    const transaksi7hari = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: seven,
          lte: today,
        },
      },
      orderBy: { tanggal: "asc" },
    });

    const dailyTotals = {};

    // inisialisasi
    for (let i = 0; i < 7; i++) {
      const d = new Date(seven);
      d.setDate(seven.getDate() + i);
      dailyTotals[d.toISOString().slice(0, 10)] = 0;
    }

    // isi data
    transaksi7hari.forEach((tr) => {
      const dateStr = tr.tanggal.toISOString().slice(0, 10);
      dailyTotals[dateStr] += tr.total_harga || 0;
    });

    const grafikData = Object.entries(dailyTotals).map(([tanggal, total]) => ({
      tanggal,
      total,
    }));

    return new Response(
      JSON.stringify({
        totalProduk,
        totalOrder,
        totalSales,
        produkTerlaris,
        grafikData,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error admin-metric:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
