import { prisma } from '../../../lib/prisma'; // gunakan path relatif

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: {
        produk: true,
      },
      orderBy: { id: 'asc' },
    });

    return new Response(JSON.stringify(transaksi), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('GET Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transaksi' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const newTransaksi = await prisma.transaksi.create({
      data: {
        nama_pembeli: body.nama_pembeli,
        tanggal: new Date(body.tanggal),
        produkId: parseInt(body.produkId),
        total_harga: parseInt(body.total_harga),
      },
    });

    return new Response(JSON.stringify(newTransaksi), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
