// app/api/customers/update-point/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, amount } = body || {};

    const customerId = Number(id);
    const delta = Number(amount);

    if (Number.isNaN(customerId) || Number.isNaN(delta)) {
      return new Response(JSON.stringify({ error: "Data tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Baca poin sekarang, supaya tidak turun di bawah 0
    const current = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { poin: true },
    });

    if (!current) {
      return new Response(JSON.stringify({ error: "Customer tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newPoint = Math.max(0, current.poin + delta);

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: { poin: newPoint },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT /api/customers/update-point error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
