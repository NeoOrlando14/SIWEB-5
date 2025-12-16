import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ GET - ambil semua users
export async function GET() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      dob: true,
      role: true
    },
    orderBy: {
      id: 'asc'
    }
  });
  return NextResponse.json(users);
}

// ✅ POST - tambah user baru
export async function POST(req) {
  const { email, password, phone, dob, role = "customer" } = await req.json();

  await prisma.users.create({
    data: {
      email,
      password,
      phone,
      dob: new Date(dob),
      role
    }
  });

  return NextResponse.json({ ok: true, message: "User berhasil ditambahkan ✅" });
}
