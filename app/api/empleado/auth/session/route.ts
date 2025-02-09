/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server/auth'

export async function GET(request: NextRequest) {
    try {
        // Obtener el valor de la cookie 'session' desde el objeto 'request'
        const sessionToken = request.cookies.get('session')?.value
        console.log('Ruta /api/empleado/auth/session - Session Token:', sessionToken)
        
        // Verificar la sesión usando el token obtenido
        const session = await getSession(sessionToken)
        console.log('Ruta /api/empleado/auth/session - Session Data:', session)
        
        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        return NextResponse.json({ 
            authenticated: true, 
            session: {
                id: session.id,
                role: session.role
            }
        })
    } catch (error: any) {
        console.error('Error en la verificación de sesión:', error)
        return NextResponse.json(
            { authenticated: false, message: error.message }, 
            { status: 401 }
        )
    }
}