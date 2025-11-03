import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req) {
  try {
    const { email, password, phone, dob } = await req.json();

    if (!email || !password || !phone || !dob) {
      return NextResponse.json({ ok: false, message: "Semua field wajib diisi" }, { status: 400 });
    }

    const check = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (check.rows.length > 0) {
      return NextResponse.json({ ok: false, message: "Email sudah terdaftar!" }, { status: 400 });
    }

    await pool.query(
      "INSERT INTO users (email, password, phone, dob, role) VALUES ($1, $2, $3, $4, 'customer')",
      [email, password, phone, dob]
    );

    return NextResponse.json({ ok: true, message: "Registrasi berhasil!" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
