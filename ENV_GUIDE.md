# Panduan Environment Variables (.env)

## 📁 Perbedaan `.env` vs `.env.example`

### `.env` (File Asli - RAHASIA!)
- ✅ **Berisi nilai ASLI** yang digunakan aplikasi
- ✅ **SUDAH DIISI** dengan secret keys yang valid
- 🚫 **TIDAK BOLEH** di-commit ke Git
- 🚫 **TIDAK BOLEH** dibagikan ke orang lain
- 🔒 **HARUS DIRAHASIAKAN** (seperti password)

**Contoh isi `.env`:**
```env
JWT_SECRET=b2ca2a01fc04b446413e8a7874614c9e432a3c30d625397f30247bffd62aa4c5
DATABASE_URL=postgresql://user:password@host/database
```

---

### `.env.example` (Template - AMAN dibagikan)
- ✅ **Template/contoh** format environment variables
- ✅ **Berisi placeholder** (tidak ada nilai asli)
- ✅ **AMAN** di-commit ke Git
- ✅ **AMAN** dibagikan ke tim
- 📝 **Panduan** untuk setup .env di komputer lain

**Contoh isi `.env.example`:**
```env
JWT_SECRET=your-secret-key-change-in-production-2024
DATABASE_URL=your_postgresql_connection_string_here
```

---

## 🎯 Kenapa Pisah File?

### Skenario Kerja Tim:

**Developer A (Anda):**
```
.env → JWT_SECRET=abc123xyz (rahasia Anda)
.env → DATABASE_URL=postgresql://localhost/mydb
```

**Developer B (Teman Anda):**
```
.env → JWT_SECRET=def456uvw (rahasia dia)
.env → DATABASE_URL=postgresql://localhost/hisdb
```

**Di Git Repository:**
```
.env.example → JWT_SECRET=your-secret-here (template saja)
.env.example → DATABASE_URL=your-database-url-here
```

Setiap developer punya `.env` sendiri dengan credential masing-masing, tapi semua tahu format yang harus diisi dari `.env.example`.

---

## 🔐 Keamanan `.env`

### Sudah Terproteksi:
✅ File `.env` ada di `.gitignore` → tidak akan ter-commit
✅ JWT_SECRET sudah di-generate dengan crypto yang aman (64 karakter random)

### Yang TIDAK BOLEH Dilakukan:
❌ Push `.env` ke GitHub/GitLab
❌ Screenshot `.env` dan share ke orang lain
❌ Copy-paste isi `.env` di chat/email
❌ Commit `.env` ke version control

### Yang BOLEH Dilakukan:
✅ Share `.env.example` ke tim
✅ Dokumentasi di README cara setup `.env`
✅ Simpan backup `.env` di password manager pribadi

---

## 🚀 Setup untuk Developer Baru

Jika teman Anda clone project ini:

1. **Clone repository:**
```bash
git clone https://github.com/your-repo.git
cd your-repo
```

2. **Copy template `.env.example` → `.env`:**
```bash
cp .env.example .env
```

3. **Edit `.env` dan isi nilai asli:**
```env
# Ganti dengan database mereka
DATABASE_URL=postgresql://...

# Generate JWT secret baru
JWT_SECRET=[hasil dari: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

NODE_ENV=development
```

4. **Install dependencies dan jalankan:**
```bash
npm install
npm run dev
```

---

## 📝 File `.env` Anda Saat Ini

File `.env` Anda **SUDAH LENGKAP** dengan:

✅ **DATABASE_URL** - Koneksi ke Neon PostgreSQL
✅ **JWT_SECRET** - Random secure key (64 karakter)
✅ **NODE_ENV** - development mode

**Anda tidak perlu melakukan apapun lagi!** Sistem sudah siap digunakan.

---

## 🔄 Update JWT_SECRET (Opsional)

Jika suatu saat Anda ingin ganti JWT_SECRET baru:

1. Generate key baru:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Copy hasilnya ke `.env`:
```env
JWT_SECRET=hasil_generate_tadi
```

3. Restart server:
```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

⚠️ **CATATAN:** Semua user yang sudah login akan otomatis logout karena token lama tidak valid lagi.

---

## 📊 Environment Variables yang Ada

| Variable | Fungsi | Wajib? | Sudah Ada? |
|----------|--------|--------|------------|
| `DATABASE_URL` | Koneksi database PostgreSQL | ✅ Ya | ✅ Ya |
| `JWT_SECRET` | Secret key untuk JWT authentication | ✅ Ya | ✅ Ya |
| `NODE_ENV` | Environment mode (development/production) | ✅ Ya | ✅ Ya |

---

## 🐛 Troubleshooting

### Problem: "JWT_SECRET is not defined"
**Solusi:**
1. Pastikan file `.env` ada di root project
2. Restart dev server: `Ctrl+C` lalu `npm run dev`
3. Check isi `.env` ada baris `JWT_SECRET=...`

### Problem: "Cannot connect to database"
**Solusi:**
1. Check `DATABASE_URL` di `.env` benar
2. Test koneksi ke Neon database

### Problem: Token tidak valid setelah update JWT_SECRET
**Solusi:**
- Ini **normal behavior**
- Semua user harus login ulang
- Clear localStorage dan cookies, lalu login lagi

---

## ✅ Checklist

- [x] File `.env` sudah ada
- [x] `JWT_SECRET` sudah terisi dengan nilai aman
- [x] `DATABASE_URL` sudah terisi
- [x] `NODE_ENV` sudah terisi
- [x] `.env` tidak akan ter-commit ke Git
- [x] `.env.example` ada sebagai template

**Sistem Anda sudah siap digunakan!** 🎉

---

© 2024 - Environment Variables Guide by SPLSK Team
