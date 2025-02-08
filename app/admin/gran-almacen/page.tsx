/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, SortAsc, SortDesc, Filter, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Category {
  name: string
}

interface Product {
  id: number
  name: string
  image: string
  category: Category
  price: number
  stock: number
}

interface FilterState {
  category: string
  minPrice: number
  maxPrice: number
  stockStatus: string
  priceRange: [number, number]
}

const LowStockIndicator = () => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0.5 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ml-2"
    >
      ⚠️ Stock Bajo
    </motion.div>
  )
}

function StockDialog({ productId, currentStock, productName, onUpdate }: StockDialogProps) {
  const [newStock, setNewStock] = useState(currentStock)

  const handleUpdate = () => {
    onUpdate(newStock)
    // Aquí normalmente harías una llamada a la API para actualizar el stock
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>📦 Actualizar Stock - {productName}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="stock" className="text-right">
            📊 Stock:
          </label>
          <Input
            id="stock"
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(Number(e.target.value))}
            className="col-span-3"
          />
        </div>
      </div>
      <Button onClick={handleUpdate} className="w-full">
        ✨ Actualizar Stock
      </Button>
    </DialogContent>
  )
}

interface MoveToStoreDialogProps {
  productId: number
  productName: string
  currentStock: number
  onMove: (quantity: number) => void
}

