/* eslint-disable */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { name, phone, address, cartItems, total } = await request.json()

        if (!name || !phone || !address || !cartItems || !total) {
            console.error('Datos incompletos recibidos:', { name, phone, address, cartItems, total })
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
        }

        // Crear el pedido (Order) y los ítems del pedido (OrderItems)
        const order = await prisma.order.create({
            data: {
                customerName: name,
                customerPhone: phone,
                customerAddress: address,
                total: total,
                orderItems: {
                    create: cartItems.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    }))
                }
            },
            include: {
                orderItems: true,
            },
        })

        console.log('Pedido creado exitosamente:', order)
        return NextResponse.json(order, { status: 201 })
    } catch (error: any) {
        console.error('Error al crear el pedido:', error.message || error)
        return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        console.log('Órdenes obtenidas:', orders)
        return NextResponse.json(orders, { status: 200 })
    } catch (error: any) {
        console.error('Error al obtener las órdenes:', error.message || error)
        return NextResponse.json({ error: 'Error al obtener las órdenes' }, { status: 500 })
    }
} 