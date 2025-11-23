import { NextResponse } from 'next/server';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email dan password wajib diisi!" },
        { status: 400 }
      );
    }

    // 🧠 ubah "User" -> users
    const result = await pool.query(
      `SELECT id, email, role FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Email atau password salah!" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error!", error: err.message },
      { status: 500 }
    );
  }
}
