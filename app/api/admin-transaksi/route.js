import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.transaksi.findMany({
      orderBy: { id: "desc" }
    });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const trx = await prisma.transaksi.create({
      data: {
        produkId: Number(body.produkId),
        nama_pembeli: body.nama_pembeli,
        total_harga: Number(body.total_harga),
        tanggal: new Date(body.tanggal),
        status: body.status || "pending",
      },
    });

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
