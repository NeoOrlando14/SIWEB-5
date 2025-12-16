import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Secret key untuk JWT - di production harus dari environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024'
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email dan password wajib diisi!" },
        { status: 400 }
      );
    }

    // Query user dari database menggunakan Prisma
    const user = await prisma.users.findFirst({
      where: {
        email: email,
        password: password
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Email atau password salah!" },
        { status: 401 }
      );
    }

    // Generate JWT token menggunakan jose (edge runtime compatible)
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h') // Token berlaku 24 jam
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Buat response dengan token di cookie (HttpOnly untuk keamanan)
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token, // Kirim token juga di body untuk disimpan di localStorage sebagai backup
    });

    // Set cookie HttpOnly (tidak bisa diakses via JavaScript)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
    });

    return response;

  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error!", error: err.message },
      { status: 500 }
    );
  }
}
