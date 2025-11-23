import { prisma } from "../../../../lib/prisma"; // FIXED

export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    const { nama, telepon } = await req.json();

    const updated = await prisma.customer.update({
      where: { id },
      data: { nama, telepon }
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id);

    await prisma.customer.delete({
      where: { id }
    });

    return Response.json({ message: "Deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