function MoveToStoreDialog({ productId, productName, currentStock, onMove }: MoveToStoreDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const handleMove = () => {
    if (quantity > currentStock) {
      toast.error("No hay suficiente stock disponible")
      return
    }
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0")
      return
    }
    onMove(quantity)
    setIsOpen(false)
    toast.success(`${quantity} unidades movidas al almacén de ventas`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="group-hover:border-primary">
          <ArrowRight className="mr-2 h-4 w-4" />
          Mover a Ventas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>🚚 Mover al Almacén de Ventas</DialogTitle>
          <DialogDescription>
            Selecciona la cantidad de &quot;{productName}&quot; que deseas mover al almacén de ventas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Cantidad
            </Label>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  max={currentStock}
                  className="col-span-3"
                />
                <span className="text-sm text-muted-foreground">/ {currentStock} disponibles</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleMove} className="w-32">
            ✨ Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function GranAlmacen() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" })
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Estado para los filtros
  const [filters, setFilters] = useState<FilterState>({
    category: "todos",
    minPrice: 0,
    maxPrice: 2000000,
    stockStatus: "todos",
    priceRange: [0, 99999999],
  })

  // Obtener valores únicos para los filtros
  const categories = Array.from(new Set(products.map((product) => product.category.name)))
  const maxProductPrice = Math.max(...products.map((p) => p.price), 2000) // Asegura un valor máximo por defecto

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: "todos",
      minPrice: 0,
      maxPrice: maxProductPrice,
      stockStatus: "todos",
      priceRange: [0, maxProductPrice],
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category !== "todos") count++
    if (filters.stockStatus !== "todos") count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxProductPrice) count++
    return count
  }

  // Obtener productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', { method: 'GET' }) // Cambiado de '/api/stock' a '/api/products'
        if (!res.ok) {
          throw new Error('Error al obtener los productos')
        }
        const data = await res.json()
        console.log('Productos recibidos:', data) // Para depuración
        setProducts(data)
      } catch (error: any) {
        console.error('Error al cargar los productos:', error)
        toast.error('Error al cargar los productos: ' + error.message)
      }
    }

    fetchProducts()
  }, [])

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filters.category === "todos" || product.category.name === filters.category
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const matchesStock =
        filters.stockStatus === "todos" ||
        (filters.stockStatus === "bajo" && product.stock < 10) ||
        (filters.stockStatus === "normal" && product.stock >= 10)

      return matchesSearch && matchesCategory && matchesPrice && matchesStock
    })
    .sort((a, b) => {
      if (sortConfig.direction === "asc") {
        if (a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]) return -1
        if (a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]) return 1
        return 0
      }
      if (a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]) return -1
      if (a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]) return 1
      return 0
    })

  const handleStockUpdate = async (productId: number, newStock: number) => {
    // Validar que newStock es un número válido
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Por favor, ingresa un número válido para el stock.')
      return
    }

    try {
      const res = await fetch('/api/stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId, stock: newStock }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al actualizar el stock')
      }

      // Encontrar el producto actual
      const currentProduct = products.find(p => p.id === productId)
      if (!currentProduct) {
        throw new Error('Producto no encontrado')
      }

      // Actualizar solo el stock manteniendo el resto de la información del producto
      setProducts(products.map((product) =>
        product.id === productId
          ? {
            ...product, // Mantener toda la información existente del producto
            stock: newStock // Actualizar solo el stock
          }
          : product
      ))

      toast.success(`Stock de ${currentProduct.name} actualizado a ${newStock}`)
    } catch (error: any) {
      console.error('Error al actualizar el stock:', error)
      toast.error(error.message || 'No se pudo actualizar el stock')
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleMoveToStore = async (productId: number, quantity: number) => {
    if (quantity > products.find(p => p.id === productId)?.stock!) {
      toast.error("No hay suficiente stock disponible")
      return
    }

    try {
      // Realizar la llamada a la API para mover el stock
      const res = await fetch('/api/stock/move-to-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al mover el stock')
      }

      // Actualizar el estado local
      setProducts(products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            stock: product.stock - quantity,
          }
        }
        return product
      }))

      toast.success(`${quantity} unidades movidas al almacén de ventas`)
    } catch (error: any) {
      console.error('Error al mover el stock:', error)
      toast.error(error.message || 'No se pudo mover el stock')
    }
  }

  // Cálculos de paginación
  const totalFilteredItems = filteredAndSortedProducts.length
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedProducts.slice(startIndex, endIndex)

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Generar números de página para la paginación
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">🏭 Gran Almacén</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="🔍 Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Selector de ítems por página */}
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1) // Reiniciar a la primera página al cambiar ítems por página
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Productos por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="25">25 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                  <SelectItem value="100">100 por página</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón de Filtros con Badge */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>🎯 Filtros</SheetTitle>
                    <SheetDescription>Aplica filtros para encontrar productos específicos</SheetDescription>
                  </SheetHeader>

                  <div className="py-4 space-y-6">
                    {/* Filtro por Categoría */}
                    <div className="space-y-2">
                      <Label>📁 Categoría</Label>
                      <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas las categorías</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Rango de Precios */}
                    <div className="space-y-2">
                      <Label>💰 Rango de Precios</Label>
                      <div className="pt-2">
                        <Slider
                          min={0}
                          max={maxProductPrice}
                          step={10}
                          value={filters.priceRange}
                          onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                          className="my-4"
                        />
                        <div className="flex justify-between text-sm">
                          <span>${filters.priceRange[0]}</span>
                          <span>${filters.priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Filtro por Estado de Stock */}
                    <div className="space-y-2">
                      <Label>📦 Estado del Stock</Label>
                      <Select
                        value={filters.stockStatus}
                        onValueChange={(value) => handleFilterChange("stockStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado del stock" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="bajo">Stock Bajo (&lt; 10)</SelectItem>
                          <SelectItem value="normal">Stock Normal (≥ 10)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SheetFooter className="flex flex-col gap-3 sm:flex-col">
                    <Button onClick={clearFilters} variant="outline" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Limpiar Filtros
                    </Button>
                    <Button onClick={() => setIsFilterSheetOpen(false)} className="w-full">
                      Ver {filteredAndSortedProducts.length} productos
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Chips de filtros activos */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category !== "todos" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.category}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("category", "todos")} />
                  </Badge>
                )}
                {filters.stockStatus !== "todos" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.stockStatus === "bajo" ? "Stock Bajo" : "Stock Normal"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("stockStatus", "todos")} />
                  </Badge>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxProductPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("priceRange", [0, maxProductPrice])}
                    />
                  </Badge>
                )}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>🖼️ Imagen</TableHead>
                    <TableHead onClick={() => handleSort("name")} className="cursor-pointer hover:bg-muted">
                      📝 Nombre{" "}
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="inline h-4 w-4" />
                        ) : (
                          <SortDesc className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead>📁 Categoría</TableHead>
                    <TableHead onClick={() => handleSort("price")} className="cursor-pointer hover:bg-muted">
                      💰 Precio{" "}
                      {sortConfig.key === "price" &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="inline h-4 w-4" />
                        ) : (
                          <SortDesc className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead onClick={() => handleSort("stock")} className="cursor-pointer hover:bg-muted">
                      📦 Stock{" "}
                      {sortConfig.key === "stock" &&
                        (sortConfig.direction === "asc" ? (
                          <SortAsc className="inline h-4 w-4" />
                        ) : (
                          <SortDesc className="inline h-4 w-4" />
                        ))}
                    </TableHead>
                    <TableHead>⚡ Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                        </motion.div>
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>
                        ${typeof product.price === 'string'
                          ? parseFloat(product.price).toFixed(2)
                          : Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={product.stock < 10 ? "text-red-500 font-bold" : ""}>{product.stock}</span>
                        {product.stock < 10 && <LowStockIndicator />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:border-primary">
                                      ✏️
                                      <span className="sr-only">Editar Stock</span>
                                    </Button>
                                  </DialogTrigger>
                                  <StockDialog
                                    productId={product.id}
                                    currentStock={product.stock}
                                    productName={product.name}
                                    onUpdate={(newStock) => handleStockUpdate(product.id, newStock)}
                                  />
                                </Dialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar Stock</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <MoveToStoreDialog
                                  productId={product.id}
                                  productName={product.name}
                                  currentStock={product.stock}
                                  onMove={(quantity) => handleMoveToStore(product.id, quantity)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mover a Ventas</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalFilteredItems)} de {totalFilteredItems} productos
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    </>
                  )}

                  {getPageNumbers().map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

