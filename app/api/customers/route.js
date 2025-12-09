// app/api/customers/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { id: "desc" },
    });

    return new Response(JSON.stringify(customers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/customers error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, telepon, poin } = body || {};

    if (!nama || !telepon) {
      return new Response(
        JSON.stringify({ error: "Nama dan telepon wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        nama,
        telepon,
        poin: typeof poin === "number" ? poin : 0,
      },
    });

    return new Response(JSON.stringify(newCustomer), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/customers error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
