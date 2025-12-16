import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.transaksi.findMany({
      include: {
        produk: true,
      },
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
        userId: body.userId ? Number(body.userId) : null,
        bulk_payment_id: body.bulk_payment_id || null, // Save bulk_payment_id
      },
    });

    return Response.json(trx);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
