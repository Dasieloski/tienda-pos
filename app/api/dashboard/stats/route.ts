import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET() {
    try {
        // Contar las categorías existentes
        const totalCategories = await db.category.count()

        // Contar los productos existentes
        const totalProducts = await db.product.count()

        // Calcular las ventas mensuales (del mes presente)
        const today = new Date()
        const monthStart = startOfMonth(today)
        const monthEnd = endOfMonth(today)
        const monthlySalesResult = await db.sale.aggregate({
            _sum: { total: true },
            where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                status: "completed",
            },
        })
        const monthlySales = monthlySalesResult._sum.total ? Number(monthlySalesResult._sum.total) : 0

        // Top 5 productos más vendidos (agrupados por productId)
        const topSellingGroups = await db.saleProduct.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            where: { sale: { status: "completed" } },
            take: 5,
        })

        const topSellingProducts = await Promise.all(
            topSellingGroups.map(async (group) => {
                const product = await db.product.findUnique({
                    where: { id: group.productId },
                    select: { name: true, image: true },
                })
                return {
                    image: product?.image || "/placeholder.svg",
                    name: product?.name || "Producto no encontrado",
                    sales: group._sum.quantity || 0,
                }
            })
        )

        // Inventario bajo: productos con stock menor o igual a 5, ya sea en product o en almacen_ventas
        const lowStockProducts = await db.product.findMany({
            where: {
                OR: [
                    { stock: { lte: 5 } },
                    { almacen_ventas: { is: { stock: { lte: 5 } } } },
                ],
            },
            select: {
                name: true,
                image: true,
                stock: true,
                almacen_ventas: { select: { stock: true } },
            },
        })

        // Se utiliza el stock efectivo: si existe en almacen_ventas se usa ese valor, sino el de product.stock
        const lowStockProductsFormatted = lowStockProducts.map((product) => ({
            name: product.name,
            image: product.image,
            stock: product.almacen_ventas ? product.almacen_ventas.stock : product.stock,
        }))

        // Ventas por categoría: obtener los saleProduct de ventas completadas e incluir la categoría del producto
        const saleProducts = await db.saleProduct.findMany({
            where: { sale: { status: "completed" } },
            include: { product: { select: { category: { select: { name: true } } } } },
        })

        const salesByCategoryMap: Record<string, number> = {}
        saleProducts.forEach((sp) => {
            const categoryName = sp.product.category.name
            salesByCategoryMap[categoryName] = (salesByCategoryMap[categoryName] || 0) + sp.quantity
        })
        const salesByCategory = Object.entries(salesByCategoryMap).map(([name, value]) => ({ name, value }))

        // Comparativa de ventas: agrupar las ventas completadas por mes (formato YYYY-MM)
        const sales = await db.sale.findMany({
            where: { status: "completed" },
            select: { total: true, createdAt: true },
        })
        const salesComparisonMap: Record<string, number> = {}
        sales.forEach((sale) => {
            const month = sale.createdAt.toISOString().slice(0, 7)
            salesComparisonMap[month] = (salesComparisonMap[month] || 0) + sale.total
        })
        const salesComparison = Object.entries(salesComparisonMap).map(([month, salesValue]) => ({
            month,
            sales: salesValue,
        }))

        // Ventas por método de pago: agrupar ventas completadas por paymentMethod e incluir su emoji
        const salesByPaymentMethodGroups = await db.sale.groupBy({
            by: ["paymentMethod"],
            _sum: { total: true },
            where: { status: "completed" },
        })
        const paymentMethodEmojis: Record<string, string> = {
            efectivo: "💵",
            tarjeta: "💳",
        }
        const salesByPaymentMethod = salesByPaymentMethodGroups.map((group) => ({
            method: group.paymentMethod,
            emoji: paymentMethodEmojis[group.paymentMethod?.toLowerCase()] || "",
            value: group._sum.total || 0,
        }))

        // Ventas por hora: generar datos para cada una de las 24 horas (formato "HH:00")
        const salesByHourMap: Record<string, number> = {}
        sales.forEach((sale) => {
            const hour = sale.createdAt.getHours().toString().padStart(2, "0")
            salesByHourMap[hour] = (salesByHourMap[hour] || 0) + sale.total
        })
        const salesByHour: { hour: string; sales: number }[] = []
        for (let h = 0; h < 24; h++) {
            const hourStr = String(h).padStart(2, "0")
            salesByHour.push({
                hour: `${hourStr}:00`,
                sales: salesByHourMap[hourStr] || 0,
            })
        }

        return NextResponse.json({
            totalCategories,
            totalProducts,
            monthlySales,
            topSellingProducts,
            lowStockProducts: lowStockProductsFormatted,
            salesByCategory,
            salesComparison,
            salesByPaymentMethod,
            salesByHour,
        })
    } catch (error) {
        console.error("Error en /api/dashboard/stats: ", error)
        return NextResponse.json(
            {
                error: "Error al obtener estadísticas",
                details: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        )
    }
}