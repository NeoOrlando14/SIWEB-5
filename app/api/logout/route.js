import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const response = NextResponse.json({
      ok: true,
      message: "Logout berhasil"
    });

    // Hapus auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expired immediately
      path: '/',
    });

    return response;

  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { ok: false, message: "Logout gagal" },
      { status: 500 }
    );
  }
}
