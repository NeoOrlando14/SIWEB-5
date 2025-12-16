import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        role: true,
        poin: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      poin: user.poin || 0,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error("Error get user poin:", err);
    return NextResponse.json(
      { ok: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
