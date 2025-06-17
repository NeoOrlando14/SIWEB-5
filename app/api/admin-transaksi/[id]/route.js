import { prisma } from '../../../../lib/prisma'; // ✅ perbaikan path yang benar

// DELETE handler
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.transaksi.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Transaksi deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete transaksi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ✅ Tambahkan PUT handler untuk update transaksi
export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();

    const updated = await prisma.transaksi.update({
      where: { id },
      data: {
        nama_pembeli: body.nama_pembeli,
        tanggal: new Date(body.tanggal),
        produkId: parseInt(body.produkId),
        total_harga: parseInt(body.total_harga),
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update transaksi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
