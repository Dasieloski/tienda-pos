import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/server/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware - Pathname: ${pathname}`);

  // Excluir la ruta de login para empleados
  if (pathname.startsWith('/empleado/login')) {
    console.log('Middleware - Excluyendo /empleado/login');
    return NextResponse.next();
  }

  const protectedRoutes = [
    { path: '/admin', roles: ['ADMIN'] },
    { path: '/empleado', roles: ['ADMIN', 'EMPLOYEE'] },
  ];

  for (const route of protectedRoutes) {
    if (
      pathname.startsWith(route.path) &&
      !pathname.startsWith(`${route.path}/auth/login`) &&
      !pathname.startsWith(`/api/${route.path.split('/')[1]}/auth/session`)
    ) {
      const session = request.cookies.get('session')?.value;
      console.log(`Middleware - Session: ${session}`);

      if (!session) {
        const loginPath =
          route.path === '/admin' ? '/admin/auth/login' : '/empleado/login';
        console.log(`Middleware - Redirigiendo a ${loginPath} por falta de sesión`);
        return NextResponse.redirect(new URL(loginPath, request.url));
      }

      try {
        const sessionData = await getSession(session);
        console.log('Middleware - Session Data:', sessionData);
        if (!sessionData || !route.roles.includes(sessionData.role)) {
          const unauthorizedPath =
            route.path === '/admin' ? '/admin/auth/login' : '/empleado/login';
          console.log(`Middleware - Redirigiendo a ${unauthorizedPath} por acceso denegado`);
          return NextResponse.redirect(new URL(unauthorizedPath, request.url));
        }
      } catch (error) {
        console.error('Error al verificar la sesión en middleware:', error);
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
    /* '!/admin/auth/login/:path*',
    '!/empleado/login/:path*',
    '!/api/admin/auth/session',
    '!/api/empleado/auth/session', */
  ],
};