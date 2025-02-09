import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const devoluciones = await prisma.returnRequest.findMany({
      include: {
        sale: {
          include: {
            saleProduct: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!devoluciones || devoluciones.length === 0) {
      return NextResponse.json({ error: 'No se encontraron solicitudes de devolución' }, { status: 404 })
    }

    return NextResponse.json(devoluciones, { status: 200 })
  } catch (error) {
    console.error('Error en GET /api/returns:', error)
    return NextResponse.json({ error: 'Error al obtener las devoluciones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { saleId, products, total } = await request.json()

    if (!saleId || !products || !total) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const venta = await prisma.sale.findUnique({ where: { id: saleId } })
    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const nuevaDevolucion = await prisma.returnRequest.create({
      data: {
        saleId,
        products,
        total,
        status: 'PENDING'
      },
      include: {
        sale: {
          include: {
            saleProduct: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(nuevaDevolucion, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/returns:', error)
    return NextResponse.json({ error: 'Error al crear la devolución' }, { status: 500 })
  }
}