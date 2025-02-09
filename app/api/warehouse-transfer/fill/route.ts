/* eslint-disable */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UpdatedProduct = {
    id: string;
    name: string;
    mainWarehouseQuantity: number;
    salesWarehouseQuantity: number;
    category: string; // Añadido
    image: string;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.products || !Array.isArray(body.products)) {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
        }

        const updatedProducts: UpdatedProduct[] = [];

        for (const item of body.products) {
            const { id } = item;

            if (!id) {
                throw new Error("ID del producto es requerido");
            }

            // Ejecutar cada transferencia dentro de su propia transacción
            const transferResult = await prisma.$transaction(async (tx) => {
                const product = await tx.product.findUnique({
                    where: { id },
                    include: { almacen_ventas: true,
                         category: true, // Añadido
                     },
                });

                if (!product) {
                    throw new Error(`Producto con ID ${id} no encontrado`);
                }

                const currentSales = product.almacen_ventas ? product.almacen_ventas.stock : 0;
                const missing = 5 - currentSales;

                if (missing <= 0) {
                    return {
                        id: product.id,
                        name: product.name,
                        mainWarehouseQuantity: product.stock,
                        salesWarehouseQuantity: currentSales,
                        category: product.category.name, // Añadido
                        image: product.image,
                    };
                }

                if (product.stock < missing) {
                    throw new Error(`Stock insuficiente en el almacén principal para ${product.name}`);
                }

                // Actualizar el stock del almacén principal
                const updatedProduct = await tx.product.update({
                    where: { id },
                    data: { stock: { decrement: missing } },
                });

                // Actualizar o crear el registro en almacen_ventas
                const updatedSales = await tx.almacenVentas.upsert({
                    where: { productId: id },
                    create: {
                        id: id,
                        productId: id,
                        stock: missing,
                    },
                    update: {
                        stock: { increment: missing },
                        updatedAt: new Date(),
                    },
                });

                return {
                    id: product.id,
                    name: product.name,
                    mainWarehouseQuantity: updatedProduct.stock,
                    salesWarehouseQuantity: updatedSales.stock,
                    image: product.image,
                };
            });

            updatedProducts.push(transferResult);
        }

        return NextResponse.json(updatedProducts, { status: 200 });
    } catch (error: any) {
        console.error("Error en transferencia:", error);
        const message = error?.message || "Error desconocido";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}