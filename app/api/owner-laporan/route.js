// app/api/owner-laporan/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where = {};

    if (start || end) {
      where.tanggal = {};
      if (start) where.tanggal.gte = new Date(start);
      if (end) {
        const d = new Date(end);
        d.setHours(23, 59, 59, 999);
        where.tanggal.lte = d;
      }
    }

    const transaksi = await prisma.transaksi.findMany({
      where,
      orderBy: { tanggal: "desc" },
      include: {
        produk: true,
      },
    });

    return new Response(JSON.stringify(transaksi), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/owner-laporan error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
