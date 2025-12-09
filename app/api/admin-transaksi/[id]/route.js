import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET detail
export async function GET(_, { params }) {
  try {
    const trx = await prisma.transaksi.findUnique({
      where: { id: Number(params.id) },
    });

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE transaksi
export async function PUT(req, { params }) {
  try {
    const body = await req.json();

    const trx = await prisma.transaksi.update({
      where: { id: Number(params.id) },
      data: {
        produkId: Number(body.produkId),
        nama_pembeli: body.nama_pembeli,
        total_harga: Number(body.total_harga),
        status: body.status,
      },
    });

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE transaksi
export async function DELETE(_, { params }) {
  try {
    await prisma.transaksi.delete({
      where: { id: Number(params.id) },
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
