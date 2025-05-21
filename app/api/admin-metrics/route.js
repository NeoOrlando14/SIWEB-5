import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalProduk, totalOrder, totalSales, produkTerlaris] = await Promise.all([
      prisma.produk.count(),
      prisma.transaksi.count(),
      prisma.transaksi.aggregate({ _sum: { total_harga: true } }),
      prisma.transaksi.groupBy({
        by: ['id_produk'],
        _count: { id_produk: true },
        orderBy: { _count: { id_produk: 'desc' } },
        take: 1
      })
    ]);

    let namaProdukTerlaris = '-';
    if (produkTerlaris.length > 0) {
      const produk = await prisma.produk.findUnique({
        where: { id_produk: produkTerlaris[0].id_produk },
        select: { nama_produk: true }
      });
      if (produk) {
        namaProdukTerlaris = produk.nama_produk;
      }
    }

    return Response.json({
      totalProduk,
      totalOrder,
      totalSales: totalSales._sum.total_harga || 0,
      produkTerlaris: namaProdukTerlaris
    });

  } catch (error) {
    console.error('API admin-metric error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
