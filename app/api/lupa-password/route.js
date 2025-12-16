import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, oldPassword, newPassword } = await req.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, message: "Semua data harus diisi!" },
        { status: 400 }
      );
    }

    // Cek password lama
    const user = await prisma.users.findFirst({
      where: {
        email: email,
        password: oldPassword
      }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Email atau password lama salah!" },
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

  } catch (err) {
    console.error("Forgot Password API Error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error!", error: err.message },
      { status: 500 }
    );
  }
}
    