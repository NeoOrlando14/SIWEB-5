import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024'
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Daftar halaman yang memerlukan autentikasi
  const protectedRoutes = {
    '/owner-dashboard': 'owner',
    '/owner-laporan': 'owner',
    '/owner-poin': 'owner',
    '/admin-dashboard': 'admin',
    '/admin-product': 'admin',
    '/admin-transaksi': 'admin',
    '/admin-pelanggan': 'admin',
    '/admin-poin': 'admin',
    '/home': 'customer', // customer atau role apapun yang sudah login
  };

  // Cek apakah route ini protected
  const requiredRole = protectedRoutes[pathname];

  if (requiredRole) {
    // Ambil token dari cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Tidak ada token, redirect ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token menggunakan jose (edge runtime compatible)
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Cek role sesuai
      if (requiredRole !== 'customer' && payload.role !== requiredRole) {
        // Role tidak sesuai, redirect ke login dengan pesan
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }

      // Token valid dan role sesuai, lanjutkan
      return NextResponse.next();
    } catch (error) {
      // Token tidak valid atau expired
      console.error('JWT Verification Error:', error.message);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session-expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Route tidak protected, lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/owner-dashboard/:path*',
    '/owner-laporan/:path*',
    '/owner-poin/:path*',
    '/admin-dashboard/:path*',
    '/admin-product/:path*',
    '/admin-transaksi/:path*',
    '/admin-pelanggan/:path*',
    '/admin-poin/:path*',
    '/home/:path*',
  ],
};
