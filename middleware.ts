import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES  = ['/login', '/register'];
const PROTECTED_ROOT = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de cookie (lo setearemos al hacer login)
  const token = request.cookies.get('bankruptnt_token')?.value;

  const isPublicRoute    = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = !isPublicRoute && !pathname.startsWith('/api') && pathname !== '/';

  // Si no hay token y trata de acceder a ruta protegida → login
  if (!token && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Si hay token y va a login/register → dashboard
  if (token && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = PROTECTED_ROOT;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|models|icons).*)'],
};
