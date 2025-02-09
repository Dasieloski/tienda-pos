"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
  id: string
  name: string
  emoji: string
  gradient: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  price: string
  category: Category
  description: string
  emoji: string
  detailedDescription: string
  image: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    description: "",
    emoji: "",
    detailedDescription: "",
    image: null as File | null,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Nuevos estados para filtrado y búsqueda
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc")
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Error al obtener los productos")
      const data: Product[] = await res.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
      setError("Error al cargar los productos")
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Error al obtener las categorías")
      const data: Category[] = await res.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      setError("Error al cargar las categorías")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement & HTMLTextAreaElement
    if (name === "image" && files) {
      setFormData((prev) => ({ ...prev, image: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const submitData = new FormData()

    if (editingProduct) {
      submitData.append("id", editingProduct.id)
    }

    submitData.append("name", formData.name)
    submitData.append("price", formData.price)
    submitData.append("category", formData.category)
    submitData.append("description", formData.description)
    submitData.append("emoji", formData.emoji)
    submitData.append("detailedDescription", formData.detailedDescription)
    if (formData.image) {
      submitData.append("image", formData.image)
    }

    try {
      if (editingProduct) {
        const res = await fetch("/api/products", {
          method: "PUT",
          body: submitData,
        })

        if (res.ok) {
          const updatedProduct = await res.json()
          setProducts(products.map((prod) => (prod.id === updatedProduct.id ? updatedProduct : prod)))
          setIsOpen(false)
          setEditingProduct(null)
          setFormData({
            id: "",
            name: "",
            price: "",
            category: "",
            description: "",
            emoji: "",
            detailedDescription: "",
            image: null,
          })
          setSuccess("Producto actualizado exitosamente")
        } else {
          const errorData = await res.json()
          console.error("Error al editar el producto:", errorData.error)
          setError("Error al editar el producto")
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          body: submitData,
        })

        if (res.ok) {
          const newProduct = await res.json()
          setProducts([...products, newProduct])
          setIsOpen(false)
          setFormData({
            id: "",
            name: "",
            price: "",
            category: "",
            description: "",
            emoji: "",
            detailedDescription: "",
            image: null,
          })
          setSuccess("Producto creado exitosamente")
        } else {
          const errorData = await res.json()
          console.error("Error al crear el producto:", errorData.error)
          setError("Error al crear el producto")
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      setError("Error al enviar el formulario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    console.log(`Removiendo producto con ID: ${id}`)
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setProducts(products.filter((prod) => prod.id !== id))
        setSuccess("Producto eliminado exitosamente")
      } else {
        const errorData = await res.json()
        console.error("Error al eliminar el producto:", errorData.error)
        setError("Error al eliminar el producto")
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      setError("Error al eliminar el producto")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(product.category.id)
        return matchesSearch && matchesCategories
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case "name-asc":
            return a.name.localeCompare(b.name)
          case "name-desc":
            return b.name.localeCompare(a.name)
          case "price-asc":
            return Number.parseFloat(a.price) - Number.parseFloat(b.price)
          case "price-desc":
            return Number.parseFloat(b.price) - Number.parseFloat(a.price)
          default:
            return 0
        }
      })
  }, [products, searchQuery, selectedCategories, sortOrder])

  // Función para manejar la selección de categorías
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedCategories([])
    setSearchQuery("")
    setSortOrder("name-asc")
    setIsFilterSheetOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📦 Gestión de Productos</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsOpen(true)
                  setEditingProduct(null)
                  setFormData({
                    id: "",
                    name: "",
                    price: "",
                    category: "",
                    description: "",
                    emoji: "",
                    detailedDescription: "",
                    image: null,
                  })
                }}
              >
                ✨ Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="product-form-description" className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "✏️ Editar Producto" : "✨ Nuevo Producto"}</DialogTitle>
                <DialogDescription id="product-form-description">
                  Añade o modifica los detalles del producto aquí. Asegúrate de completar todos los campos requeridos.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
              >
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    name="emoji"
                    type="text"
                    value={formData.emoji}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="detailedDescription">Descripción Detallada</Label>
                  <Textarea
                    id="detailedDescription"
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">Imagen</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    required={!editingProduct}
                  />
                </div>
                <div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {editingProduct ? "Guardando..." : "Creando..."}
                      </span>
                    ) : editingProduct ? (
                      "💾 Guardar Cambios"
                    ) : (
                      "✨ Crear Producto"
                    )}
                  </Button>
                </div>
                {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-4 rounded">{success}</div>}
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {/* Dropdown de ordenamiento para PC/Tablet */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden sm:flex">
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder("name-asc")}>Nombre (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("name-desc")}>Nombre (Z-A)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("price-asc")}>Precio (Menor a Mayor)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("price-desc")}>Precio (Mayor a Menor)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sheet de filtros para móvil */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Filtra los productos por categoría y ordénalos según tus preferencias.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Ordenar por</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant={sortOrder === "name-asc" ? "default" : "outline"}
                        onClick={() => setSortOrder("name-asc")}
                        className="justify-start"
                      >
                        Nombre (A-Z)
                      </Button>
                      <Button
                        variant={sortOrder === "name-desc" ? "default" : "outline"}
                        onClick={() => setSortOrder("name-desc")}
                        className="justify-start"
                      >
                        Nombre (Z-A)
                      </Button>
                      <Button
                        variant={sortOrder === "price-asc" ? "default" : "outline"}
                        onClick={() => setSortOrder("price-asc")}
                        className="justify-start"
                      >
                        Precio (Menor a Mayor)
                      </Button>
                      <Button
                        variant={sortOrder === "price-desc" ? "default" : "outline"}
                        onClick={() => setSortOrder("price-desc")}
                        className="justify-start"
                      >
                        Precio (Mayor a Menor)
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Categorías</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.emoji} {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {(selectedCategories.length > 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId)
              if (!category) return null
              return (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(categoryId)}
                >
                  {category.emoji} {category.name}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryToggle(categoryId)
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )
            })}
            {searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                Búsqueda: {searchQuery}
                <button className="ml-1 hover:text-destructive" onClick={() => setSearchQuery("")}>
                  ×
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Limpiar todos
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[320px]">
          <AnimatePresence>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/0 flex items-end p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{product.emoji}</span>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                {product.category ? product.category.name : "Categoría desconocida"}
                              </span>
                              <span className="font-bold">💰 ${product.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-2 pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setFormData({
                            id: product.id,
                            name: product.name,
                            price: product.price.toString(),
                            category: product.category.id,
                            description: product.description,
                            emoji: product.emoji,
                            detailedDescription: product.detailedDescription || "",
                            image: null,
                          })
                          setIsOpen(true)
                        }}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Eliminando...
                          </span>
                        ) : (
                          "🗑️ Eliminar"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron productos que coincidan con los filtros aplicados.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

