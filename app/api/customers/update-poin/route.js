import { prisma } from "../../../../lib/prisma"; // FIXED

export async function PUT(req) {
  try {
    const { id, amount } = await req.json();

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        poin: { increment: amount }
      }
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
