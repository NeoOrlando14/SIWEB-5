import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Konversi rate: 1000 poin = Rp 1.000
const POIN_TO_RUPIAH_RATE = 1; // 1 poin = Rp 1

export async function POST(req) {
  try {
    const { email, poinDipakai } = await req.json();

    if (!email || !poinDipakai) {
      return NextResponse.json(
        { ok: false, message: "Email dan jumlah poin wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi minimal poin
    if (poinDipakai < 1000) {
      return NextResponse.json(
        { ok: false, message: "Minimal 1000 poin untuk ditukar" },
        { status: 400 }
      );
    }

    // Cek poin user
    const user = await prisma.users.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        poin: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi poin cukup
    if (user.poin < poinDipakai) {
      return NextResponse.json(
        {
          ok: false,
          message: `Poin tidak cukup. Anda memiliki ${user.poin} poin`,
          currentPoin: user.poin
        },
        { status: 400 }
      );
    }

    // Hitung diskon dalam rupiah
    const diskonRupiah = poinDipakai * POIN_TO_RUPIAH_RATE;

    return NextResponse.json({
      ok: true,
      poinDipakai,
      diskonRupiah,
      currentPoin: user.poin,
      remainingPoin: user.poin - poinDipakai,
      message: `${poinDipakai} poin = Rp ${diskonRupiah.toLocaleString()} diskon`
    });

  } catch (err) {
    console.error("Error redeem poin:", err);
    return NextResponse.json(
      { ok: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
