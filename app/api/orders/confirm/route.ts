/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'ID de orden faltante' }, { status: 400 })
        }

        // Iniciar una transacción para asegurar la atomicidad
        const result = await prisma.$transaction(async (prisma) => {
            // Obtener la orden con sus items
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true },
            })

            if (!order) {
                throw new Error('Orden no encontrada')
            }

            if (order.status === OrderStatus.CONFIRMED) {
                throw new Error('La orden ya está confirmada')
            }

            // Actualizar el stock de cada producto
            for (const item of order.orderItems) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                })

                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`)
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para el producto ${product.name}`)
                }

                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: product.stock - item.quantity,
                    },
                })
            }

            // Marcar la orden como confirmada
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.CONFIRMED,
                },
            })

            return updatedOrder
        })

        console.log('Orden confirmada exitosamente:', result)
        return NextResponse.json({ message: 'Orden confirmada y stock actualizado exitosamente' }, { status: 200 })
    } catch (error: any) {
        console.error('Error al confirmar la orden:', error.message || error)
        return NextResponse.json({ error: error.message || 'Error al confirmar la orden' }, { status: 500 })
    }
}