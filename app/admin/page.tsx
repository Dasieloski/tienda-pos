/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Loader2 } from "lucide-react"

interface Stats {
  totalCategories: number
  totalProducts: number
  monthlySales: number
  topSellingProducts: { image: string; name: string; sales: number }[]
  lowStockProducts: { image?: string; name: string; stock: number }[]
  salesByCategory: { name: string; value: number }[]
  salesComparison: { month: string; sales: number }[]
  salesByPaymentMethod: { method: string; value: number }[]
  salesByHour: { hour: string; sales: number }[]
}

// Nueva paleta de colores moderna
const COLORS = [
  "#FF6B6B", // Coral
  "#4ECDC4", // Turquesa
  "#45B7D1", // Azul claro
  "#96CEB4", // Verde menta
  "#FFEEAD", // Amarillo pastel
  "#D4A5A5", // Rosa pálido
  "#9B5DE5", // Púrpura
  "#F15BB5", // Rosa fuerte
]

const GRADIENTS = [
  ["#FF6B6B", "#FFA07A"],
  ["#4ECDC4", "#45B7D1"],
  ["#45B7D1", "#87CEEB"],
  ["#96CEB4", "#AAFF00"],
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) {
          throw new Error("Error al obtener las estadísticas")
        }
        const data: Stats = await response.json()
        setStats(data)
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Ocurrió un error inesperado.")
        } else {
          setError("Ocurrió un error inesperado.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#111827] p-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]"
        >
          Panel de Control 📊
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-[#4ECDC4]" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">{error}</div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Categorías 📚
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#FF6B6B]">{stats?.totalCategories}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">Productos 🛍️</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#4ECDC4]">{stats?.totalProducts}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Ventas Mensuales 💰
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#45B7D1]">
                    ${(stats?.monthlySales ?? 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Top Producto 🏆
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.topSellingProducts && stats.topSellingProducts.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                        <img
                          src={stats.topSellingProducts[0].image || "/placeholder.svg"}
                          alt={stats.topSellingProducts[0].name}
                          className="relative w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                          {stats.topSellingProducts[0].name}
                        </div>
                        <div className="text-sm text-gray-500">{stats.topSellingProducts[0].sales} ventas</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Ventas por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.salesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Ventas Mensuales
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.salesComparison}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Productos Más Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {stats?.topSellingProducts.slice(0, 5).map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="relative w-12 h-12 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-700 dark:text-gray-200">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sales} ventas</div>
                        </div>
                        <div className="text-[#4ECDC4] font-bold">#{index + 1}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Ventas por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.salesByHour}>
                      <defs>
                        <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#FF6B6B" />
                          <stop offset="100%" stopColor="#4ECDC4" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="url(#colorLine)"
                        strokeWidth={3}
                        dot={{ fill: "#4ECDC4", strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: "#FF6B6B" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

