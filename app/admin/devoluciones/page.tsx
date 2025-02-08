/* eslint-disable */
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Search, SortAsc, SortDesc } from "lucide-react"

interface ReturnRequest {
  id: string
  dateTime: string
  products: Array<{
    image: string
    name: string
    quantity: number
  }>
  total: number
}

const mockData: ReturnRequest[] = [
  {
    id: "DEV001",
    dateTime: "2023-06-01 14:30",
    products: [
      { image: "/placeholder.svg", name: "Producto A", quantity: 2 },
      { image: "/placeholder.svg", name: "Producto B", quantity: 1 },
    ],
    total: 150.99,
  },
  {
    id: "DEV002",
    dateTime: "2023-06-02 10:15",
    products: [{ image: "/placeholder.svg", name: "Producto C", quantity: 1 }],
    total: 49.99,
  },
  {
    id: "DEV003",
    dateTime: "2023-06-03 09:00",
    products: [
      { image: "/placeholder.svg", name: "Producto D", quantity: 3 },
      { image: "/placeholder.svg", name: "Producto E", quantity: 2 },
    ],
    total: 299.99,
  },
]

export default function DevolucionesPage() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(mockData)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"id" | "dateTime" | "total">("dateTime")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterTotal, setFilterTotal] = useState<"all" | "less100" | "100to200" | "more200">("all")

  const handleAuthorize = (id: string) => {
    // Implement authorization logic here
    console.log(`Autorizada devolución: ${id}`)
  }

  const filteredAndSortedRequests = useMemo(() => {
    return returnRequests
      .filter((request) => {
        const matchesSearch =
          request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.products.some((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

        let matchesFilter = true
        if (filterTotal === "less100") matchesFilter = request.total < 100
        else if (filterTotal === "100to200") matchesFilter = request.total >= 100 && request.total <= 200
        else if (filterTotal === "more200") matchesFilter = request.total > 200

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [returnRequests, searchTerm, sortField, sortOrder, filterTotal])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">🔄 Solicitudes de Devoluciones</h1>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Buscar por ID o producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Select value={filterTotal} onValueChange={(value: any) => setFilterTotal(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filtrar por total" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="less100">Menos de $100</SelectItem>
            <SelectItem value="100to200">$100 - $200</SelectItem>
            <SelectItem value="more200">Más de $200</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="dateTime">Fecha y Hora</SelectItem>
            <SelectItem value="total">Total</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.dateTime}</TableCell>
                <TableCell>
                  {request.products.map((product, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <span>
                        {product.name} (x{product.quantity})
                      </span>
                    </div>
                  ))}
                </TableCell>
                <TableCell>${request.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleAuthorize(request.id)}>✅ Autorizar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  )
}

