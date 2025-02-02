/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, context: { params: { id: string } }) {
    const { id } = context.params

    if (!id) {
        return NextResponse.json({ error: 'ID de orden faltante' }, { status: 400 })
    }

    try {
        // Obtener la orden antes de eliminarla para poder restablecer el stock
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { orderItems: true },
        })

        if (!order) {
            return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
        }

        // Iniciar una transacción para asegurar la atomicidad
        await prisma.$transaction(async (prisma) => {
            // Si la orden ya fue confirmada, restaurar el stock
            if (order.status === OrderStatus.CONFIRMED) {
                for (const item of order.orderItems) {
                    const product = await prisma.product.findUnique({
                        where: { id: item.productId },
                    })

                    if (product) {
                        await prisma.product.update({
                            where: { id: item.productId },
                            data: {
                                stock: product.stock + item.quantity,
                            },
                        })
                    }
                }
            }

            // Eliminar los ítems de la orden
            await prisma.orderItem.deleteMany({
                where: { orderId: Number(id) },
            })

            // Finalmente, eliminar la orden
            await prisma.order.delete({
                where: { id: Number(id) },
            })
        })

        console.log(`Orden #${id} eliminada exitosamente`)
        return NextResponse.json({ message: 'Orden eliminada exitosamente' }, { status: 200 })
    } catch (error: any) {
        console.error('Error al eliminar la orden:', error.message || error)
        return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params

    if (!id) {
        return NextResponse.json({ error: 'ID de orden faltante' }, { status: 400 })
    }

    try {
        const { customerName, customerPhone, customerAddress, orderItems } = await request.json()

        if (!customerName || !customerPhone || !customerAddress || !orderItems) {
            return NextResponse.json({ error: 'Datos incompletos para actualizar la orden' }, { status: 400 })
        }

        // Obtener la orden actual
        const currentOrder = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { orderItems: true },
        })

        if (!currentOrder) {
            return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
        }

        if (currentOrder.status === OrderStatus.CONFIRMED) {
            return NextResponse.json({ error: 'No se puede modificar una orden confirmada' }, { status: 400 })
        }

        // Iniciar una transacción para actualizar la orden y ajustar el stock
        const updatedOrder = await prisma.$transaction(async (prisma) => {
            // Calcular diferencias en cantidades para ajustar el stock
            for (const item of orderItems) {
                const existingItem = currentOrder.orderItems.find(oi => oi.productId === item.productId)
                const quantityDifference = (item.quantity || 0) - (existingItem?.quantity || 0)

                if (quantityDifference !== 0) {
                    const product = await prisma.product.findUnique({
                        where: { id: item.productId },
                    })

                    if (!product) {
                        throw new Error(`Producto con ID ${item.productId} no encontrado`)
                    }

                    if (quantityDifference > 0 && product.stock < quantityDifference) {
                        throw new Error(`Stock insuficiente para el producto ${product.name}`)
                    }

                    // Actualizar el stock
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: product.stock - quantityDifference,
                        },
                    })
                }
            }

            // Actualizar la orden y sus ítems
            const orderUpdated = await prisma.order.update({
                where: { id: Number(id) },
                data: {
                    customerName,
                    customerPhone,
                    customerAddress,
                    orderItems: {
                        deleteMany: {}, // Eliminar todos los ítems actuales
                        create: orderItems.map((item: any) => ({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: { orderItems: true },
            })

            return orderUpdated
        })

        console.log(`Orden #${id} actualizada exitosamente`)
        return NextResponse.json(updatedOrder, { status: 200 })
    } catch (error: any) {
        console.error('Error al modificar la orden:', error.message || error)
        return NextResponse.json({ error: error.message || 'Error al modificar la orden' }, { status: 500 })
    }
}