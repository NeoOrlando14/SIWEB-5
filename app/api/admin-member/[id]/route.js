import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  try {
    await prisma.member.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(req, { params }) {
  const id = Number(params.id);
  const data = await req.json();
  try {
    const updated = await prisma.member.update({
      where: { id },
      data,
    });
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
