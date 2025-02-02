/* eslint-disable */
'use client'

import React, { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import FloatingEmojis from '@/components/FloatingEmojis'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useRouter } from 'next/navigation'
import { SearchProducts } from "@/components/search-products"
import { OffersSlider } from "@/components/offers-slider"
import Loading from './loading'
import { AnimatedTitle } from "@/components/animated-title"
import {
  CategorySkeleton,
  ProductCardSkeleton,
  HeroSkeleton,
  OfferCardSkeleton,
  CartItemSkeleton
} from '@/components/skeletons'
import { Skeleton } from "@/components/ui/skeleton"
import { Category, Currency } from "@prisma/client"
import { fetchOffers } from '@/lib/api'
import { CurrencySelector } from '@/components/currency-selector'
import { useCart } from '@/contexts/CartContext'

interface Image {
  url: string
  alt: string
}

interface Product {
  id: string
  name: string
  price: string
  image: string
  category: Category
  description: string
  emoji: string
  detailedDescription?: string
  stock: number
}

interface Offer {
  id: string
  createdAt: Date
  updatedAt: Date
  emoji: string | null
  description: string | null
  productId: string
  discount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  title: string | null
  product?: Product
}

/* interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  emoji: string
  image: string
} */

/* // Floating emojis animation
const FloatingEmojis = () => {
  const emojis = ["🚀", "⭐", "💫", "✨", "🌟", "💝", "🎉", "🎈", "🎊", "🎁"]
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {emojis.map((emoji, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0 
          }}
          animate={{
            y: [null, -500],
            opacity: [0, 1, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 20
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
} */

/* //* Mock data
const products = [
  {
    id: 1,
    name: "Super Gaming Laptop 🎮",
    price: 999.99,
    images: [
      { url: "/placeholder.svg?height=400&width=400", alt: "Gaming Laptop" }
    ],
    category: "Tecnología",
    description: "¡El mejor laptop para gaming! 🚀",
    reactions: ["🔥", "💻", "🎮", "⚡"],
    stock: 5
  },
  {
    id: 2,
    name: "Zapatillas Runner Pro 👟",
    price: 89.99,
    images: [
      { url: "/placeholder.svg?height=400&width=400", alt: "Zapatillas" }
    ],
    category: "Deportes",
    description: "¡Corre como nunca! 🏃‍♂️",
    reactions: ["👟", "🏃‍♂️", "💨", "🌟"],
    stock: 10
  },
  {
    id: 3,
    name: "Smartphone Ultra Plus 📱",
    price: 699.99,
    images: [
      { url: "/placeholder.svg?height=400&width=400", alt: "Smartphone" }
    ],
    category: "Tecnología",
    description: "¡La mejor cámara del mercado! 📸",
    reactions: ["📱", "📸", "🎵", "✨"],
    stock: 8
  }
] */

/* const categories = [
  { id: "todos", name: "Todos", emoji: "🌟", gradient: "from-pink-500 to-purple-500" },
  { id: "tecnologia", name: "Tecnología", emoji: "💻", gradient: "from-blue-500 to-cyan-500" },
  { id: "deportes", name: "Deportes", emoji: "⚽", gradient: "from-green-500 to-emerald-500" },
  { id: "comida", name: "Comida", emoji: "🍕", gradient: "from-orange-500 to-red-500" },
  { id: "musica", name: "Música", emoji: "🎵", gradient: "from-violet-500 to-purple-500" },
  { id: "fotografia", name: "Fotografía", emoji: "📸", gradient: "from-yellow-500 to-orange-500" }
] */

