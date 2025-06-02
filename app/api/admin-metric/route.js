import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Total produk
    const totalProduk = await prisma.produk.count();

    // Total order (transaksi)
    const totalOrder = await prisma.transaksi.count();

    // Total sales (jumlah total_harga dari semua transaksi)
    const totalSalesAgg = await prisma.transaksi.aggregate({
      _sum: {
        total_harga: true,
      },
    });
    const totalSales = totalSalesAgg._sum.total_harga || 0;

    // Produk terlaris (produk dengan transaksi terbanyak)
    const produkTerlarisData = await prisma.transaksi.groupBy({
      by: ['produkId'],
      _count: {
        produkId: true,
      },
      orderBy: {
        _count: {
          produkId: 'desc',
        },
      },
      take: 1,
    });

    let produkTerlaris = '-';
    if (produkTerlarisData.length > 0) {
      const produk = await prisma.produk.findUnique({
        where: { id: produkTerlarisData[0].produkId },
      });
      produkTerlaris = produk?.nama || '-';
    }

    // Grafik data penjualan: total transaksi per hari dalam 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // termasuk hari ini (7 hari)

    // Ambil transaksi dari 7 hari terakhir
    const transaksi7hari = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        tanggal: 'asc',
      },
    });

    // Buat objek map tanggal => total_harga
    const dailyTotals = {};

    // Inisialisasi semua tanggal 7 hari terakhir dengan total 0
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(sevenDaysAgo.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10); // format yyyy-mm-dd
      dailyTotals[dateStr] = 0;
    }

    // Hitung total per hari
    transaksi7hari.forEach((tr) => {
      const dateStr = tr.tanggal.toISOString().slice(0, 10);
      if (dailyTotals[dateStr] !== undefined) {
        dailyTotals[dateStr] += tr.total_harga;
      }
    });

    // Ubah ke array sesuai format grafik
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
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error API admin-metric:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
