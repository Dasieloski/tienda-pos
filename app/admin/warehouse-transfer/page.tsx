"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ChevronUp, ChevronDown } from "lucide-react"
import { TableSkeleton } from "@/components/TableSkeleton"
import { FunLoader } from "@/components/Funloader"

interface Product {
  id: string
  name: string
  mainWarehouseQuantity: number
  salesWarehouseQuantity: number
  category: string
  image: string
}

type SortField = "name" | "category" | "mainWarehouseQuantity" | "salesWarehouseQuantity"

export default function WarehouseTransferPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isSorting, setIsSorting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/warehouse-transfer/products")
        if (!res.ok) throw new Error("Error al obtener productos")
        const data: Product[] = await res.json()
        setProducts(data)
      } catch (error: any) {
        console.error("Error:", error)
        toast.error(error.message || "Error al cargar los productos")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const productsToTransfer = products
    .map((p) => ({
      ...p,
      transferQuantity: Math.min(5 - p.salesWarehouseQuantity, p.mainWarehouseQuantity),
    }))
    .filter((p) => p.transferQuantity > 0)

  const handleFillSalesWarehouse = async () => {
    setIsTransferring(true)
    try {
      const res = await fetch("/api/warehouse-transfer/fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: productsToTransfer.map((p) => ({ id: p.id })),
        }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error en la transferencia")
      }
      const updatedProducts = await res.json()
      setProducts(updatedProducts)
      toast.success("Transferencia realizada exitosamente")
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error en la transferencia")
    } finally {
      setIsTransferring(false)
    }
  }

  const handleSort = (field: SortField) => {
    setIsSorting(true)
    setSortField(field)
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    setTimeout(() => setIsSorting(false), 500) // Simulate sorting delay
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FunLoader />
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6">🚚 Transferencia de Almacén</h1>
        <Card>
          <CardHeader>
            <CardTitle>📦 Gestión de Stock</CardTitle>
            <CardDescription>Visualiza y gestiona el stock entre almacenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Input
                placeholder="🔍 Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex items-center gap-2">
                <Select value={sortField} onValueChange={(value) => handleSort(value as SortField)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="category">Categoría</SelectItem>
                    <SelectItem value="mainWarehouseQuantity">Almacén Principal</SelectItem>
                    <SelectItem value="salesWarehouseQuantity">Almacén de Ventas</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => handleSort(sortField)}>
                  {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-2">🚚 Confirmar Transferencia</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Confirmar Transferencia</DialogTitle>
                      <DialogDescription>
                        Se transferirán las siguientes cantidades al almacén de ventas:
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Imagen</TableHead>
                            <TableHead>Cantidad a Transferir</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productsToTransfer.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              </TableCell>
                              <TableCell>{product.transferQuantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isTransferring}>
                        Cancelar
                      </Button>
                      <Button onClick={handleFillSalesWarehouse} disabled={isTransferring}>
                        {isTransferring ? <FunLoader size="small" /> : "Confirmar Transferencia"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              {isSorting ? (
                <FunLoader />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Almacén Principal</TableHead>
                      <TableHead>Almacén de Ventas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredProducts.map((product) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.mainWarehouseQuantity}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{product.salesWarehouseQuantity}</span>
                              {product.salesWarehouseQuantity < 5 && (
                                <Badge variant="destructive" className="animate-pulse">
                                  ⚠️ Stock Bajo
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total de productos: {products.length} | Productos con stock bajo: {productsToTransfer.length}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

