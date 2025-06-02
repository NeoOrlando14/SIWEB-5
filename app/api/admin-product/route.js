import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.produk.findMany({
      orderBy: { id: 'asc' },
    });
    return Response.json(products);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const product = await prisma.produk.create({ data });
    return Response.json(product);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    const updated = await prisma.produk.update({
      where: { id },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await prisma.produk.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
