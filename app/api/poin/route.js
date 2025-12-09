// app/api/poin/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const poinList = await prisma.poin.findMany({
      include: {
        customer: true, // supaya bisa akses poin.customer.nama di frontend
      },
      orderBy: { id: "desc" },
    });

    return new Response(JSON.stringify(poinList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/poin error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerId, jumlah } = body || {};

    const cid = Number(customerId);
    const jml = Number(jumlah);

    if (Number.isNaN(cid) || Number.isNaN(jml)) {
      return new Response(JSON.stringify({ error: "Data tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const status = jml > 0 ? "success" : "pending";

    const poin = await prisma.poin.create({
      data: {
        customerId: cid,
        jumlah: jml,
        status,
      },
    });

    return new Response(JSON.stringify(poin), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/poin error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
