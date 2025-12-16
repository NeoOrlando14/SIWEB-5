# Testing Keamanan Sistem

## 🧪 Cara Test Proteksi Keamanan

### Test 1: Akses Tanpa Login
**Skenario:** Orang lain dapat URL dari Anda dan coba akses

1. Buka browser **incognito/private** mode
2. Paste URL: `http://localhost:3002/owner-dashboard`
3. **Expected Result:** Otomatis redirect ke `/login`

✅ **PASS** jika redirect ke login
❌ **FAIL** jika bisa akses dashboard

---

### Test 2: Manipulasi localStorage
**Skenario:** Hacker coba manipulasi localStorage untuk akses halaman

1. Buka browser incognito
2. Buka `http://localhost:3002/owner-dashboard`
3. Buka DevTools (F12) → Console
4. Ketik:
```javascript
localStorage.setItem('role', 'owner')
localStorage.setItem('isLoggedIn', 'true')
localStorage.setItem('email', 'fake@email.com')
```
5. Refresh halaman (F5)
6. **Expected Result:** Tetap redirect ke `/login` karena tidak ada JWT token

✅ **PASS** jika tetap redirect ke login
❌ **FAIL** jika bisa akses dashboard

---

### Test 3: Share URL ke Browser Lain
**Skenario:** Anda login sebagai owner, lalu share URL ke teman

1. **Browser A:** Login sebagai owner
2. **Browser A:** Copy URL: `http://localhost:3002/owner-dashboard`
3. **Browser B (atau incognito):** Paste URL tersebut
4. **Expected Result:** Browser B redirect ke `/login`

✅ **PASS** jika Browser B tidak bisa akses
❌ **FAIL** jika Browser B bisa akses

---

### Test 4: Copy Cookie ke Browser Lain (Advanced)
**Skenario:** Hacker coba copy cookie

1. **Browser A:** Login sebagai owner
2. **Browser A:** DevTools (F12) → Application → Cookies
3. **Browser A:** Copy value dari cookie `auth-token`
4. **Browser B:** Buka `http://localhost:3002/owner-dashboard`
5. **Browser B:** DevTools → Application → Cookies
6. **Browser B:** Tambah cookie `auth-token` dengan value dari Browser A
7. **Browser B:** Refresh halaman

**Expected Result:**
- Jika cookie di-set dengan benar (domain, path sama) → Bisa akses ✅ (ini normal behavior)
- Ini menunjukkan token bekerja dengan benar
- Di production, gunakan HTTPS + Secure flag untuk mencegah cookie stealing

---

### Test 5: Token Expiration
**Skenario:** Token expired setelah 24 jam

1. Login sebagai owner
2. **MANUAL TEST:** Edit code sementara, ubah `expiresIn: '24h'` menjadi `expiresIn: '10s'`
3. Tunggu 10 detik
4. Coba akses `/owner-dashboard`
5. **Expected Result:** Redirect ke `/login?error=session-expired`

✅ **PASS** jika redirect dengan error message
❌ **FAIL** jika masih bisa akses

---

### Test 6: Role-Based Access Control
**Skenario:** User biasa coba akses halaman owner

1. Login dengan akun **customer** (bukan owner/admin)
2. Manual ketik URL: `http://localhost:3002/owner-dashboard`
3. **Expected Result:** Redirect ke `/login?error=unauthorized`

✅ **PASS** jika redirect dengan error unauthorized
❌ **FAIL** jika bisa akses

---

### Test 7: Logout Mechanism
**Skenario:** Setelah logout, token harus di-clear

1. Login sebagai owner
2. Akses `/owner-dashboard` (berhasil)
3. Klik tombol **Logout**
4. **Check:**
   - DevTools → Application → Cookies → `auth-token` harus **hilang** atau **expired**
   - localStorage harus **kosong**
5. Tekan **Back** button di browser
6. **Expected Result:** Redirect ke `/login`

✅ **PASS** jika cookie hilang dan redirect ke login
❌ **FAIL** jika masih bisa akses

---

### Test 8: Multiple Tabs
**Skenario:** Logout di satu tab, tab lain harus ikut logout

1. Login sebagai owner
2. Buka `/owner-dashboard` di **2 tabs**
3. Di **Tab 1:** Klik logout
4. Di **Tab 2:** Coba navigasi atau refresh
5. **Expected Result:** Tab 2 redirect ke `/login`

✅ **PASS** jika Tab 2 redirect
❌ **FAIL** jika Tab 2 masih bisa akses

---

## 🔍 Cara Monitoring

### Check Token di Browser
1. F12 → Application → Cookies
2. Cari cookie: `auth-token`
3. Properties yang harus ada:
   - ✅ HttpOnly: Yes
   - ✅ Secure: Yes (di production)
   - ✅ SameSite: Strict
   - ✅ Path: /

### Check Token Payload
Paste token ke: https://jwt.io

Anda akan lihat payload:
```json
{
  "userId": 123,
  "email": "owner@example.com",
  "role": "owner",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 📊 Test Checklist

| Test | Description | Status |
|------|-------------|--------|
| 1 | Akses tanpa login | ⬜ |
| 2 | Manipulasi localStorage | ⬜ |
| 3 | Share URL ke browser lain | ⬜ |
| 4 | Copy cookie | ⬜ |
| 5 | Token expiration | ⬜ |
| 6 | Role-based access | ⬜ |
| 7 | Logout mechanism | ⬜ |
| 8 | Multiple tabs | ⬜ |

---

## 🐛 Troubleshooting

### Problem: Selalu redirect ke login meskipun sudah login
**Kemungkinan Penyebab:**
1. JWT_SECRET berbeda antara saat generate dan verify
2. Cookie tidak ter-set (check DevTools)
3. Domain/path cookie tidak match

**Solusi:**
- Check console untuk error JWT verification
- Pastikan JWT_SECRET konsisten di semua API routes

### Problem: Token tidak ada di cookie
**Kemungkinan Penyebab:**
1. Response dari `/api/login` tidak set cookie
2. Browser block third-party cookies

**Solusi:**
- Check Network tab → Login request → Response headers
- Pastikan ada `Set-Cookie: auth-token=...`

---

## ✅ Production Checklist

Sebelum deploy ke production:

- [ ] Ganti `JWT_SECRET` dengan random string yang kuat
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set cookie `secure: true`
- [ ] Hash password dengan bcrypt
- [ ] Setup rate limiting untuk login
- [ ] Setup monitoring & logging
- [ ] Backup database secara berkala

---

© 2024 - Security Testing Guide by SPLSK Team
