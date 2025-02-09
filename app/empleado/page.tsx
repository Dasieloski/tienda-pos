/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Undo2, Calculator, Sun, Moon, Menu } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {FunLoader} from "@/components/FunLoader"
import { useRouter } from 'next/navigation'

interface Product {
    id: string
    name: string
    image: string
    category: {
        name: string
        emoji: string
    }
    price: number
    quantity: number
    almacen_ventas: {
        stock: number
    } | null
}

interface Sale {
    id: number
    total: number
    paymentMethod: string
    status: string
    createdAt: string
    saleProduct: Array<{
        quantity: number
        price: number
        product: {
            name: string
            category: {
                name: string
                emoji: string
            }
        }
    }>
}

function ProductSearch({ onSelect }: { onSelect: (product: any) => void }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [results, setResults] = useState<Product[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Cargar productos cuando el componente se monta
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch('/api/products', {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error('Error al cargar productos')
                }

                const data = await response.json()
                setProducts(data)
                setIsLoading(false)
            } catch (error) {
                console.error('Error:', error)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los productos",
                    variant: "destructive"
                })
                setIsLoading(false)
            }
        }
        loadProducts()
    }, [])

    // Filtrar productos basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (product.almacen_ventas?.stock || 0) > 0
            )
            setResults(filtered)
        } else {
            setResults([])
        }
    }, [searchTerm, products])

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="🔍 Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="absolute mt-1 w-full z-50">
                            <CardContent className="p-2">
                                {results.map((product) => (
                                    <Button
                                        key={product.id}
                                        variant="ghost"
                                        className="w-full justify-start text-left"
                                        onClick={() => {
                                            onSelect(product)
                                            setSearchTerm("")
                                            setResults([])
                                        }}
                                    >
                                        <img
                                            src={product.image || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover mr-2 rounded"
                                        />
                                        <div>
                                            <span className="mr-2">
                                                {product.category?.emoji} {product.category?.name}
                                            </span>
                                            {product.name} - ${Number(product.price).toFixed(2)}
                                            <Badge variant="outline" className="ml-2">
                                                Stock: {product.almacen_ventas?.stock || 0}
                                            </Badge>
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ChangeCalculator({ total }: { total: number }) {
    const [payment, setPayment] = useState<number>(0)
    const change = payment - total

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>💰 Total a pagar</Label>
                    <div className="text-2xl font-bold">${total.toFixed(2)}</div>
                </div>
                <div>
                    <Label htmlFor="payment">💵 Pago recibido</Label>
                    <Input
                        id="payment"
                        type="number"
                        value={payment}
                        onChange={(e) => setPayment(Number(e.target.value))}
                        className="text-lg"
                    />
                </div>
            </div>
            <div className="text-right">
                <Label>🔄 Cambio a devolver</Label>
                <div className={`text-2xl font-bold ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ${change.toFixed(2)}
                </div>
            </div>
        </div>
    )
}

function MobileMenu({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Menú</SheetTitle>
                    <SheetDescription>Selecciona una opción</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                    {["venta", "ventas", "caja",
                     /* "devoluciones", */
                      "almacen"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                                setActiveTab(tab)
                            }}
                        >
                            {tab === "venta" && "🛍️ Nueva Venta"}
                            {tab === "ventas" && "📊 Ventas del Día"}
                            {tab === "caja" && "💰 Estado de Caja"}
                         {/*    {tab === "devoluciones" && "↩️ Devoluciones"} */}
                            {tab === "almacen" && "📦 Almacén"}
                        </Button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}

const formatSaleDate = (dateString: string | Date | undefined) => {
    try {
        if (!dateString) return "Fecha no disponible";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Fecha inválida";
        }
        return format(date, "HH:mm", { locale: es });
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return "Fecha inválida";
    }
};

export default function EmpleadoPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [currentSale, setCurrentSale] = useState<Product[]>([])
    const [dailySales, setDailySales] = useState<Sale[]>([])
    const [cashRegister, setCashRegister] = useState({
        initialAmount: 1000,
        currentAmount: 1000,
        sales: 0,
        returns: 0,
    })
    const [activeTab, setActiveTab] = useState("venta")
    const [pendingReturns, setPendingReturns] = useState<number[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [paymentMethod, setPaymentMethod] = useState<string>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [recentSales, setRecentSales] = useState<Sale[]>([])
    const [isLoadingSales, setIsLoadingSales] = useState(true)
    const [isLoadingDailySales, setIsLoadingDailySales] = useState(true)
    const [cashRegisterState, setCashRegisterState] = useState({
        totalSales: 0,
        totalAmount: 0
    });
    const [isLoadingCashRegister, setIsLoadingCashRegister] = useState(true);
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        let isMounted = true

        const checkSession = async () => {
            try {
                const response = await fetch('/api/empleado/auth/session')
                const data = await response.json()

                if (!isMounted) return

                if (data.authenticated) {
                    setIsAuthenticated(true)
                } else {
                    router.replace('/empleado/login')
                }
            } catch (error) {
                console.error('Error al verificar la sesión:', error)
                if (isMounted) {
                    toast.error('Error al verificar la sesión')
                    router.replace('/empleado/login')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        checkSession()

        return () => {
            isMounted = false
        }
    }, [router])

    useEffect(() => {
        setMounted(true)
    }, [])

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products', {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Error al cargar productos')
            }

            const data = await response.json()
            setProducts(data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los productos",
                variant: "destructive"
            })
            setIsLoading(false)
        }
    }

    // Cargar productos cuando el componente se monta
    useEffect(() => {
        loadProducts()
    }, [])

    const loadRecentSales = async () => {
        try {
            const response = await fetch('/api/sales', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error('Error al cargar las ventas')
            }

            const data = await response.json()
            
            // Filtrar solo las ventas del día actual
            const today = new Date()
            const startOfToday = startOfDay(today)
            const endOfToday = endOfDay(today)
            
            const todaySales = data.filter((sale: Sale) => {
                const saleDate = new Date(sale.createdAt)
                return isWithinInterval(saleDate, { start: startOfToday, end: endOfToday })
            })

            setRecentSales(todaySales)
            setIsLoadingSales(false)
        } catch (error) {
            console.error('Error al cargar las ventas:', error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las ventas recientes",
                variant: "destructive"
            })
            setIsLoadingSales(false)
        }
    }

    // Cargar ventas recientes cuando el componente se monta
    useEffect(() => {
        loadRecentSales()
    }, [])

    const loadDailySales = async () => {
        try {
            const response = await fetch('/api/sales', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al cargar las ventas');
            }

            const data = await response.json();
            
            // Filtrar solo las ventas del día actual
            const today = new Date();
            const startOfToday = startOfDay(today);
            const endOfToday = endOfDay(today);
            
            const todaySales = data.filter((sale: Sale) => {
                const saleDate = new Date(sale.createdAt);
                return isWithinInterval(saleDate, { start: startOfToday, end: endOfToday });
            });

            setDailySales(todaySales);
            setIsLoadingDailySales(false);
        } catch (error) {
            console.error('Error al cargar las ventas:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las ventas del día",
                variant: "destructive",
            });
            setIsLoadingDailySales(false);
        }
    };

    useEffect(() => {
        loadDailySales();
    }, []);

    const loadCashRegisterState = async () => {
        try {
            const response = await fetch('/api/cash-register');
            if (!response.ok) {
                throw new Error('Error al cargar el estado de caja');
            }
            const data = await response.json();
            setCashRegisterState(data);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar el estado de caja",
                variant: "destructive"
            });
        } finally {
            setIsLoadingCashRegister(false);
        }
    };

    useEffect(() => {
        loadCashRegisterState();
    }, []);

    if (!mounted) {
        return null
    }

    const handleAddProduct = (product: Product) => {
        const existingProduct = currentSale.find(item => item.id === product.id)

        if (existingProduct) {
            if (existingProduct.quantity >= (product.almacen_ventas?.stock || 0)) {
                toast({
                    title: "Error",
                    description: "No hay suficiente stock disponible",
                    variant: "destructive"
                })
                return
            }

            setCurrentSale(currentSale.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCurrentSale([...currentSale, { ...product, quantity: 1 }])
        }
    }

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        const product = products.find((p) => p.id === productId)
        if (product && quantity > product.stock) {
            toast.error("⚠️ No hay suficiente stock disponible")
            return
        }

        if (quantity === 0) {
            setCurrentSale(currentSale.filter((item) => item.id !== productId))
        } else {
            setCurrentSale(currentSale.map((item) => (item.id === productId ? { ...item, quantity } : item)))
        }
    }

    const calculateTotal = () => {
        return currentSale.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const processSale = async () => {
        if (currentSale.length === 0) {
            toast({
                title: "Error",
                description: "No hay productos en la venta actual",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        try {
            // Preparar los productos para la venta
            const saleProducts = currentSale.map(product => ({
                productId: product.id,
                quantity: product.quantity,
                price: Number(product.price)
            }));

            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: saleProducts,
                    total: calculateTotal(),
                    paymentMethod: paymentMethod || "efectivo"
                })
            });

            let errorMessage = 'Error al procesar la venta';
            
            if (!response.ok) {
                // Intentar obtener el mensaje de error del servidor
                try {
                    const errorData = await response.text();
                    if (errorData) {
                        try {
                            const parsedError = JSON.parse(errorData);
                            errorMessage = parsedError.error || errorMessage;
                        } catch (e) {
                            errorMessage = errorData;
                        }
                    }
                } catch (e) {
                    console.error('Error al leer la respuesta de error:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Actualizar estados locales
            setCurrentSale([]);
            setPaymentMethod(undefined);
            
            // Recargar datos
            await Promise.all([
                loadProducts(),
                loadRecentSales(),
                loadDailySales()
            ]);

            toast({
                title: "Venta completada",
                description: `Venta #${data.id} registrada exitosamente`,
            });

        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al procesar la venta",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReturn = (saleId: number) => {
        const sale = dailySales.find((s) => s.id === saleId)
        if (!sale || sale.status === "returned") return

        if (pendingReturns.includes(saleId)) {
            setDailySales(dailySales.map((s) => (s.id === saleId ? { ...s, status: "returned" } : s)))
            setPendingReturns(pendingReturns.filter((id) => id !== saleId))
            setCashRegister((prev) => ({
                ...prev,
                currentAmount: prev.currentAmount - sale.total,
                returns: prev.returns + 1,
            }))
            toast.success("↩️ Devolución procesada con éxito")
        } else {
            setPendingReturns([...pendingReturns, saleId])
            toast.success("📩 Solicitud de devolución enviada")
        }
    }

    const sendWhatsAppMessage = (sale: Sale) => {
        const phoneNumber = "5354710329"
        const message = `Solicitud de devolución:
Venta #${sale.id}
Productos: ${sale.saleProduct.map((p) => `${p.quantity}x ${p.product.name}`).join(", ")}
Total: $${sale.total.toFixed(2)}
Causa: [Por favor, especifique la causa de la devolución]`

        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank")
    }

    if (isLoading) {
        return <FunLoader />
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">🏪 Panel de Empleado</h1>
                <div className="flex items-center space-x-2">
                    <MobileMenu activeTab={activeTab} setActiveTab={setActiveTab} />
                    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden md:grid w-full grid-cols-5">
                    <TabsTrigger value="venta">🛍️ Nueva Venta</TabsTrigger>
                    <TabsTrigger value="ventas">📊 Ventas del Día</TabsTrigger>
                    <TabsTrigger value="caja">💰 Estado de Caja</TabsTrigger>
                {/*     <TabsTrigger value="devoluciones">↩️ Devoluciones</TabsTrigger> */}
                    <TabsTrigger value="almacen">📦 Almacén</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="sync">
                    <TabsContent value="venta" key="venta">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>🛍️ Nueva Venta</CardTitle>
                                        <CardDescription>Agrega productos a la venta actual</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ProductSearch onSelect={handleAddProduct} />

                                        {currentSale.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Producto</TableHead>
                                                            <TableHead>Cantidad</TableHead>
                                                            <TableHead>Precio</TableHead>
                                                            <TableHead>Subtotal</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {currentSale.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>
                                                                    <div className="flex items-center">
                                                                        <img
                                                                            src={item.image || "/placeholder.svg"}
                                                                            alt={item.name}
                                                                            className="w-10 h-10 object-cover mr-2 rounded"
                                                                        />
                                                                        {item.name}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                                                        min={0}
                                                                        max={products.find((p) => p.id === item.id)?.stock}
                                                                        className="w-20"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                                                                <TableCell>${(Number(item.price) * item.quantity).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                    {currentSale.length > 0 && (
                                        <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                                            <div className="text-2xl font-bold">Total: ${calculateTotal().toFixed(2)}</div>
                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full sm:w-auto">
                                                            <Calculator className="mr-2 h-4 w-4" />
                                                            Calculadora
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>🧮 Calculadora de Cambio</DialogTitle>
                                                        </DialogHeader>
                                                        <ChangeCalculator total={calculateTotal()} />
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="default" className="w-full sm:w-auto">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Completar Venta
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>💰 Completar Venta</DialogTitle>
                                                            <DialogDescription>
                                                                Selecciona el método de pago para completar la venta
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <Button onClick={() => processSale()} className="h-24">
                                                                💵<br />
                                                                Efectivo
                                                            </Button>
                                                            <Button onClick={() => processSale()} className="h-24">
                                                                💳<br />
                                                                Tarjeta
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardFooter>
                                    )}
                                </Card>

                                <Card className="hidden md:block">
                                    <CardHeader>
                                        <CardTitle>📝 Últimas Ventas</CardTitle>
                                        <CardDescription>Ventas más recientes del día</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingSales ? (
                                            <div className="text-center py-4">
                                                <FunLoader/>
                                            </div>
                                        ) : recentSales && recentSales.length > 0 ? (
                                            <div className="space-y-4">
                                                {recentSales.map((sale) => {
                                                    const saleProducts = sale.saleProduct || [];

                                                    return (
                                                        <Card key={sale.id} className="p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold">
                                                                        Venta #{sale.id}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {format(new Date(sale.createdAt), "PPpp", { locale: es })}
                                                                    </p>
                                                                </div>
                                                                <Badge>
                                                                    {sale.paymentMethod === "efectivo" ? (
                                                                        <>efectivo💵</>
                                                                    ) : (
                                                                        <>tarjeta💳</>
                                                                    )}
                                                                </Badge>
                                                            </div>

                                                            {saleProducts.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {saleProducts.map((item, index) => (
                                                                        item.product && (
                                                                            <div key={index} className="flex items-center justify-between text-sm">
                                                                                <div className="flex items-center">
                                                                                    <img
                                                                                        src={item.product.image || "/placeholder.svg"}
                                                                                        alt={item.product.name}
                                                                                        className="w-10 h-10 object-cover mr-2 rounded"
                                                                                    />
                                                                                    <span>
                                                                                        {item.product.name} x{item.quantity}
                                                                                    </span>
                                                                                </div>
                                                                                <span>
                                                                                    ${Number(item.price * item.quantity).toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="mt-4 pt-2 border-t flex justify-between items-center">
                                                                <span className="font-semibold">Total:</span>
                                                                <span className="font-semibold">
                                                                    ${Number(sale.total).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p>No hay ventas registradas</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="ventas" key="ventas">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>📊 Ventas del Día</CardTitle>
                                    <CardDescription>{format(new Date(), "PPPP", { locale: es })}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingDailySales ? (
                                        <div className="text-center py-4">
                                            <FunLoader />
                                        </div>
                                    ) : dailySales && dailySales.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>🆔 ID</TableHead>
                                                        <TableHead>🕒 Hora</TableHead>
                                                        <TableHead>🛒 Productos</TableHead>
                                                        <TableHead>💰 Total</TableHead>
                                                        <TableHead>💳 Método</TableHead>
                                                        <TableHead>🚦 Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {dailySales.map((sale) => (
                                                        <TableRow key={sale.id}>
                                                            <TableCell>#{sale.id}</TableCell>
                                                            <TableCell>
                                                                {formatSaleDate(sale.createdAt)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {sale.saleProduct && sale.saleProduct.map((item) => (
                                                                    <div key={item.id} className="flex items-center mb-1">
                                                                        <img
                                                                            src={item.product.image || "/placeholder.svg"}
                                                                            alt={item.product.name}
                                                                            className="w-8 h-8 object-cover mr-2 rounded"
                                                                        />
                                                                        <span>
                                                                            {item.quantity}x {item.product.name}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </TableCell>
                                                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Badge>
                                                                    {sale.paymentMethod === "efectivo" ? (
                                                                        <>efectivo💵</>
                                                                    ) : (
                                                                        <>tarjeta💳</>
                                                                    )}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {sale.status === "returned" ? (
                                                                    <Badge variant="destructive">Devuelto</Badge>
                                                                ) : (
                                                                    <Badge variant="default">Completado</Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p>No hay ventas registradas hoy</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="caja" key="caja">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>💰 Estado de Caja</CardTitle>
                                    <CardDescription>{format(new Date(), "PPPP", { locale: es })}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>💵 Fondo Inicial</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">${cashRegister.initialAmount.toFixed(2)}</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>🛒 Ventas Realizadas</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {isLoadingCashRegister ? (
                                                    <FunLoader />
                                                ) : (
                                                    <div className="text-2xl font-bold">
                                                        {cashRegisterState.totalSales} ventas
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                       {/*  <Card>
                                            <CardHeader>
                                                 <CardTitle>↩️ Devoluciones</CardTitle> 
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-red-500">{cashRegister.returns}</div>
                                            </CardContent>
                                        </Card> */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>💰 Total en Caja</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {isLoadingCashRegister ? (
                                                    <FunLoader />
                                                ) : (
                                                    <div className="text-2xl font-bold">
                                                        ${cashRegisterState.totalAmount.toFixed(2)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="devoluciones" key="devoluciones">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>↩️ Devoluciones</CardTitle>
                                    <CardDescription>Gestionar devoluciones de ventas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>🆔 ID</TableHead>
                                                    <TableHead>🕒 Fecha y Hora</TableHead>
                                                    <TableHead>🛒 Productos</TableHead>
                                                    <TableHead>💰 Total</TableHead>
                                                    <TableHead>🚦 Estado</TableHead>
                                                    <TableHead>🔄 Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {dailySales
                                                    .filter((sale) => sale.status !== "returned")
                                                    .map((sale) => (
                                                        <TableRow key={sale.id}>
                                                            <TableCell>#{sale.id}</TableCell>
                                                            <TableCell>{format(sale.createdAt, "HH:mm", { locale: es })}</TableCell>
                                                            <TableCell>
                                                                {sale.saleProduct.map((item) => (
                                                                    <div key={item.id} className="flex items-center mb-1">
                                                                        <img
                                                                            src={item.product.image || "/placeholder.svg"}
                                                                            alt={item.product.name}
                                                                            className="w-8 h-8 object-cover mr-2 rounded"
                                                                        />
                                                                        <span>
                                                                            {item.quantity}x {item.product.name}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </TableCell>
                                                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                {pendingReturns.includes(sale.id) ? (
                                                                    <Badge variant="secondary">Pendiente</Badge>
                                                                ) : (
                                                                    <Badge variant="default">Completado</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <Undo2 className="mr-2 h-4 w-4" />
                                                                            {pendingReturns.includes(sale.id)
                                                                                ? "Procesar Devolución"
                                                                                : "Solicitar Devolución"}
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>
                                                                                {pendingReturns.includes(sale.id)
                                                                                    ? "Procesar Devolución"
                                                                                    : "Solicitar Devolución"}
                                                                            </DialogTitle>
                                                                            <DialogDescription>
                                                                                {pendingReturns.includes(sale.id)
                                                                                    ? "¿Estás seguro de que deseas procesar la devolución de esta venta?"
                                                                                    : "¿Deseas enviar una solicitud de devolución para esta venta?"}
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <DialogFooter>
                                                                            {pendingReturns.includes(sale.id) ? (
                                                                                <Button variant="destructive" onClick={() => handleReturn(sale.id)}>
                                                                                    Confirmar Devolución
                                                                                </Button>
                                                                            ) : (
                                                                                <Button
                                                                                    onClick={() => {
                                                                                        sendWhatsAppMessage(sale)
                                                                                        handleReturn(sale.id)
                                                                                    }}
                                                                                >
                                                                                    Solicitar Devolución
                                                                                </Button>
                                                                            )}
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="almacen" key="almacen">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>📦 Estado del Almacén</CardTitle>
                                    <CardDescription>Inventario actual en el almacén de ventas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="🔍 Buscar productos..." className="pl-8" />
                                            </div>
                                            <Select defaultValue="todos">
                                                <SelectTrigger className="w-full sm:w-[180px]">
                                                    <SelectValue placeholder="Filtrar por categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todos">📁 Todas las categorías</SelectItem>
                                                    <SelectItem value="electronicos">📱 Electrónicos</SelectItem>
                                                    <SelectItem value="computadoras">💻 Computadoras</SelectItem>
                                                    <SelectItem value="gaming">🎮 Gaming</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="rounded-md border overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>📝 Producto</TableHead>
                                                        <TableHead>📁 Categoría</TableHead>
                                                        <TableHead>💰 Precio</TableHead>
                                                        <TableHead>📦 Stock</TableHead>
                                                        <TableHead>⚠️ Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {isLoading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-8">
                                                                <FunLoader/>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : products.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-8">
                                                                No hay productos disponibles
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        <AnimatePresence mode="sync">
                                                            {products.map((product) => (
                                                                <motion.tr
                                                                    key={`almacen-product-${product.id}`}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="group hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <TableCell>
                                                                        <div className="flex items-center">
                                                                            <img
                                                                                src={product.image || "/placeholder.svg"}
                                                                                alt={product.name}
                                                                                className="w-10 h-10 object-cover mr-2 rounded"
                                                                            />
                                                                            {product.name}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {product.category?.name} {product.category?.emoji}
                                                                    </TableCell>
                                                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                                                    <TableCell>{product.almacen_ventas?.stock || 0}</TableCell>
                                                                    <TableCell>
                                                                        {(product.almacen_ventas?.stock || 0) < 5 ? (
                                                                            <Badge variant="destructive" className="animate-pulse">
                                                                                ⚠️ Stock Bajo
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="default">✅ Normal</Badge>
                                                                        )}
                                                                    </TableCell>
                                                                </motion.tr>
                                                            ))}
                                                        </AnimatePresence>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
                                            <div>Mostrando {products.length} productos</div>
                                            <div>Última actualización: {format(new Date(), "PPpp", { locale: es })}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

