 import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        almacen_ventas: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al obtener los productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    )
  }
}