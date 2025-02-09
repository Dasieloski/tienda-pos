/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import {OfferCardSkeleton} from "@/components/skeletons"

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
    seconds: 0
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
      <div className="bg-primary/10 rounded-md px-2 py-1">
        {String(timeLeft.hours).padStart(2, '0')}h
      </div>
      <div className="bg-primary/10 rounded-md px-2 py-1">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </div>
      <div className="bg-primary/10 rounded-md px-2 py-1">
        {String(timeLeft.seconds).padStart(2, '0')}s
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
        const response = await fetch('/api/offers')
        if (!response.ok) {
          throw new Error('Error al obtener las ofertas.')
        }
        const data: Offer[] = await response.json()
        console.log('Ofertas recibidas:', data) // Log para verificar
        setOffers(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error al cargar las ofertas:', err.message)
          setError(err.message || 'Error al cargar las ofertas.')
        } else {
          console.error('Error desconocido al cargar las ofertas:', err)
          setError('Error al cargar las ofertas.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (isLoading) {
    return <OfferCardSkeleton/>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (offers.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-background to-primary/5 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">🎯 Ofertas Imperdibles</h2>
          <Badge variant="secondary">
            ¡Descuentos Especiales! ✨
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {offers.map((offer) => {
              const originalPrice = Number(offer.product.price).toFixed(2)
              const discountedPrice = (Number(offer.product.price) * (1 - offer.discount / 100)).toFixed(2)

              return (
                <Card key={offer.id} className="w-[300px] flex-shrink-0">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="relative h-[200px] rounded-lg overflow-hidden">
                        <img
                          src={offer.product.image || "/placeholder.svg"}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="text-lg font-bold">
                            -{offer.discount}% 🔥
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {offer.emoji} {offer.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">${discountedPrice}</span>
                          {offer.discount > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="bg-muted/50 p-2 rounded-lg">
                          <p className="text-sm font-medium">⏰ Termina en:</p>
                          <CountdownTimer endDate={offer.endDate} />
                        </div>

                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          onClick={() => addToCart({
                            id: offer.product.id,
                            name: offer.product.name,
                            price: Number(discountedPrice),
                            quantity: 1,
                            emoji: offer.product.emoji,
                            image: offer.product.image || "/placeholder.svg"
                          })}
                        >
                          🛒 Agregar al carrito
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

