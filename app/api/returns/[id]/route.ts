import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const { status } = await request.json()

    const devolucionExistente = await prisma.returnRequest.findUnique({ where: { id: Number(id) } })
    if (!devolucionExistente) {
      return NextResponse.json({ error: 'Solicitud de devolución no encontrada' }, { status: 404 })
    }

    const devolucionActualizada = await prisma.returnRequest.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        sale: true
      }
    })

    // Si la devolución es autorizada, actualizar el stock
    if (status === 'AUTHORIZED') {
      const productosDevolucion = JSON.parse(devolucionActualizada.products) as Array<{ productId: string, quantity: number }>
      for (const prod of productosDevolucion) {
        await prisma.product.update({
          where: { id: prod.productId },
          data: { stock: { increment: prod.quantity } }
        })
      }

      // Actualizar el estado de la venta
      await prisma.sale.update({
        where: { id: devolucionActualizada.saleId },
        data: { status: 'returned' }
      })
    }

    return NextResponse.json(devolucionActualizada, { status: 200 })
  } catch (error) {
    console.error(`Error en PUT /api/returns/${id}:`, error)
    return NextResponse.json({ error: 'Error al actualizar la devolución' }, { status: 500 })
  }
}