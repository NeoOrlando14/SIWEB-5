import { prisma } from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.transaksi.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Transaksi deleted' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json', // ✅ TAMBAH INI
      },
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete transaksi' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json', // ✅ TAMBAH INI JUGA
      },
    });
  }
}
