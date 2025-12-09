import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const data = await prisma.poin.findMany({
    include: { customer: true }
  });
  return Response.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const poin = await prisma.poin.create({
      data: {
        customerId: body.customerId,
        jumlah: body.jumlah,
        status: "pending"
      }
    });
    return Response.json(poin);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
