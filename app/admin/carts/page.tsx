/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OrderItem {
    id: number
    productId: number
    name: string
    price: number
    quantity: number
}

interface Order {
    id: number
    customerId: number
    customerName: string
    customerAddress: string
    customerPhone: string
    orderItems: OrderItem[]
    total: number
    createdAt: string
    status: string // Asegúrate de tener este campo
}

export default function CustomerCarts() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [filterDate, setFilterDate] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("date")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders", { method: "GET" })
                if (!res.ok) {
                    throw new Error("Error al obtener las órdenes")
                }
                const data: Order[] = await res.json()
                setOrders(data)
                setFilteredOrders(data)
            } catch (error: any) {
                console.error("Error al cargar las órdenes:", error)
                setError("Error al cargar las órdenes")
            }
        }

        fetchOrders()
    }, [])

    useEffect(() => {
        let result = [...orders]
        if (filterDate !== "all") {
            result = result.filter((order) => order.createdAt.startsWith(filterDate))
        }
        result.sort((a, b) => {
            if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            if (sortBy === "total") return b.total - a.total
            return 0
        })
        setFilteredOrders(result)
    }, [filterDate, sortBy, orders])

    // Mapeo de estados a texto y emojis
    const statusMap: Record<string, { text: string; emoji: string }> = {
        CONFIRMED: { text: "Confirmada", emoji: "✅" },
        PENDING: { text: "Pendiente", emoji: "⏳" },
        CANCELLED: { text: "Cancelada", emoji: "❌" },
    }

    const confirmPurchase = async (order: Order) => {
        const confirmation = confirm(`¿Estás seguro de confirmar la orden #${order.id}?`)
        if (!confirmation) return

        setIsLoading(true)
        try {
            const res = await fetch("/api/orders/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Error al confirmar la orden")
            }

            // Actualizar el estado de la orden localmente
            setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: "CONFIRMED" } : o)))
            alert(`Orden #${order.id} confirmada exitosamente y stock actualizado.`)
        } catch (error: any) {
            console.error("Error al confirmar la orden:", error)
            alert(`Error al confirmar la orden: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const deleteOrder = async (id: number) => {
        const confirmation = confirm("¿Estás seguro de que deseas eliminar esta orden?")
        if (!confirmation) return

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Error al eliminar la orden")
            }

            setOrders(orders.filter((order) => order.id !== id))
            alert("Orden eliminada exitosamente")
        } catch (error: any) {
            console.error("Error al eliminar la orden:", error)
            alert(`Error al eliminar la orden: ${error.message}`)
        }
    }

    const modifyOrder = (order: Order) => {
        setSelectedOrder(order)
    }

    const saveModifiedOrder = async (modifiedOrder: Order) => {
        try {
            const res = await fetch(`/api/orders/${modifiedOrder.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(modifiedOrder),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Error al actualizar la orden")
            }

            const updatedOrder: Order = await res.json()
            setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
            alert("Orden actualizada exitosamente")
            setSelectedOrder(null)
        } catch (error: any) {
            console.error("Error al actualizar la orden:", error)
            alert(`Error al actualizar la orden: ${error.message}`)
        }
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">🛒 Órdenes de Clientes</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-between mb-4">
                <Select onValueChange={setFilterDate} value={filterDate}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="🔍 Filtrar por fecha" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las fechas</SelectItem>
                        {orders.map((order) => (
                            <SelectItem key={order.id} value={order.createdAt.split("T")[0]}>
                                {order.createdAt.split("T")[0]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={setSortBy} value={sortBy}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="🔀 Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                    <Card key={order.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Orden #{order.id}</CardTitle>
                            <p className="mt-2">
                                {statusMap[order.status]?.emoji} {statusMap[order.status]?.text || order.status}
                            </p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p>
                                <span className="font-bold">📅 Fecha:</span> {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                                <span className="font-bold">👤 Cliente:</span> {order.customerName}
                            </p>
                            <p>
                                <span className="font-bold">📍 Dirección:</span> {order.customerAddress}
                            </p>
                            <p>
                                <span className="font-bold">📞 Teléfono:</span> {order.customerPhone}
                            </p>
                            <h3 className="font-bold mt-4 mb-2">📦 Productos:</h3>
                            <ul className="list-disc pl-5">
                                {order.orderItems.map((item) => (
                                    <li key={item.productId}>
                                        {item.name} x {item.quantity}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4">
                                <span className="font-bold">💰 Total:</span> ${order.total}
                            </p>
                            <p className="mt-2">
                                <span className="font-bold">📌 Estado:</span> {order.status}
                            </p>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                            {order.status !== "CONFIRMED" && (
                                <Button
                                    onClick={() => confirmPurchase(order)}
                                    className="bg-green-500 hover:bg-green-600 w-full"
                                    disabled={isLoading}
                                >
                                    ✅ Confirmar
                                </Button>
                            )}
                            <Dialog
                                open={selectedOrder?.id === order.id}
                                onOpenChange={(open) => {
                                    if (!open) setSelectedOrder(null)
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="w-full" onClick={() => modifyOrder(order)}>
                                        ✏️ Modificar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Modificar Orden #{order.id}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Nombre
                                            </Label>
                                            <Input
                                                id="name"
                                                defaultValue={order.customerName}
                                                className="col-span-3"
                                                onChange={(e) => {
                                                    if (selectedOrder) {
                                                        setSelectedOrder({ ...selectedOrder, customerName: e.target.value })
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="address" className="text-right">
                                                Dirección
                                            </Label>
                                            <Input
                                                id="address"
                                                defaultValue={order.customerAddress}
                                                className="col-span-3"
                                                onChange={(e) => {
                                                    if (selectedOrder) {
                                                        setSelectedOrder({ ...selectedOrder, customerAddress: e.target.value })
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="phone" className="text-right">
                                                Teléfono
                                            </Label>
                                            <Input
                                                id="phone"
                                                defaultValue={order.customerPhone}
                                                className="col-span-3"
                                                onChange={(e) => {
                                                    if (selectedOrder) {
                                                        setSelectedOrder({ ...selectedOrder, customerPhone: e.target.value })
                                                    }
                                                }}
                                            />
                                        </div>
                                        <h3 className="font-bold mt-4 mb-2">📦 Productos:</h3>
                                        {order.orderItems.map((item) => (
                                            <div key={item.productId} className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor={`quantity-${item.productId}`} className="text-right">
                                                    {item.name}
                                                </Label>
                                                <Input
                                                    id={`quantity-${item.productId}`}
                                                    type="number"
                                                    min={1}
                                                    defaultValue={item.quantity}
                                                    className="col-span-3"
                                                    onChange={(e) => {
                                                        const newQuantity = Number.parseInt(e.target.value, 10)
                                                        if (isNaN(newQuantity) || newQuantity < 1) return
                                                        if (selectedOrder) {
                                                            const updatedItems = selectedOrder.orderItems.map((oi) =>
                                                                oi.productId === item.productId ? { ...oi, quantity: newQuantity } : oi,
                                                            )
                                                            setSelectedOrder({ ...selectedOrder, orderItems: updatedItems })
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={() => saveModifiedOrder(selectedOrder!)}>Guardar Cambios</Button>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={() => deleteOrder(order.id)} variant="outline" className="w-full">
                                🗑️ Eliminar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

