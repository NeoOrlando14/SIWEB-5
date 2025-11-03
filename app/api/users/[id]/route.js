import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ GET user by ID
export async function GET(_, { params }) {
  const { id } = params;
  const user = await pool.query(
    `SELECT id, email, phone, dob, role FROM users WHERE id = $1`,
    [id]
  );
  return NextResponse.json(user.rows[0]);
}

// ✅ UPDATE user
export async function PUT(req, { params }) {
  const { id } = params;
  const { email, phone, dob, role } = await req.json();

  await pool.query(
    `UPDATE users 
     SET email=$1, phone=$2, dob=$3, role=$4 
     WHERE id=$5`,
    [email, phone, dob, role, id]
  );

  return NextResponse.json({ ok: true, message: "User berhasil diupdate ✅" });
}

// ✅ DELETE user
export async function DELETE(_, { params }) {
  const { id } = params;

  await pool.query(`DELETE FROM users WHERE id=$1`, [id]);

  return NextResponse.json({ ok: true, message: "User berhasil dihapus ❌" });
}
