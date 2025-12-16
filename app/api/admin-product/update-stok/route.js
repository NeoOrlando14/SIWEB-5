import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(req) {
  const { id, amount } = await req.json();

  const product = await prisma.produk.update({
    where: { id: Number(id) },
    data: {
      stok: {
        increment: amount,
      },
    },
  });

  return Response.json(product);
}
