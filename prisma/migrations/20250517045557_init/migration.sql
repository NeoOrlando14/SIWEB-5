-- CreateTable
CREATE TABLE "Produk" (
    "id_produk" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama_produk" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id_transaksi" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama_pembeli" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_harga" INTEGER NOT NULL,
    "produkId" INTEGER NOT NULL,
    CONSTRAINT "Transaksi_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE
);