export default function Store() {
  const router = useRouter()
  const { addToCart, cart, removeFromCart, getCartTotal} = useCart()
  const [darkMode, setDarkMode] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [highlightedWord, setHighlightedWord] = useState("divertida")
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loadingOffers, setLoadingOffers] = useState<boolean>(true)
  const [errorOffers, setErrorOffers] = useState<string | null>(null)
  
  // Definición única de currencies
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [currencyLoading, setCurrencyLoading] = useState<boolean>(true)

  const total = getCartTotal()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchCurrencies()
  }, [])

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const data = await fetchOffers()
        setOffers(data)
      } catch (error) {
        console.error(error)
        setErrorOffers('Error al cargar las ofertas.')
      } finally {
        setLoadingOffers(false)
      }
    }

    loadOffers()
  }, [])

  useEffect(() => {
    console.log('Contenido del carrito:', cart)
  }, [cart])

  useEffect(() => {
    if (errorOffers) {
      console.log('Error al cargar las ofertas:', errorOffers)
    }
  }, [errorOffers])

  useEffect(() => {
    console.log('Estado de carga de ofertas:', loadingOffers)
  }, [loadingOffers])

  useEffect(() => {
    console.log('Ofertas:', offers)
  }, [offers])

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/currencies')
      if (!res.ok) {
        throw new Error('Error al obtener las monedas')
      }
      const data: Currency[] = await res.json()
      setCurrencies(data)
      setCurrencyLoading(false)
      loadCurrencyFromStorage(data)
    } catch (error) {
      console.error('Error al cargar las monedas:', error)
      setErrorOffers('Error al cargar las monedas')
      setCurrencyLoading(false)
    }
  }

  const loadCurrencyFromStorage = (availableCurrencies: Currency[]) => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      try {
        const parsedCurrency: Currency = JSON.parse(savedCurrency)
        const currencyExists = availableCurrencies.find(c => c.code === parsedCurrency.code)
        if (currencyExists) {
          setSelectedCurrency(currencyExists)
        } else {
          setDefaultCurrency(availableCurrencies)
        }
      } catch (e) {
        console.error('Error al parsear la moneda guardada:', e)
        setDefaultCurrency(availableCurrencies)
      }
    } else {
      setDefaultCurrency(availableCurrencies)
    }
  }

  const setDefaultCurrency = (availableCurrencies: Currency[]) => {
    const defaultCurrency = availableCurrencies.find(c => c.isDefault) || availableCurrencies[0]
    setSelectedCurrency(defaultCurrency)
    localStorage.setItem('selectedCurrency', JSON.stringify(defaultCurrency))
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) {
        throw new Error('Error al obtener las categorías')
      }
      const data: Category[] = await res.json()
      const todosCategory: Category = {
        id: "todos",
        name: "Todos",
        emoji: "🌟",
        gradient: "from-pink-500 to-purple-500",
        description: "Muestra todos los productos",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCategories([todosCategory, ...data])
    } catch (error) {
      console.error('Error al cargar las categorías:', error)
      setError('Error al cargar las categorías')
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) {
        throw new Error('Error al obtener los productos')
      }
      const data: Product[] = await res.json()
      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar los productos:', error)
      setError('Error al cargar los productos')
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "todos" ||
      product.category.name.toLowerCase() === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Calcular total (se puede mover al contexto si se prefiere)
