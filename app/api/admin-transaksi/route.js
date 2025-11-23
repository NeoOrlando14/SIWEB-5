import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: { produk: true },
      orderBy: { id: "asc" }
    });

    return Response.json(transaksi);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
