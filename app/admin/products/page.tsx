'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    id: '',
    name: '',
    price: '',
    category: '',
    description: '',
    emoji: '',
    detailedDescription: '',
    image: null as File | null,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [currency, setCurrency] = useState<string>('USD')
  const currencies = [
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'GBP', label: '£ GBP' }
  ]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error al obtener los productos')
      const data: Product[] = await res.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
      setError('Error al cargar los productos')
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Error al obtener las categorías')
      const data: Category[] = await res.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      setError('Error al cargar las categorías')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement & HTMLTextAreaElement
    if (name === 'image' && files) {
      setFormData(prev => ({ ...prev, image: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const submitData = new FormData()

    if (editingProduct) {
      submitData.append('id', editingProduct.id)
    }

    submitData.append('name', formData.name)
    submitData.append('price', formData.price)
    submitData.append('category', formData.category)
    submitData.append('description', formData.description)
    submitData.append('emoji', formData.emoji)
    submitData.append('detailedDescription', formData.detailedDescription)
    if (formData.image) {
      submitData.append('image', formData.image)
    }

    try {
      if (editingProduct) {
        // Editar producto
        const res = await fetch('/api/products', {
          method: 'PUT',
          body: submitData,
        })

        if (res.ok) {
          const updatedProduct = await res.json()
          setProducts(products.map(prod => prod.id === updatedProduct.id ? updatedProduct : prod))
          setIsOpen(false)
          setEditingProduct(null)
          setFormData({ id: '', name: '', price: '', category: '', description: '', emoji: '', detailedDescription: '', image: null })
          setSuccess('Producto actualizado exitosamente')
        } else {
          const errorData = await res.json()
          console.error('Error al editar el producto:', errorData.error)
          setError('Error al editar el producto')
        }
      } else {
        // Crear nuevo producto
        const res = await fetch('/api/products', {
          method: 'POST',
          body: submitData,
        })

        if (res.ok) {
          const newProduct = await res.json()
          setProducts([...products, newProduct])
          setIsOpen(false)
          setFormData({ id: '', name: '', price: '', category: '', description: '', emoji: '', detailedDescription: '', image: null })
          setSuccess('Producto creado exitosamente')
        } else {
          const errorData = await res.json()
          console.error('Error al crear el producto:', errorData.error)
          setError('Error al crear el producto')
        }
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setError('Error al enviar el formulario')
    }
  }

  const handleDelete = async (id: string) => {
    console.log(`Removiendo producto con ID: ${id}`)
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setProducts(products.filter(prod => prod.id !== id))
        setSuccess('Producto eliminado exitosamente')
      } else {
        const errorData = await res.json()
        console.error('Error al eliminar el producto:', errorData.error)
        setError('Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      setError('Error al eliminar el producto')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📦 Gestión de Productos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setIsOpen(true); setEditingProduct(null); setFormData({ id: '', name: '', price: '', category: '', description: '', emoji: '', detailedDescription: '', image: null }) }}>
              ✨ Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="product-form-description" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
              </DialogTitle>
              <DialogDescription id="product-form-description">
                Añade o modifica los detalles del producto aquí. Asegúrate de completar todos los campos requeridos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
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
              <div className="flex gap-2">
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">
                  {editingProduct ? '💾 Guardar Cambios' : '✨ Crear Producto'}
                </Button>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 p-4 rounded">
                  {success}
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {products.map((product) => (
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
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            {product.category ? product.category.name : 'Categoría desconocida'}
                          </span>
                          <span className="font-bold">
                            💰 ${product.price}
                          </span>
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
                        detailedDescription: product.detailedDescription || '',
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
                  >
                    🗑️ Eliminar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

