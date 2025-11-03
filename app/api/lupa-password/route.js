import { NextResponse } from 'next/server';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
    const user = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND password = $2`,
      [email, oldPassword]
    );

    if (user.rowCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Email atau password lama salah!" },
        { status: 401 }
      );
    }

    // Update password
    await pool.query(
      `UPDATE users SET password = $1 WHERE email = $2`,
      [newPassword, email]
    );

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
    