import prisma from '../../../lib/prisma';


export async function GET() {
  try {
    const totalProduk = await prisma.produk.count();
    const totalOrder = await prisma.transaksi.count();
    const totalSales = await prisma.transaksi.aggregate({
      _sum: { total_harga: true }
    });

    let produkTerlaris = '-';

    const produkTerlarisGroup = await prisma.transaksi.groupBy({
      by: ['id_produk'],
      _count: { id_produk: true },
      orderBy: { _count: { id_produk: 'desc' } },
      take: 1
    });

    if (produkTerlarisGroup.length > 0) {
      const produk = await prisma.produk.findUnique({
        where: { id_produk: produkTerlarisGroup[0].id_produk },
        select: { nama_produk: true }
      });

      produkTerlaris = produk?.nama_produk || '-';
    }

    return new Response(JSON.stringify({
      totalProduk,
      totalOrder,
      totalSales: totalSales._sum.total_harga || 0,
      produkTerlaris,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in /api/admin-metric:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
