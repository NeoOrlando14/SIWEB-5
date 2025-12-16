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

    // Get current product to check stock
    const currentProduct = await prisma.produk.findUnique({
      where: { id: Number(id) }
    });

    if (!currentProduct) {
      return new Response(
        JSON.stringify({ error: "Produk tidak ditemukan" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate new stock value
    const newStok = currentProduct.stok + Number(amount);

    // Prevent negative stock
    if (newStok < 0) {
      return new Response(
        JSON.stringify({
          error: "Stok tidak boleh kurang dari 0",
          currentStok: currentProduct.stok
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updated = await prisma.produk.update({
      where: { id: Number(id) },
      data: {
        stok: newStok,
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
