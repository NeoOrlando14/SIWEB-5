import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET ONE
export async function GET(_, { params }) {
  const { id } = params;

  const product = await prisma.produk.findUnique({
    where: { id: Number(id) },
  });

  return Response.json(product);
}

// UPDATE
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  const updated = await prisma.produk.update({
    where: { id: Number(id) },
    data: {
      nama: body.nama,
      harga: body.harga,
      stok: body.stok
    },
  });

  return Response.json(updated);
}

// DELETE
export async function DELETE(_, { params }) {
  const { id } = params;

  await prisma.produk.delete({
    where: { id: Number(id) },
  });

  return Response.json({ success: true });
}
