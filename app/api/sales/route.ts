/* eslint-disable */
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { crearEntradaHistorial } from '@/lib/historial'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { products, total, paymentMethod } = body
        const user = 'empleado@example.com' // Reemplaza esto con el usuario actual
        const location = 'Empleados-Ventas'

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: 'Productos inválidos' },
                { status: 400 }
            )
        }

        // Obtener detalles de los productos (nombre y categoría)
        const productDetails = await Promise.all(products.map(async (product: any) => {
            const prod = await prisma.product.findUnique({
                where: { id: product.productId },
                include: { category: true }
            })
            if (prod) {
                return `${prod.name} (${prod.category.name})`
            } else {
                return `Producto ID: ${product.productId}`
            }
        }))

        // Crear la venta
        const sale = await prisma.sale.create({
            data: {
                total: parseFloat(total.toString()),
                paymentMethod: paymentMethod.toLowerCase(), // → Se transforma a minúsculas
                status: "completed",
                updatedAt: new Date(),
                saleProduct: {
                    create: products.map((product: any) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                        price: parseFloat(product.price.toString())
                    }))
                }
            },
            include: {
                saleProduct: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Registrar en el historial con detalles de productos
        const detallesVenta = `Venta realizada con ID: ${sale.id}, Total: ${total}, Método de Pago: ${paymentMethod}. Productos: ${productDetails.join(', ')}.`

        await crearEntradaHistorial(
            'venta',
            detallesVenta,
            user,
            location
        )

        // Actualizar el stock en almacen_ventas
        await Promise.all(products.map(product => 
            prisma.almacenVentas.update({
                where: {
                    productId: product.productId
                },
                data: {
                    stock: {
                        decrement: product.quantity
                    }
                }
            })
        ))

        return NextResponse.json(sale, { status: 201 })
    } catch (error: any) {
        console.error('Error al procesar la venta:', error)
        return NextResponse.json({ error: error.message || 'Error al procesar la venta' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const sales = await prisma.sale.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 10, // Obtener las últimas 10 ventas
            include: {
                saleProduct: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(sales, { status: 200 })
    } catch (error) {
        console.error('Error al obtener las ventas:', error)
        return NextResponse.json(
            { error: 'Error al obtener las ventas' },
            { status: 500 }
        )
    }
}