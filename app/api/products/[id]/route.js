// app/api/products/[id]/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const id = Number(params.id);

  try {
    const produk = await prisma.produk.findUnique({
      where: { id },
    });

    if (!produk) {
      return new Response(
        JSON.stringify({ error: "Produk tidak ditemukan" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return Response.json(produk);
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal mengambil produk" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req, { params }) {
  const id = Number(params.id);

  try {
    const body = await req.json();
    const { nama, harga, stok, image } = body;

    const updated = await prisma.produk.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(harga !== undefined && { harga: Number(harga) }),
        ...(stok !== undefined && { stok: Number(stok) }),
        ...(image !== undefined && { image }),
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal mengupdate produk" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);

  try {
    // Check if product exists and get stock info
    const product = await prisma.produk.findUnique({
      where: { id }
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Produk tidak ditemukan" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🛡️ PROTEKSI: Tidak bisa delete produk yang masih ada stoknya
    if (product.stok > 0) {
      return new Response(
        JSON.stringify({
          error: `Tidak dapat menghapus produk yang masih memiliki stok (${product.stok} item). Habiskan stok terlebih dahulu.`
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.produk.delete({
      where: { id },
    });

    return Response.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal menghapus produk" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
