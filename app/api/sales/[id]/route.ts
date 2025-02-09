/* eslint-disable */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { total, paymentMethod, status } = await request.json()

    const ventaExistente = await prisma.sale.findUnique({ where: { id: Number(id) } })
    if (!ventaExistente) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const ventaActualizada = await prisma.sale.update({
      where: { id: Number(id) },
      data: {
        total,
        paymentMethod,
        status
      },
      include: {
        saleProduct: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(ventaActualizada, { status: 200 })
  } catch (error) {
    console.error(`Error en PUT /api/sales/${id}:`, error)
    return NextResponse.json({ error: 'Error al actualizar la venta' }, { status: 500 })
  }
} 

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const ventaExistente = await prisma.sale.findUnique({ where: { id: Number(id) }, include: { saleProduct: true } })
    if (!ventaExistente) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    // Restaurar el stock de productos
    for (const prod of ventaExistente.saleProduct) {
      await prisma.product.update({
        where: { id: prod.productId },
        data: {
          stock: { increment: prod.quantity }
        }
      })
    }

    await prisma.sale.delete({ where: { id: Number(id) } })

    return NextResponse.json({ message: 'Venta eliminada exitosamente' }, { status: 200 })
  } catch (error) {
    console.error(`Error en DELETE /api/sales/${id}:`, error)
    return NextResponse.json({ error: 'Error al eliminar la venta' }, { status: 500 })
  }
}