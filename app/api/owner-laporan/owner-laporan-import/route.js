// app/api/owner-laporan-import/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const items = body.items;

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json(
        { error: "items harus berupa array dan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const data = items
      .map((it) => ({
        produkId: Number(it.produkId),
        nama_pembeli: it.nama_pembeli || "Unknown",
        total_harga: Number(it.total_harga) || 0,
        tanggal: it.tanggal ? new Date(it.tanggal) : new Date(),
        status: (it.status || "pending").toLowerCase(),
      }))
      .filter((it) => !Number.isNaN(it.produkId));

    if (!data.length) {
      return NextResponse.json(
        { error: "Tidak ada item valid untuk disimpan" },
        { status: 400 }
      );
    }

    await prisma.transaksi.createMany({
      data,
    });

    return NextResponse.json({
      success: true,
      count: data.length,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Gagal import ke database: " + err.message },
      { status: 500 }
    );
  }
}
