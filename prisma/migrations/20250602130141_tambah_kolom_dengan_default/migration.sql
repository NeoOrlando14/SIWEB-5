-- AlterTable
ALTER TABLE "Produk" ADD COLUMN     "harga" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "image" TEXT NOT NULL DEFAULT 'default.jpg',
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "reviews" INTEGER NOT NULL DEFAULT 0;
