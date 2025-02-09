import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Definir rutas protegidas y los roles permitidos
  const protectedRoutes = [
    { path: '/admin', roles: ['ADMIN'] },
    { path: '/empleado', roles: ['ADMIN', 'EMPLOYEE'] },
  ];

  for (const route of protectedRoutes) {
    if (
      pathname.startsWith(route.path) &&
      !pathname.startsWith(`${route.path}/auth/login`)
    ) {
      const session = request.cookies.get('session')?.value;

      if (!session) {
        const loginPath =
          route.path === '/admin' ? '/admin/auth/login' : '/empleado/login';
        return NextResponse.redirect(new URL(loginPath, request.url));
      }

      try {
        const sessionData = await getSession(session);
        if (!sessionData || !route.roles.includes(sessionData.role)) {
          // Redirigir a una página de acceso denegado o al login
          const unauthorizedPath =
            route.path === '/admin' ? '/admin/auth/login' : '/empleado/login';
          return NextResponse.redirect(new URL(unauthorizedPath, request.url));
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        const loginPath =
          route.path === '/admin' ? '/admin/auth/login' : '/empleado/login';
        return NextResponse.redirect(new URL(loginPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/empleado/:path*',
  /*   '!/admin/auth/login',
    '!/empleado/login', */
  ],
};