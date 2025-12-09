import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    const { jumlah } = await req.json();

    const update = await prisma.poin.update({
      where: { id: Number(params.id) },
      data: { jumlah }
    });

    return Response.json(update);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await prisma.poin.delete({
      where: { id: Number(params.id) }
    });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
