import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { productId, quantity } = await req.json()

        // Iniciar una transacción para asegurar que ambas operaciones se realicen o ninguna
        const result = await prisma.$transaction(async (tx) => {
            // 1. Restar del stock principal
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: {
                    stock: {
                        decrement: quantity
                    }
                }
            })

            // 2. Sumar al almacén de ventas (upsert para crear o actualizar)
            const updatedAlmacenVentas = await tx.almacen_ventas.upsert({
                where: { productId },
                create: {
                    id: productId, // Asumiendo que usas el mismo ID
                    productId,
                    stock: quantity,
                    updatedAt: new Date()
                },
                update: {
                    stock: {
                        increment: quantity
                    },
                    updatedAt: new Date()
                }
            })

            return { updatedProduct, updatedAlmacenVentas }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error al mover el stock:', error)
        return NextResponse.json(
            { error: 'Error al mover el stock: ' + error.message },
            { status: 500 }
        )
    }
}