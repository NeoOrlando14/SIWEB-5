import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024'
);

export async function GET(req) {
  try {
    // Ambil token dari cookie
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "No token found" },
        { status: 401 }
      );
    }

    // Verify token menggunakan jose
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      ok: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });

  } catch (err) {
    console.error("Token verification error:", err.message);
    return NextResponse.json(
      { ok: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
