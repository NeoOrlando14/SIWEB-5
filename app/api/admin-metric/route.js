import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    // Total Produk
    const totalProduk = await prisma.produk.count()

    // Total Transaksi
    const totalOrder = await prisma.transaksi.count()

    // Total Pendapatan
    const totalSalesAggregate = await prisma.transaksi.aggregate({
      _sum: { total_harga: true }
    })
    const totalSales = totalSalesAggregate._sum.total_harga || 0

    // Produk Terlaris
    let produkTerlaris = '-'

    const produkTerlarisGroup = await prisma.transaksi.groupBy({
      by: ['id_produk'],
      _count: { id_produk: true },
      orderBy: { _count: { id_produk: 'desc' } },
      take: 1
    })

    if (produkTerlarisGroup.length > 0 && produkTerlarisGroup[0].id_produk) {
      const produk = await prisma.produk.findUnique({
        where: { id_produk: produkTerlarisGroup[0].id_produk },
        select: { nama_produk: true }
      })

      if (produk?.nama_produk) {
        produkTerlaris = produk.nama_produk
      }
    }

    // Grafik Penjualan per Tanggal
    const transaksiPerTanggal = await prisma.transaksi.groupBy({
      by: ['tanggal'],
      _sum: { total_harga: true },
      orderBy: { tanggal: 'asc' },
    })

    const grafikData = transaksiPerTanggal.map(item => ({
      tanggal: item.tanggal.toISOString().split('T')[0], // Format YYYY-MM-DD
      total: item._sum.total_harga || 0,
    }))

    // Return hasil
    return new Response(JSON.stringify({
      totalProduk,
      totalOrder,
      totalSales,
      produkTerlaris,
      grafikData,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
  console.error('🔥 ERROR di /api/admin-metric:', error); // tampilkan semua error
  return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
    status: 500
    })
  }
}
