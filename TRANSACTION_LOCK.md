# Transaction Lock System

## Overview
Sistem proteksi untuk mencegah edit dan delete transaksi yang sudah berstatus "diterima".

## Alasan
- Transaksi yang sudah diterima adalah transaksi final
- Sudah terjadi perhitungan poin (reward + deduction)
- Mengubah/menghapus transaksi yang sudah diterima bisa menyebabkan inkonsistensi data poin

## Implementasi

### 1. Frontend Protection
**File:** [app/admin-transaksi/page.js](app/admin-transaksi/page.js:169-186)

Tombol Edit dan Delete tidak muncul untuk transaksi dengan status "diterima":

```javascript
{t.status === "diterima" ? (
  <span className="text-gray-500 text-sm italic">Transaksi selesai</span>
) : (
  <div className="flex items-center space-x-4 text-xl">
    <Pencil onClick={() => router.push(`/admin-transaksi/edit/${t.id}`)} />
    <Trash2 onClick={() => deleteTransaksi(t.id)} />
  </div>
)}
```

### 2. Edit Page Protection
**File:** [app/admin-transaksi/edit/[id]/page.js](app/admin-transaksi/edit/[id]/page.js:31-36)

Jika user mencoba akses URL edit transaksi yang sudah diterima, akan di-redirect:

```javascript
if (trx.status === 'diterima') {
  alert("Transaksi yang sudah diterima tidak bisa diubah!");
  router.push("/admin-transaksi");
  return;
}
```

### 3. API Backend Protection - UPDATE
**File:** [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js:35-41)

```javascript
// 🛡️ PROTEKSI: Tidak bisa edit transaksi yang sudah diterima
if (oldTransaction.status === 'diterima') {
  return Response.json(
    { error: "Transaksi yang sudah diterima tidak bisa diubah" },
    { status: 403 }
  );
}
```

### 4. API Backend Protection - DELETE
**File:** [app/api/admin-transaksi/[id]/route.js](app/api/admin-transaksi/[id]/route.js:180-186)

```javascript
// 🛡️ PROTEKSI: Tidak bisa delete transaksi yang sudah diterima
if (transaction && transaction.status === 'diterima') {
  return Response.json(
    { error: "Transaksi yang sudah diterima tidak bisa dihapus" },
    { status: 403 }
  );
}
```

## Status Transaksi

| Status | Edit | Delete | Keterangan |
|--------|------|--------|------------|
| **pending** | ✅ Yes | ✅ Yes | Belum diproses admin |
| **ditolak** | ✅ Yes | ✅ Yes | Ditolak, bisa diubah keputusan |
| **diterima** | ❌ No | ❌ No | Final, sudah proses poin |

## Kenapa Status "ditolak" Tetap Bisa Diedit?

Admin mungkin perlu:
- Mengubah keputusan dari ditolak menjadi diterima
- Memperbaiki data transaksi sebelum disetujui
- Menghapus transaksi yang memang invalid

Status "ditolak" belum mempengaruhi poin customer, jadi masih aman untuk diedit.

## Security Notes

1. **Triple Layer Protection:**
   - UI Layer (hide buttons)
   - Page Access Layer (redirect)
   - API Layer (403 Forbidden)

2. **Response Codes:**
   - 403 Forbidden untuk transaksi yang sudah diterima
   - Mencegah bypass melalui API calls langsung

3. **User Experience:**
   - Alert jelas untuk user yang mencoba edit
   - Visual indicator "Transaksi selesai" di tabel

## Date Implemented
2025-12-13
