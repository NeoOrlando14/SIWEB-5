import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, oldPassword, newPassword } = body;

    console.log("REQ BODY => ", body);

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, message: "Semua data harus diisi!" },
        { status: 400 }
      );
    }

    // Cek user lama
    const user = await prisma.users.findFirst({
      where: {
        email: email,
        password: oldPassword
      }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Password lama salah atau email tidak ditemukan." },
        { status: 401 }
      );
    }

    // Update password
    await prisma.users.update({
      where: { email: email },
      data: { password: newPassword }
    });

    return NextResponse.json(
      { ok: true, message: "Password berhasil diubah!" },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Server error, coba lagi!" },
      { status: 500 }
    );
  }
}
