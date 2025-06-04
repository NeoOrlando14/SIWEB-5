import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: { produk: true },
      orderBy: { tanggal: 'desc' },
    });

    return Response.json(transaksi);
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transaksi' }), {
      status: 500,
    });
  }
}
