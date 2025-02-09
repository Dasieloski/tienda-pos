/* eslint-disable */
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { products, total, paymentMethod } = body

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: 'Productos inválidos' },
                { status: 400 }
            )
        }

        // Crear la venta
        const sale = await db.sale.create({
            data: {
                total: parseFloat(total.toString()),
                paymentMethod: paymentMethod || 'efectivo',
                status: "completed",
                updatedAt: new Date(),
                saleProduct: {
                    create: products.map((product) => ({
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
        })

        // Actualizar el stock en almacen_ventas
        await Promise.all(products.map(product => 
            db.almacenVentas.update({
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
    } catch (error) {
        console.error('Error al crear la venta:', error)
        
        // Mejorar el mensaje de error basado en el tipo de error
        let errorMessage = 'Error al procesar la venta'
        if (error instanceof Error) {
            errorMessage = error.message
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const sales = await db.sale.findMany({
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