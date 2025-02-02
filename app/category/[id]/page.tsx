'use client'

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  emoji: string
}

const products: Record<string, Product[]> = {
  tecnologia: [
    {
      id: 1,
      name: "Laptop Pro Max",
      price: 999.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Tecnología",
      description: "Potente laptop para gaming y trabajo",
      emoji: "💻"
    },
    {
      id: 2,
      name: "Smartwatch Elite",
      price: 299.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Tecnología",
      description: "Reloj inteligente con múltiples funciones",
      emoji: "⌚"
    }
  ],
  deportes: [
    {
      id: 3,
      name: "Zapatillas Runner",
      price: 89.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Deportes",
      description: "Zapatillas profesionales para running",
      emoji: "👟"
    }
  ],
  electrodomesticos: [
    {
      id: 4,
      name: "Lavadora Super Clean",
      price: 499.99,
      image: "/lavadora.svg?height=400&width=400",
      category: "Electrodomésticos",
      description: "Lavadora de alta eficiencia",
      emoji: "🧺"
    }
  ],
  // ... más productos por categoría
}

const categoryEmojis: Record<string, string> = {
  tecnologia: "🚀",
  deportes: "⚡",
  electrodomesticos: "🔌",
  comida: "🍕",
  musica: "🎵",
  fotografia: "📸",
  moda: "👗"
}

const categoryNames: Record<string, string> = {
  tecnologia: "Tecnología",
  deportes: "Deportes",
  electrodomesticos: "Electrodomésticos",
  comida: "Comida",
  musica: "Música",
  fotografia: "Fotografía",
  moda: "Moda"
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [cart, setCart] = React.useState<Product[]>([])
  const [darkMode, setDarkMode] = React.useState(true)
  const [isHovered, setIsHovered] = React.useState<number | null>(null)

  const categoryProducts = products[params.id] || []
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Add to cart
  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  // Remove from cart
  const removeFromCart = (productId: number) => {
    const newCart = cart.filter(item => item.id !== productId)
    setCart(newCart)
  }

  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"
            >
              ✨ Dasieloski Store
            </motion.h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-xl"
            >
              {darkMode ? "🌙" : "☀️"}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  🛒 Carrito
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>🛍️ Tu Carrito</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground">Tu carrito está vacío 😢</p>
                  ) : (
                    <>
                      <AnimatePresence>
                        {cart.map((item, index) => (
                          <motion.div
                            key={`${item.id}-${index}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{item.emoji}</span>
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>${item.price}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                ❌
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full mt-4">
                          💳 Pagar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Category Header */}
      <header className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <span className="text-6xl mb-4 block">{categoryEmojis[params.id]}</span>
          <h2 className="text-4xl font-bold mb-4">{categoryNames[params.id]}</h2>
          <Link href="/">
            <Button variant="outline">🏠 Volver al inicio</Button>
          </Link>
        </motion.div>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {categoryProducts.length === 0 ? (
              <p className="text-center col-span-full">No hay productos disponibles en esta categoría.</p>
            ) : (
              categoryProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="overflow-hidden group"
                    onMouseEnter={() => setIsHovered(product.id)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {isHovered === product.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center p-4"
                          >
                            <p className="text-white text-center">{product.description}</p>
                          </motion.div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{product.emoji}</span>
                          <h2 className="font-semibold text-lg">{product.name}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">{product.category}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="font-bold">💰 ${product.price}</span>
                      <Button
                        variant="default"
                        onClick={() => addToCart(product)}
                      >
                        🛒 Agregar al carrito
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center">
          <p>© 2024 Dasieloski Store ✨ Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  )
}

