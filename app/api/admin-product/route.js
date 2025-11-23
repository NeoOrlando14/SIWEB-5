import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.product.findMany({
    orderBy: { id: "desc" },
  });
  return Response.json(data);
}

export async function POST(req) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      nama: body.nama,
      harga: Number(body.harga),
      stok: Number(body.stok),
    },
  });

  return Response.json(product);
}
