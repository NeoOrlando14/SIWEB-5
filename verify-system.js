// System Verification Script
// Verifikasi kelayakan sistem POS Sebelah Kopi

const fs = require('fs');
const path = require('path');

console.log('🔍 SISTEM VERIFICATION - POS Sebelah Kopi\n');
console.log('=' .repeat(60));

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(test) {
  results.passed.push(test);
  console.log(`✅ PASS: ${test}`);
}

function fail(test, reason) {
  results.failed.push({ test, reason });
  console.log(`❌ FAIL: ${test}`);
  console.log(`   Reason: ${reason}`);
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  console.log(`⚠️  WARN: ${test}`);
  console.log(`   Reason: ${reason}`);
}

console.log('\n📁 FILE STRUCTURE VERIFICATION\n');

// Test 1: Verify critical files exist
const criticalFiles = [
  'app/shop/page.js',
  'app/transaksi-saya/page.js',
  'app/admin-transaksi/page.js',
  'app/admin-transaksi/edit/[id]/page.js',
  'app/owner-dashboard/page.js',
  'app/owner-riwayat-pemesanan/page.js',
  'app/owner-laporan/page.js',
  'app/owner-poin/page.js',
  'app/login/page.js',
  'app/api/admin-transaksi/route.js',
  'app/api/admin-transaksi/[id]/route.js',
  'app/api/riwayat-pemesanan/route.js',
  'prisma/schema.prisma'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    pass(`File exists: ${file}`);
  } else {
    fail(`File missing: ${file}`, 'Critical file not found');
  }
});

console.log('\n🔧 CODE VERIFICATION\n');

// Test 2: Verify shop.js uses localStorage for cart
const shopContent = fs.readFileSync('app/shop/page.js', 'utf8');
if (shopContent.includes('localStorage.setItem(\'cart\'')) {
  pass('Shop page uses localStorage for cart');
} else {
  fail('Shop page cart implementation', 'Does not use localStorage');
}

if (shopContent.includes('handleQuantityChange') && shopContent.includes('quantities')) {
  pass('Shop page has quantity selector');
} else {
  fail('Shop page quantity feature', 'Quantity selector not implemented');
}

// Test 3: Verify transaksi-saya uses localStorage
const transaksiContent = fs.readFileSync('app/transaksi-saya/page.js', 'utf8');
if (transaksiContent.includes('JSON.parse(localStorage.getItem(\'cart\''))  {
  pass('Transaksi-saya reads from localStorage cart');
} else {
  fail('Transaksi-saya cart reading', 'Does not read from localStorage');
}

if (transaksiContent.includes('confirmPayment') && transaksiContent.includes('/api/admin-transaksi')) {
  pass('Transaksi-saya creates transactions on payment confirm');
} else {
  fail('Transaksi-saya checkout flow', 'Payment confirmation not properly implemented');
}

// Test 4: Verify login saves userId
const loginContent = fs.readFileSync('app/login/page.js', 'utf8');
if (loginContent.includes('localStorage.setItem("userId"')) {
  pass('Login page saves userId to localStorage');
} else {
  fail('Login userId storage', 'userId not saved to localStorage');
}

// Test 5: Verify API routes save userId
const apiTransaksiContent = fs.readFileSync('app/api/admin-transaksi/route.js', 'utf8');
if (apiTransaksiContent.includes('userId: body.userId')) {
  pass('API admin-transaksi POST saves userId');
} else {
  fail('API userId handling', 'userId not saved in POST request');
}

// Test 6: Verify admin edit sends complete data
const adminEditContent = fs.readFileSync('app/admin-transaksi/edit/[id]/page.js', 'utf8');
if (adminEditContent.includes('userId: data.userId') &&
    adminEditContent.includes('poin_dipakai: data.poin_dipakai') &&
    adminEditContent.includes('bulk_payment_id: data.bulk_payment_id')) {
  pass('Admin edit sends complete transaction data');
} else {
  fail('Admin edit data completeness', 'Missing critical fields in update payload');
}

// Test 7: Verify RiwayatPemesanan creation
const apiEditContent = fs.readFileSync('app/api/admin-transaksi/[id]/route.js', 'utf8');
if (apiEditContent.includes('prisma.riwayatPemesanan.create') &&
    apiEditContent.includes('userId: trx.userId')) {
  pass('RiwayatPemesanan created with userId on transaction approval');
} else {
  fail('RiwayatPemesanan creation', 'Not creating history or missing userId');
}

// Test 8: Verify owner sidebar consistency
const ownerPages = [
  'app/owner-dashboard/page.js',
  'app/owner-riwayat-pemesanan/page.js',
  'app/owner-poin/page.js'
];

let sidebarConsistent = true;
ownerPages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  if (!content.includes('/owner-dashboard') ||
      !content.includes('/owner-laporan') ||
      !content.includes('/owner-riwayat-pemesanan') ||
      !content.includes('/owner-poin')) {
    sidebarConsistent = false;
    fail(`${page} sidebar`, 'Missing one or more sidebar links');
  }
});

if (sidebarConsistent) {
  pass('Owner sidebar consistent across all pages');
}

// Test 9: Verify schema has required fields
const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
const requiredModels = ['Transaksi', 'RiwayatPemesanan', 'users'];
requiredModels.forEach(model => {
  if (schemaContent.includes(`model ${model}`)) {
    pass(`Schema has ${model} model`);
  } else {
    fail(`Schema ${model} model`, 'Model not found in schema');
  }
});

if (schemaContent.includes('userId          Int?') &&
    schemaContent.includes('bulk_payment_id String?')) {
  pass('Transaksi model has userId and bulk_payment_id fields');
} else {
  fail('Transaksi model fields', 'Missing userId or bulk_payment_id');
}

if (schemaContent.includes('model RiwayatPemesanan')) {
  const riwayatSection = schemaContent.substring(
    schemaContent.indexOf('model RiwayatPemesanan'),
    schemaContent.indexOf('model RiwayatPemesanan') + 500
  );

  if (riwayatSection.includes('userId') &&
      riwayatSection.includes('nama_pembeli') &&
      riwayatSection.includes('nama_produk') &&
      riwayatSection.includes('harga_produk')) {
    pass('RiwayatPemesanan has snapshot fields for permanent storage');
  } else {
    fail('RiwayatPemesanan fields', 'Missing critical snapshot fields');
  }
}

console.log('\n📊 VERIFICATION SUMMARY\n');
console.log('=' .repeat(60));
console.log(`✅ Passed:   ${results.passed.length}`);
console.log(`❌ Failed:   ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log('=' .repeat(60));

if (results.failed.length > 0) {
  console.log('\n❌ FAILED TESTS:\n');
  results.failed.forEach(({ test, reason }) => {
    console.log(`  • ${test}`);
    console.log(`    └─ ${reason}\n`);
  });
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  results.warnings.forEach(({ test, reason }) => {
    console.log(`  • ${test}`);
    console.log(`    └─ ${reason}\n`);
  });
}

console.log('\n🎯 SYSTEM STATUS\n');
const passRate = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(2);
console.log(`Pass Rate: ${passRate}%`);

if (results.failed.length === 0) {
  console.log('\n✅ SYSTEM READY FOR TESTING!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Execute manual test cases from TEST_PLAN.md');
  console.log('3. Test all three roles: Customer → Admin → Owner');
} else {
  console.log('\n⚠️  SYSTEM HAS ISSUES - FIX FAILED TESTS BEFORE PROCEEDING\n');
  process.exit(1);
}

console.log('=' .repeat(60));
