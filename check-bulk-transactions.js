const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBulkTransactions() {
  try {
    console.log('🔍 Checking transactions...\n');

    const transactions = await prisma.transaksi.findMany({
      where: {
        nama_pembeli: 'pembeli'
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Found ${transactions.length} transactions for 'pembeli'\n`);

    transactions.forEach(trx => {
      console.log(`ID: ${trx.id}`);
      console.log(`  Produk ID: ${trx.produkId}`);
      console.log(`  Total Harga: Rp ${trx.total_harga.toLocaleString()}`);
      console.log(`  Tanggal: ${new Date(trx.tanggal).toLocaleDateString('id-ID')}`);
      console.log(`  Status: ${trx.status}`);
      console.log(`  bulk_payment_id: ${trx.bulk_payment_id || 'NULL (tidak ada)'}`);
      console.log('---');
    });

    // Group by bulk_payment_id
    const grouped = {};
    transactions.forEach(trx => {
      const key = trx.bulk_payment_id || `single_${trx.id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(trx);
    });

    console.log('\n📊 Grouping Summary:');
    Object.entries(grouped).forEach(([key, items]) => {
      if (key.startsWith('BULK-')) {
        console.log(`\n✅ Bulk Order: ${key}`);
        console.log(`   Items: ${items.length}`);
        console.log(`   Total: Rp ${items.reduce((sum, t) => sum + t.total_harga, 0).toLocaleString()}`);
      } else {
        console.log(`\n❌ Single Transaction: ID ${items[0].id} (no bulk_payment_id)`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBulkTransactions();
