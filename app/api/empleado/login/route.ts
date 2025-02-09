/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  try {
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      data = await request.formData();
    }

    const result = await login(data);

    if (result.success) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('session', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
      });
      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Error en la ruta de login:", error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Error desconocido' }, { status: 500 });
  }
} 