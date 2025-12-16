import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET ALL
export async function GET() {
  const products = await prisma.produk.findMany();
  return Response.json(products);
}

// CREATE
export async function POST(req) {
  const body = await req.json();

  const newProduct = await prisma.produk.create({
    data: {
      nama: body.nama,
      harga: body.harga,
      stok: body.stok
    },
  });

  return Response.json(newProduct);
}
