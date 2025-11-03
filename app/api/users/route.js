import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ GET - ambil semua users
export async function GET() {
  const users = await pool.query(
    `SELECT id, email, phone, dob, role, created_at 
     FROM users ORDER BY id ASC`
  );
  return NextResponse.json(users.rows);
}

// ✅ POST - tambah user baru
export async function POST(req) {
  const { email, password, phone, dob, role = "customer" } = await req.json();

  await pool.query(
    `INSERT INTO users (email, password, phone, dob, role) 
     VALUES ($1,$2,$3,$4,$5)`,
    [email, password, phone, dob, role]
  );

  return NextResponse.json({ ok: true, message: "User berhasil ditambahkan ✅" });
}
