# Dokumentasi Keamanan Sistem

## 🔐 Fitur Keamanan yang Telah Diimplementasikan

### 1. **JWT (JSON Web Token) Authentication**
- Menggunakan library **jose** (Edge Runtime compatible)
- Setiap login menghasilkan token JWT yang valid selama 24 jam
- Token berisi informasi: userId, email, dan role
- Token disimpan di:
  - **HttpOnly Cookie** (utama - tidak bisa diakses JavaScript)
  - **localStorage** (backup untuk API requests)
- Algorithm: **HS256** (HMAC with SHA-256)

### 2. **Middleware Route Protection**
File: `middleware.js`

Melindungi halaman-halaman berikut:
- `/owner-dashboard/*` - Hanya role: **owner**
- `/owner-laporan/*` - Hanya role: **owner**
- `/owner-poin/*` - Hanya role: **owner**
- `/admin-dashboard/*` - Hanya role: **admin**
- `/admin-product/*` - Hanya role: **admin**
- `/admin-transaksi/*` - Hanya role: **admin**
- `/admin-pelanggan/*` - Hanya role: **admin**
- `/admin-poin/*` - Hanya role: **admin**
- `/home/*` - Semua user yang login

**Cara Kerja:**
1. Setiap request ke halaman protected akan dicek tokennya
2. Jika tidak ada token → redirect ke `/login`
3. Jika token expired → redirect ke `/login?error=session-expired`
4. Jika role tidak sesuai → redirect ke `/login?error=unauthorized`
5. Jika valid → akses diberikan

### 3. **API Endpoints**

#### a. Login API (`/api/login`)
- Verifikasi email & password
- Generate JWT token
- Set HttpOnly cookie
- Return user info + token

#### b. Logout API (`/api/logout`)
- Hapus auth cookie
- Clear session

#### c. Verify Token API (`/api/verify-token`)
- Validasi token dari cookie
- Return user info jika valid

### 4. **Proteksi Ganda**
- **Server-side**: Middleware Next.js (tidak bisa di-bypass)
- **Client-side**: useEffect checks (UI protection)

---

## 🚨 Skenario Serangan yang DICEGAH

### ❌ Skenario 1: Share URL ke Orang Lain
**Sebelum:**
```
Owner share: https://yourapp.com/owner-dashboard
Orang lain buka → BISA AKSES ❌
```

**Sesudah:**
```
Owner share: https://yourapp.com/owner-dashboard
Orang lain buka → Middleware cek token
Token tidak ada → REDIRECT ke /login ✅
```

### ❌ Skenario 2: Manipulasi localStorage
**Sebelum:**
```javascript
localStorage.setItem('role', 'owner')
localStorage.setItem('isLoggedIn', 'true')
// Refresh → BISA AKSES ❌
```

**Sesudah:**
```javascript
localStorage.setItem('role', 'owner')
localStorage.setItem('isLoggedIn', 'true')
// Refresh → Middleware cek JWT cookie
// Cookie tidak ada/invalid → REDIRECT ke /login ✅
```

### ❌ Skenario 3: Token Expired
```
User login → token berlaku 24 jam
Setelah 24 jam → token expired
Akses halaman → REDIRECT ke /login?error=session-expired ✅
```

### ❌ Skenario 4: Role Escalation
```
User biasa coba akses /owner-dashboard
Middleware cek: role = 'customer' ≠ 'owner'
→ REDIRECT ke /login?error=unauthorized ✅
```

---

## ⚙️ Konfigurasi

### Environment Variables
Tambahkan di file `.env`:

```env
# JWT Secret - HARUS DIGANTI di production!
JWT_SECRET=your-super-secret-random-string-here

# Generate random string dengan:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Database
DATABASE_URL=your_postgresql_connection_string

# Environment
NODE_ENV=production
```

---

## 🔄 Flow Autentikasi

### Login Flow:
```
1. User input email + password
2. Frontend → POST /api/login
3. Backend verifikasi dari database
4. Generate JWT token (expires: 24h)
5. Set HttpOnly cookie dengan token
6. Return { ok: true, user, token }
7. Frontend simpan token di localStorage (backup)
8. Redirect sesuai role
```

### Protected Route Access Flow:
```
1. User akses /owner-dashboard
2. Middleware.js intercept request
3. Cek cookie 'auth-token'
4. Verify JWT token
5. Cek role === 'owner'
6. ✅ Valid → Lanjutkan ke page
   ❌ Invalid → Redirect to /login
```

### Logout Flow:
```
1. User klik logout
2. Frontend → POST /api/logout
3. Backend hapus auth cookie (maxAge: 0)
4. Frontend clear localStorage
5. Redirect ke /login
```

---

## 📋 Checklist Keamanan

- ✅ JWT Token dengan expiration
- ✅ HttpOnly Cookies (anti XSS)
- ✅ Server-side middleware protection
- ✅ Role-based access control (RBAC)
- ✅ Secure logout mechanism
- ✅ Token verification endpoint
- ⚠️ Password masih plain text (TODO: hash dengan bcrypt)
- ⚠️ HTTPS only di production (set secure: true)

---

## 🔧 Langkah Selanjutnya (Rekomendasi)

### 1. Hash Password dengan Bcrypt
Saat ini password masih plain text. Sebaiknya di-hash:

```javascript
// Di register & login
import bcrypt from 'bcryptjs';

// Register
const hashedPassword = await bcrypt.hash(password, 10);

// Login verification
const isValid = await bcrypt.compare(password, user.password);
```

### 2. Refresh Token
Tambahkan refresh token untuk session yang lebih aman.

### 3. Rate Limiting
Batasi login attempts untuk mencegah brute force.

### 4. HTTPS Enforcement
Di production, pastikan semua request via HTTPS.

---

## ❓ FAQ

**Q: Apakah orang lain bisa akses jika saya share URL?**
A: **TIDAK**. Middleware akan cek JWT token di cookie mereka. Tanpa login, mereka akan di-redirect ke halaman login.

**Q: Bagaimana jika token expired?**
A: User akan otomatis di-redirect ke login dengan pesan "session-expired".

**Q: Apakah aman menyimpan token di localStorage?**
A: Token utama disimpan di **HttpOnly Cookie** yang tidak bisa diakses JavaScript (aman dari XSS). localStorage hanya backup untuk API requests.

**Q: Berapa lama token berlaku?**
A: 24 jam. Setelah itu user harus login ulang.

---

© 2024 - Sistem Keamanan by SPLSK Team
