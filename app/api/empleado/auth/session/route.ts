import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/server/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        
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