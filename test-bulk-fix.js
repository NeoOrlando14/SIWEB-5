const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBulkFix() {
  try {
    console.log('🔍 Testing Bulk Payment System Fix...\n');

    // Get all transactions
    const allTransactions = await prisma.transaksi.findMany({
      orderBy: { id: 'desc' },
      take: 20
    });

    console.log(`📊 Total transaksi terakhir: ${allTransactions.length}\n`);

    // Group by bulk_payment_id
    const grouped = {};
    allTransactions.forEach(trx => {
      const key = trx.bulk_payment_id || `single_${trx.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          type: trx.bulk_payment_id ? 'BULK' : 'SINGLE',
          bulk_payment_id: trx.bulk_payment_id,
          transactions: [],
          totalHarga: 0
        };
      }
      grouped[key].transactions.push(trx);
      grouped[key].totalHarga += trx.total_harga;
    });

    // Display summary
    console.log('📦 SUMMARY TRANSAKSI:\n');
    Object.entries(grouped).forEach(([key, data]) => {
      if (data.type === 'BULK') {
        console.log(`✅ BULK ORDER: ${data.bulk_payment_id}`);
        console.log(`   Items: ${data.transactions.length}`);
        console.log(`   Total: Rp ${data.totalHarga.toLocaleString()}`);
        console.log(`   Pembeli: ${data.transactions[0].nama_pembeli}`);
        console.log(`   Tanggal: ${new Date(data.transactions[0].tanggal).toLocaleDateString('id-ID')}`);
        console.log(`   Transaction IDs: ${data.transactions.map(t => `#${t.id}`).join(', ')}`);
      } else {
        const trx = data.transactions[0];
        console.log(`\n⚪ Single Transaction #${trx.id}`);
        console.log(`   Pembeli: ${trx.nama_pembeli}`);
        console.log(`   Harga: Rp ${trx.total_harga.toLocaleString()}`);
        console.log(`   Tanggal: ${new Date(trx.tanggal).toLocaleDateString('id-ID')}`);
      }
      console.log('');
    });

    // Count bulk vs single
    const bulkCount = Object.values(grouped).filter(g => g.type === 'BULK').length;
    const singleCount = Object.values(grouped).filter(g => g.type === 'SINGLE').length;

    console.log('📈 STATISTIK:');
    console.log(`   Bulk Orders: ${bulkCount}`);
    console.log(`   Single Transactions: ${singleCount}`);
    console.log(`   Total Groups: ${bulkCount + singleCount}`);

    // Check if there are any NULL bulk_payment_id issues
    const nullBulkIds = allTransactions.filter(t => !t.bulk_payment_id);
    if (nullBulkIds.length > 0) {
      console.log(`\n⚠️  WARNING: ${nullBulkIds.length} transaksi dengan NULL bulk_payment_id`);
      console.log('   (Ini normal untuk transaksi single/lama sebelum fix)');
    }

    console.log('\n✅ Test selesai!');
    console.log('\n💡 Cara test sistem:');
    console.log('   1. Login sebagai customer');
    console.log('   2. Tambah 2+ produk ke cart');
    console.log('   3. Checkout sekaligus');
    console.log('   4. Cek admin-transaksi, harusnya muncul 1 row dengan badge "📦 Bulk"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBulkFix();
