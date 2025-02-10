/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { OfferCardSkeleton } from "@/components/skeletons"
import { motion } from "framer-motion"

interface Offer {
  id: string
  discount: number
  endDate: string
  title: string
  description: string
  emoji: string
  product: {
    id: string
    name: string
    price: number
    image: string
    description: string
    emoji: string
  }
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(endDate).getTime() - now

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })

      if (distance < 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex gap-2 text-sm font-mono">
      <div className="bg-background/50 text-foreground rounded-md px-2 py-1 border border-border">
        {String(timeLeft.hours).padStart(2, "0")}h
      </div>
      <div className="bg-background/50 text-foreground rounded-md px-2 py-1 border border-border">
        {String(timeLeft.minutes).padStart(2, "0")}m
      </div>
      <div className="bg-background/50 text-foreground rounded-md px-2 py-1 border border-border">
        {String(timeLeft.seconds).padStart(2, "0")}s
      </div>
    </div>
  )
}

export function OffersSlider() {
  const { addToCart } = useCart()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/offers")
        if (!response.ok) {
          throw new Error("Error al obtener las ofertas.")
        }
        const data: Offer[] = await response.json()
        console.log("Ofertas recibidas:", data) // Log para verificar
        setOffers(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error al cargar las ofertas:", err.message)
          setError(err.message || "Error al cargar las ofertas.")
        } else {
          console.error("Error desconocido al cargar las ofertas:", err)
          setError("Error al cargar las ofertas.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full bg-background/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-background/50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (offers.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-background/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-foreground">🎯 Ofertas Imperdibles</h2>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            ¡Descuentos Especiales! ✨
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {offers.map((offer) => {
              const originalPrice = Number(offer.product.price).toFixed(2)
              const discountedPrice = (Number(offer.product.price) * (1 - offer.discount / 100)).toFixed(2)

              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="w-[300px] flex-shrink-0 bg-card border-border hover:border-blue-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="relative h-[200px] rounded-lg overflow-hidden">
                          <img
                            src={offer.product.image || "/placeholder.svg"}
                            alt={offer.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="text-lg font-bold bg-blue-600 hover:bg-blue-700">
                              -{offer.discount}% 🔥
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            {offer.emoji} {offer.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-500">${discountedPrice}</span>
                            {offer.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                            )}
                          </div>

                          <div className="bg-muted/10 border border-border p-2 rounded-lg">
                            <p className="text-sm font-medium text-foreground">⏰ Termina en:</p>
                            <CountdownTimer endDate={offer.endDate} />
                          </div>

                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            onClick={() =>
                              addToCart({
                                id: offer.product.id,
                                name: offer.product.name,
                                price: Number(discountedPrice),
                                quantity: 1,
                                emoji: offer.product.emoji,
                                image: offer.product.image || "/placeholder.svg",
                              })
                            }
                          >
                            🛒 Agregar al carrito
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

