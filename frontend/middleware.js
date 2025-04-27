import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export function middleware(req) {
  const cookies = parse(req.headers.get('cookie') || '');
  const token = cookies['sb-access-token'];

  const protectedRoutes = ['/', '/lessons', '/profile'];

  const url = req.nextUrl.pathname;

  const needsAuth = protectedRoutes.some((path) => url.startsWith(path));

  if (needsAuth && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*', '/lessons/:path*', '/profile/:path*'],
};
