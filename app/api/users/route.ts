/* eslint-disable */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const usuarios = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                tokens: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (!usuarios || usuarios.length === 0) {
            return NextResponse.json({ error: 'No se encontraron usuarios' }, { status: 404 })
        }

        return NextResponse.json(usuarios, { status: 200 })
    } catch (error) {
        console.error('Error en GET /api/users:', error)
        return NextResponse.json({ error: 'Error al obtener los usuarios' }, { status: 500 })
    }
}