import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                almacen_ventas: true, // Asegúrate de tener la relación definida en tu esquema de Prisma
                category: true
            },
        });

        const formattedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            mainWarehouseQuantity: product.stock,
            salesWarehouseQuantity: product.almacen_ventas
                ? product.almacen_ventas.stock
                : 0,
            category: product.category.name,
            image: product.image,
        }));

        return NextResponse.json(formattedProducts);
    } catch (error: any) {
        console.error('Error al obtener los productos:', error);
        return NextResponse.json(
            { error: 'Error al obtener los productos' },
            { status: 500 }
        );
    }
}