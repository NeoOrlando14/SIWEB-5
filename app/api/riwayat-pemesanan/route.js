// app/api/riwayat-pemesanan/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all riwayat pemesanan
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const nama_pembeli = searchParams.get("nama_pembeli");

    let where = {};

    // Filter by userId if provided
    if (userId) {
      where.userId = Number(userId);
    }

    // Filter by nama_pembeli if provided
    if (nama_pembeli) {
      where.nama_pembeli = {
        contains: nama_pembeli,
        mode: 'insensitive'
      };
    }

    const riwayat = await prisma.riwayatPemesanan.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return Response.json(riwayat);
  } catch (err) {
    console.error("GET /api/riwayat-pemesanan error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
