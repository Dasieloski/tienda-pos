import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession } from '@/lib/server/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        // Opcional: Actualizar la sesión si es necesario
        const updatedSession = await updateSession(request)
        return NextResponse.json({ authenticated: true, session: updatedSession })
    } catch (error: any) {
        return NextResponse.json({ authenticated: false, message: error.message }, { status: 401 })
    }
}