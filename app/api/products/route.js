// app/api/products/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get products directly from database
    // Stok is managed manually by admin (can be increased/decreased anytime)
    const products = await prisma.produk.findMany({
      orderBy: { id: "asc" },
    });

    return Response.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal mengambil data produk" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, harga, stok, image } = body;

    if (!nama || harga == null || stok == null) {
      return new Response(
        JSON.stringify({ error: "nama, harga, dan stok wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Gambar produk wajib diupload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const created = await prisma.produk.create({
      data: {
        nama,
        harga: Number(harga),
        stok: Number(stok),
        image: image, // Base64 string
      },
    });

    return Response.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal menambah produk" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
