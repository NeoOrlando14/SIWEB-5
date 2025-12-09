// app/api/products/update-stok/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { id, amount } = await req.json();

    if (id == null || amount == null) {
      return new Response(
        JSON.stringify({ error: "id dan amount wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updated = await prisma.produk.update({
      where: { id: Number(id) },
      data: {
        stok: {
          increment: Number(amount),
        },
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("PUT /api/products/update-stok error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal mengupdate stok" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