/*   const total = products.reduce((sum, item) => {
    const currencyData = currencies.find(c => c.code === selectedCurrency?.code)
    return sum + (item.price / (currencyData ? currencyData.exchangeRate : 1))
  }, 0) */

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [])

  React.useEffect(() => {
    const words = ["divertida", "increíble", "fantástica", "mágica", "especial", "asombrosa"];
    const interval = setInterval(() => {
      setHighlightedWord((current) => {
        const currentIndex = words.indexOf(current);
        return words[(currentIndex + 1) % words.length];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      emoji: product.emoji || "🛒",
      image: product.image || "/placeholder.svg"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Suspense fallback={<Loading />}>
        <FloatingEmojis />

        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <AnimatedTitle />

              {/* Mobile Navigation */}
              <div className="flex items-center gap-4 md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      ☰
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <SearchProducts onSearch={setSearchTerm} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className="w-full justify-start"
                      >
                        {darkMode ? '🌙' : '☀️'}
                        Modo {darkMode ? 'Oscuro' : 'Claro'}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      🛒
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
                  <SheetContent className="h-[85vh] flex flex-col">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full cursor-grab active:cursor-grabbing" />
                    <SheetHeader>
                      <SheetTitle>🛍️ Tu Carrito</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-auto mt-8 space-y-4">
                      {cart.length === 0 ? (
                        <div className="text-center space-y-2">
                          <p className="text-2xl">🛒</p>
                          <p className="text-muted-foreground">Tu carrito está vacío</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {cart.map((item, index) => (
                            <Suspense key={`${item.id}-${index}`} fallback={<CartItemSkeleton />}>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-between items-center bg-muted/50 p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md"
                                  />
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">${item.price} x {item.quantity || 1}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log(`Removiendo producto con ID: ${item.id}`)
                                    removeFromCart(item.id)
                                  }}
                                  className="hover:bg-destructive/20"
                                >
                                  ❌
                                </Button>
                              </motion.div>
                            </Suspense>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                    {cart.length > 0 && (
                      <div className="pt-4 border-t mt-auto">
                        <div className="flex justify-between items-center font-bold mb-4">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            localStorage.setItem('cart', JSON.stringify(cart))
                            setIsOpen(false)
                            router.push('/checkout')
                          }}
                        >
                          💳 Proceder al pago
                        </Button>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <SearchProducts onSearch={setSearchTerm} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="text-xl"
                >
                  {darkMode ? '🌙' : '☀️'}
                </Button>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                  <SheetContent className="h-full flex flex-col">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full cursor-grab active:cursor-grabbing" />
                    <SheetHeader>
                      <SheetTitle>🛍️ Tu Carrito</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-auto mt-8 space-y-4">
                      {cart.length === 0 ? (
                        <div className="text-center space-y-2">
                          <p className="text-2xl">🛒</p>
                          <p className="text-muted-foreground">Tu carrito está vacío</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {cart.map((item, index) => (
                            <Suspense key={`${item.id}-${index}`} fallback={<CartItemSkeleton />}>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-between items-center bg-muted/50 p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md"
                                  />
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">${item.price} x {item.quantity || 1}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log(`Removiendo producto con ID: ${item.id}`)
                                    removeFromCart(item.id)
                                  }}
                                  className="hover:bg-destructive/20"
                                >
                                  ❌
                                </Button>
                              </motion.div>
                            </Suspense>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                    {cart.length > 0 && (
                      <div className="pt-4 border-t mt-auto">
                        <div className="flex justify-between items-center font-bold mb-4">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            localStorage.setItem('cart', JSON.stringify(cart))
                            setIsOpen(false)
                            router.push('/checkout')
                          }}
                        >
                          💳 Proceder al pago
                        </Button>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <Suspense fallback={<HeroSkeleton />}>
          <section className="py-20 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="container mx-auto px-4 space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                ¡Bienvenido a la tienda más
                <motion.span
                  key={highlightedWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"
                >
                  {' '}{highlightedWord}{' '}
                </motion.span>
                de La Habana! 🎉
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Donde cada producto viene con una sonrisa 😊 y los emojis son nuestro lenguaje favorito ✨
              </p>
            </motion.div>
          </section>
        </Suspense>

        {/* Offers Slider */}
        <Suspense fallback={
          <div className="w-full overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }>
          <OffersSlider />
        </Suspense>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.length === 0 ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CategorySkeleton key={i} />
                  ))}
                </>
              ) : (
                categories.map((category) => (
                  <Suspense key={category.id} fallback={<CategorySkeleton />}>
                    <motion.button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative overflow-hidden rounded-xl p-4 h-32 ${selectedCategory === category.id
                        ? 'ring-2 ring-primary'
                        : 'hover:ring-2 hover:ring-primary/50'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10`} />
                      <div className="relative h-full flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl">{category.emoji}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </motion.button>
                  </Suspense>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {loading ? (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : filteredProducts.length === 0 ? (
                  <p>No se encontraron productos.</p>
                ) : (
                  filteredProducts.map((product) => (
                    <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className={`group relative overflow-hidden border-2 transition-colors hover:border-primary/50 ${hoveredProduct === product.id ? 'highlight' : ''}`}
                          onMouseEnter={() => setHoveredProduct(product.id)}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-square">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                            </div>
                            <div className="p-4">
                              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                              <p className="text-muted-foreground">{product.description}</p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">💰</span>
                              <span className="font-bold text-md">
                                {selectedCurrency && selectedCurrency.code === 'CUP' ? 'CUP ' : selectedCurrency?.symbol} 
                                {(Number(product.price) / (Number(selectedCurrency?.exchangeRate) || 1)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <CurrencySelector
                                selectedCurrency={selectedCurrency!}
                                onCurrencyChange={setSelectedCurrency}
                                currencies={currencies}
                                loading={currencyLoading}
                              />
                              <Button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="rounded-full"
                              >
                                🛒 Agregar
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    </Suspense>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">📍 Ubicación</h3>
                <p className="text-muted-foreground">
                  99-Store<br />
                  La Habana, Cuba 🇨🇺<br />
                  Entregas en toda La Habana 🚚
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">🔗 Enlaces</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="link">🏠 Inicio</Button>
                  <Button variant="link">📦 Productos</Button>
                  <Button variant="link">📞 Contacto</Button>
                  <Button variant="link">❓ Ayuda</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">📱 Síguenos</h3>
                <div className="flex gap-4 text-2xl">
                  <Button variant="ghost" size="icon">📸</Button>
                  <Button variant="ghost" size="icon">👥</Button>
                  <Button variant="ghost" size="icon">🐦</Button>
                  <Button variant="ghost" size="icon">📱</Button>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-muted-foreground">
                © 2025 99-Store ✨ Todos los derechos reservados 🎉
              </p>
            </div>
          </div>
        </footer>
      </Suspense>
    </div>
  )
}

