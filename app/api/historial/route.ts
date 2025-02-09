/* eslint-disable */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const historial = await prisma.historial.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limita a las últimas 100 entradas
    })
    return NextResponse.json(historial, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener el historial:', error)
    return NextResponse.json({ error: 'Error al obtener el historial' }, { status: 500 })
  }
}