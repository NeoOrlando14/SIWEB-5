import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.poin.findMany({
      include: {
        customer: true,
      },
      orderBy: { id: "asc" }
    });

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const add = await prisma.poin.create({
      data: {
        customerId: body.customerId,
        jumlah: body.jumlah,
        status: body.status || "pending",
      },
    });

    return Response.json(add);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
