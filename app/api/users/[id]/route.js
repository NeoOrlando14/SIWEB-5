import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ GET user by ID
export async function GET(_, { params }) {
  const { id } = params;
  const user = await prisma.users.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      phone: true,
      dob: true,
      role: true
    }
  });
  return NextResponse.json(user);
}

// ✅ UPDATE user
export async function PUT(req, { params }) {
  const { id } = params;
  const { email, phone, dob, role } = await req.json();

  await prisma.users.update({
    where: { id: Number(id) },
    data: {
      email,
      phone,
      dob: new Date(dob),
      role
    }
  });

  return NextResponse.json({ ok: true, message: "User berhasil diupdate ✅" });
}

// ✅ DELETE user
export async function DELETE(_, { params }) {
  const { id } = params;

  await prisma.users.delete({
    where: { id: Number(id) }
  });

  return NextResponse.json({ ok: true, message: "User berhasil dihapus ❌" });
}
