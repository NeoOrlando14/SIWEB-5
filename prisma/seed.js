import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const produk1 = await prisma.produk.create({
    data: {
      nama_produk: 'Mouse Wireless',
      harga: 150000,
      stok: 10,
      foto: '/img/mouse.jpg',
      deskripsi: 'Mouse tanpa kabel'
    }
  });

  await prisma.transaksi.create({
    data: {
      id_produk: produk1.id_produk,
      nama_pembeli: 'Ayu',
      total_harga: 150000
    }
  });

  // Tambahkan 4 produk dan transaksi lagi...
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
