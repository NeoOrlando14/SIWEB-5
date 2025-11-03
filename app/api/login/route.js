import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (user.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const loggedUser = user.rows[0];

    return NextResponse.json({
      ok: true,
      user: {
        email: loggedUser.email,
        role: loggedUser.role,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
