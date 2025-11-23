import { prisma } from "../../../../lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id);

    await prisma.transaksi.delete({
      where: { id }
    });

    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const update = await prisma.transaksi.update({
      where: { id },
      data: body
    });

    return Response.json(update);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
