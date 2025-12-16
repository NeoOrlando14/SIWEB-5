import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, phone, dob } = await req.json();

    if (!email || !phone || !dob) {
      return NextResponse.json({ ok: false, message: "Semua field wajib diisi" }, { status: 400 });
    }

    const check = await prisma.users.findUnique({
      where: { email: email }
    });

    if (check) {
      return NextResponse.json({ ok: false, message: "Email sudah terdaftar!" }, { status: 400 });
    }

    // Set default password sebagai "123"
    const defaultPassword = "123";

    await prisma.users.create({
      data: {
        email: email,
        password: defaultPassword,
        phone: phone,
        dob: new Date(dob),
        role: 'customer'
      }
    });

    return NextResponse.json({ ok: true, message: "Registrasi berhasil!" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
