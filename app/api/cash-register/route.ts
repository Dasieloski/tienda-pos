/* eslint-disable */
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
    try {
        const today = new Date()
        const startOfToday = startOfDay(today)
        const endOfToday = endOfDay(today)

        // Obtener todas las ventas del día
        const sales = await db.sale.findMany({
            where: {
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                status: "completed"
            }
        })

        // Calcular totales
        const totalSales = sales.length
        const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0)

        return NextResponse.json({
            totalSales,
            totalAmount
        })
    } catch (error) {
        console.error('Error al obtener el estado de caja:', error)
        return NextResponse.json(
            { error: 'Error al obtener el estado de caja' },
            { status: 500 }
        )
    }
}

// Esta función se ejecutará automáticamente a las 11:59 PM
export async function POST() {
    try {
        const today = new Date()
        const startOfToday = startOfDay(today)
        const endOfToday = endOfDay(today)

        // Obtener todas las ventas del día
        const sales = await db.sale.findMany({
            where: {
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                status: "completed"
            }
        })

        // Calcular totales
        const totalSales = sales.length
        const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0)

        // Guardar el registro del día
        await db.cashRegister.create({
            data: {
                date: today,
                totalSales,
                totalAmount,
                updatedAt: today
            }
        })

        return NextResponse.json({ message: 'Registro de caja guardado exitosamente' })
    } catch (error) {
        console.error('Error al guardar el registro de caja:', error)
        return NextResponse.json(
            { error: 'Error al guardar el registro de caja' },
            { status: 500 }
        )
    }
} 