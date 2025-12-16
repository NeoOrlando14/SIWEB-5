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

      // Normalisasi nama kolom menjadi lowercase untuk case-insensitive
      records = parsed.data.map(row => {
        const normalizedRow = {};
        for (let key in row) {
          // Ubah nama kolom menjadi lowercase dan hapus spasi
          const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
          normalizedRow[normalizedKey] = row[key];
        }
        return normalizedRow;
      });
    } else {
      // ==== JSON ====
      const jsonData = JSON.parse(text);
      // Normalisasi untuk JSON juga
      records = jsonData.map(row => {
        const normalizedRow = {};
        for (let key in row) {
          const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
          normalizedRow[normalizedKey] = row[key];
        }
        return normalizedRow;
      });
    }

    // VALIDASI FORMAT & KOLOM YANG DIPERLUKAN
    const requiredColumns = ['nama_produk', 'jumlah', 'total_harga', 'nama_pembeli'];

    if (records.length === 0) {
      return Response.json(
        { error: "File tidak memiliki data atau format tidak sesuai" },
        { status: 400 }
      );
    }

    // Cek kolom yang ada di record pertama
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

    if (missingColumns.length > 0) {
      return Response.json(
        {
          error: `Kolom yang diperlukan tidak ditemukan: ${missingColumns.join(', ')}. Pastikan file CSV/JSON memiliki kolom: ${requiredColumns.join(', ')} (huruf besar/kecil tidak masalah)`
        },
        { status: 400 }
      );
    }

    // VALIDASI PRODUK (Cari berdasarkan nama_produk - case insensitive)
    let totalInserted = 0;
    for (let r of records) {
      if (!r.nama_produk) {
        return Response.json(
          { error: `Baris dengan nama_pembeli "${r.nama_pembeli || 'kosong'}" tidak memiliki nama_produk` },
          { status: 400 }
        );
      }

      // Cari produk dengan case-insensitive menggunakan mode insensitive
      const cekProduk = await prisma.produk.findFirst({
        where: {
          nama: {
            equals: r.nama_produk,
            mode: 'insensitive'
          }
        },
      });

      if (!cekProduk) {
        return Response.json(
          { error: `Produk dengan nama "${r.nama_produk}" tidak ditemukan di database. Pastikan nama produk sesuai (huruf besar/kecil tidak masalah)` },
          { status: 400 }
        );
      }
    }

    // SIMPAN KE DATABASE (Buat transaksi berdasarkan jumlah)
    for (let r of records) {
      // Cari produk dengan case-insensitive
      const produk = await prisma.produk.findFirst({
        where: {
          nama: {
            equals: r.nama_produk,
            mode: 'insensitive'
          }
        },
      });

      const jumlah = Number(r.jumlah) || 1;
      const totalHargaPerItem = Number(r.total_harga);
      const tanggal = r.tanggal ? new Date(r.tanggal) : new Date();

      // Buat transaksi sejumlah quantity
      for (let i = 0; i < jumlah; i++) {
        await prisma.transaksi.create({
          data: {
            produkId: produk.id,
            nama_pembeli: r.nama_pembeli,
            total_harga: totalHargaPerItem,
            tanggal: tanggal,
            status: r.status || "selesai",
          },
        });
        totalInserted++;
      }
    }

    return Response.json(
      {
        success: true,
        inserted: totalInserted,
      },
      { status: 200 }
    );

  } catch (err) {
    return Response.json(
      { error: "UPLOAD ERROR: " + err.message },
      { status: 500 }
    );
  }
}
