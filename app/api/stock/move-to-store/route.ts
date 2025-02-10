/* eslint-disable */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { crearEntradaHistorial } from '@/lib/historial'

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json()

    // Iniciar una transacción para asegurar que ambas operaciones se realicen o ninguna
    const result = await prisma.$transaction(async (tx) => {
      // 1. Restar del stock principal
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: { decrement: quantity }
        }
      })

      // 2. Sumar al almacén de ventas (upsert para crear o actualizar)
      const updatedAlmacenVentas = await tx.almacenVentas.upsert({
        where: { productId },
        create: {
          id: productId, // Asumiendo que usas el mismo ID
          productId,
          stock: quantity,
          updatedAt: new Date()

        },
        update: {
          stock: { increment: quantity },
          updatedAt: new Date()
        }
      })

      return { updatedProduct, updatedAlmacenVentas }
    })

    // Definir newStock y otros parámetros segun convenga
    const newStock = result.updatedProduct.stock
    const user = "admin" // O extraer el usuario de la sesión
    const location = "gran almacen" // O el valor que corresponda

    await crearEntradaHistorial(
      'actualizacion_stock',
      `Stock del producto ID: ${productId} actualizado a ${newStock}`,
      user,
      location
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error al mover el stock:', error)
    return NextResponse.json({ error: 'Error al mover el stock: ' + error.message }, { status: 500 })
  }
}