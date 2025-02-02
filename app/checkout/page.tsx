"use client"
import type React from "react"
import { useMemo } from "react"
//import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export default function CheckoutPage() {
  // const router = useRouter()
  const { cart, getCartTotal, clearCart, removeFromCart } = useCart()

  const total = useMemo(() => {
    const calculatedTotal = getCartTotal()
    console.log("Total calculado en CheckoutPage:", calculatedTotal)
    return calculatedTotal
  }, [getCartTotal])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Inicio de handleSubmit")

    const formData = new FormData(e.currentTarget)

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    console.log("Datos del formulario:", { name, phone, address })

    const cartItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }))

    console.log("Items del carrito a enviar:", cartItems)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address, cartItems, total }),
      })

      console.log("Respuesta de la API:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error al guardar el pedido:', errorData.error)
        return
      }

      const order = await response.json()
      console.log('Pedido guardado:', order)
    } catch (error) {
      console.error('Error al conectar con la API:', error)
      return
    }

    let message = "🛍️ *Nuevo Pedido en 99-Store*\n\n"
    message += "👤 *Datos del Cliente:*\n"
    message += `- Nombre: ${name}\n`
    message += `- Teléfono: ${phone}\n\n`
    message += "📍 *Dirección de Envío:*\n"
    message += `${address}\n\n`
    message += "🛒 *Productos:*\n"

    cart.forEach((item) => {
      message += `- ${item.emoji || '📦'} ${item.name}: $${item.price} x ${item.quantity || 1}\n`
    })

    message += `\n💰 *Total:* $${total.toFixed(2)}`
    const encodedMessage = encodeURIComponent(message)
    const phoneNumber = "+5354710329"

    console.log("Mensaje para WhatsApp:", message)

    try {
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      console.log("URL de WhatsApp a abrir:", whatsappURL)
      const whatsappWindow = window.open(whatsappURL, "_blank")

      if (whatsappWindow) {
        console.log("WhatsApp abierto correctamente")
      } else {
        console.warn("Bloqueador de ventanas emergentes impidió abrir WhatsApp")
      }
    } catch (error) {
      console.error("Error al abrir WhatsApp:", error)
    }

    clearCart()
    console.log("Carrito limpiado")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Finalizar Compra
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario de datos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Datos de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" required placeholder="Tu nombre completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" required placeholder="Tu número de teléfono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      name="address"
                      required
                      placeholder="Dirección completa de envío"
                      className="min-h-[100px]"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resumen del carrito */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:sticky md:top-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price} x {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="hover:bg-destructive/20"
                        >
                          ❌
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    <Button type="submit" form="checkoutForm" className="w-full text-lg h-12">
                      💬 Continuar en WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

