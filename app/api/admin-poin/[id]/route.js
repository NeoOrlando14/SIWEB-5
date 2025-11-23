import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();

    const update = await prisma.poin.update({
      where: { id: Number(params.id) },
      data: {
        jumlah: body.jumlah,
        status: body.status,
      },
    });

    return Response.json(update);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.poin.delete({
      where: { id: Number(params.id) },
    });

    return Response.json({ message: "Deleted" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
