import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "Tidak ada file" }, { status: 400 });
    }

    const text = await file.text();
    let records = [];

    // ==== CSV ====
    if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      records = parsed.data;
    } else {
      // ==== JSON ====
      records = JSON.parse(text);
    }

    // VALIDASI PRODUK
    for (let r of records) {
      const cekProduk = await prisma.produk.findUnique({
        where: { id: Number(r.produkId) },
      });

      if (!cekProduk) {
        return Response.json(
          { error: `Produk dengan ID ${r.produkId} tidak ditemukan di database` },
          { status: 400 }
        );
      }
    }

    // SIMPAN KE DATABASE
    for (let r of records) {
      await prisma.transaksi.create({
        data: {
          produkId: Number(r.produkId),
          nama_pembeli: r.nama_pembeli,
          total_harga: Number(r.total_harga),
          tanggal: new Date(r.tanggal),
          status: r.status || "pending",
        },
      });
    }

    return Response.json({
      success: true,
      inserted: records.length,
    });

  } catch (err) {
    return Response.json(
      { error: "UPLOAD ERROR: " + err.message },
      { status: 500 }
    );
  }
}
