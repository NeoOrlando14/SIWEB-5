// app/api/poin/[id]/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return new Response(JSON.stringify({ error: "ID tidak valid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { jumlah } = body || {};
    const newJumlah = Number(jumlah);

    if (Number.isNaN(newJumlah)) {
      return new Response(JSON.stringify({ error: "Jumlah tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = await prisma.poin.update({
      where: { id },
      data: { jumlah: newJumlah },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PATCH /api/poin/[id] error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return new Response(JSON.stringify({ error: "ID tidak valid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await prisma.poin.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DELETE /api/poin/[id] error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
