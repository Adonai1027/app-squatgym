"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Truck,
  Building2,
  Check,
  X,
  Search,
  CreditCard,
  QrCode,
  Banknote,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Download,
  BarChart3,
  AlertOctagon,
  ClipboardList,
  TrendingUp,
  User,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Product, VentaKiosco, Turno, PagoPendiente } from "./types"
import { ventasKioscoIniciales, sedesOptions as sedesData } from "./data"

const VENTAS_STORAGE_KEY = "squatgym_ventas_kiosco"

function loadVentas(): VentaKiosco[] {
  if (typeof window === "undefined") return ventasKioscoIniciales
  try {
    const raw = localStorage.getItem(VENTAS_STORAGE_KEY)
    if (!raw) return ventasKioscoIniciales
    const parsed: VentaKiosco[] = JSON.parse(raw)
    // Merge stored with initial seeds (avoid duplicates by id)
    const storedIds = new Set(parsed.map(v => v.id))
    const merged = [
      ...parsed,
      ...ventasKioscoIniciales.filter(v => !storedIds.has(v.id)),
    ]
    return merged.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))
  } catch {
    return ventasKioscoIniciales
  }
}

function saveVentas(ventas: VentaKiosco[]) {
  try {
    localStorage.setItem(VENTAS_STORAGE_KEY, JSON.stringify(ventas))
  } catch { /* quota exceeded – ignore */ }
}

function turnoDesdeHora(hora: string): Turno {
  const h = parseInt(hora.split(":")[0], 10)
  if (h < 13) return "mañana"
  if (h < 18) return "tarde"
  return "noche"
}

interface AdministracionKioscoProps {
  onBack: () => void
  showToast: (message: string, type?: "success" | "info") => void
  initialView?: KioscoView
  openOrderDialogOnMount?: boolean
  productos: Product[]
  setProductos: (p: Product[]) => void
  ventas: VentaKiosco[] 
  setVentas: (v: VentaKiosco[]) => void
  setPagosPendientes: (p: any) => void
  userRole?: string
  sedeId?: string
  sede?: string
}

type KioscoView = "hub" | "pos" | "stock" | "ventas-diarias"

interface CartItem {
  product: Product
  cantidad: number
}

interface ReceiptData {
  numero: string
  fecha: string
  hora: string
  items: { nombre: string; cantidad: number; precio: number }[]
  total: number
  medio: string
  cliente?: string
  dniCliente?: string
  sede: typeof sedeInfo
}

// Sede info
const sedeInfo = {
  nombre: "SquatGym - Sede Central",
  direccion: "Av. Corrientes 1234, CABA",
  telefono: "(011) 4567-8900",
  cuit: "30-12345678-9",
}

// Proveedores registrados
const proveedoresOptions = [
  { id: "P001", nombre: "FitSupply Corp", rubro: "Insumos y Equipamiento" },
  { id: "P002", nombre: "Bebidas Premium SA", rubro: "Bebidas e Isotónicos" },
  { id: "P003", nombre: "Equipos Deportivos XXL", rubro: "Equipamiento" },
  { id: "P004", nombre: "Nutrición & Energía", rubro: "Proteínas y Suplementos" },
]

// Sedes del gimnasio — re-exported from data.ts; kept here as a fallback alias
const sedesOptions = sedesData

// Mock clients database
const clientes: Record<string, { nombre: string; apellido: string }> = {
  "12345678": { nombre: "Juan", apellido: "Pérez" },
  "23456789": { nombre: "María", apellido: "García" },
  "34567890": { nombre: "Carlos", apellido: "López" },
  "45678901": { nombre: "Ana", apellido: "Martínez" },
  "56789012": { nombre: "Pedro", apellido: "Rodríguez" },
}




type StockSortKey = "nombre" | "precio" | "stock" | "minimo"

let globalLastOrder: {
  usuario: string
  fecha: string
  hora: string
  resumen: string
  productQuantities: Record<number, number>
} | null = null

export function AdministracionKiosco({ onBack, showToast, initialView, openOrderDialogOnMount, productos, setProductos, ventas, setVentas, setPagosPendientes, userRole, sedeId = "S001", sede = "Sede Central" }: AdministracionKioscoProps) {
  const hasShortage = productos.some(p => (p.stock < p.minimo && p.stock > 0 && !p.pedidoEnCurso) || (p.stock === 0 && !p.pedidoEnCurso))
  
  const [view, setView] = useState<KioscoView>(initialView || "hub")
  const [carrito, setCarrito] = useState<CartItem[]>([])
  const [attemptingOrder, setAttemptingOrder] = useState(openOrderDialogOnMount || false)
  const [showOrderDialog, setShowOrderDialog] = useState((openOrderDialogOnMount && hasShortage) || false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [isPreventiveOrder, setIsPreventiveOrder] = useState(false)
  const [orderType, setOrderType] = useState<"externo" | "interno">("externo")
  const shortageProducts = productos.filter(p => (p.stock < p.minimo && p.stock > 0 && !p.pedidoEnCurso) || (p.stock === 0 && !p.pedidoEnCurso))
  const initialShortageIds = shortageProducts.map(p => p.id)
  const initialQuantities: Record<number, number> = {}
  shortageProducts.forEach(p => {
    initialQuantities[p.id] = p.minimo - p.stock > 0 ? p.minimo - p.stock + 10 : 20
  })

  const [selectedProducts, setSelectedProducts] = useState<number[]>(
    openOrderDialogOnMount && hasShortage ? initialShortageIds : []
  )
  const [preventiveQuantities, setPreventiveQuantities] = useState<Record<number, number>>(
    openOrderDialogOnMount && hasShortage ? initialQuantities : {}
  )
  const [orderDetails, setOrderDetails] = useState({ proveedor: "", sede: "", notas: "" })
  // ventas state is now passed from parent Dashboard

  // Sync seed data into localStorage on first mount (idempotent)
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(VENTAS_STORAGE_KEY)) {
      saveVentas(ventasKioscoIniciales)
    }
  }, [])

  // ── Ventas-diarias filter state ──────────────────────────────────────────
  const today = new Date().toLocaleDateString("es-AR")
  const [filtroFecha, setFiltroFecha] = useState<string>(today)
  const [filtroSede, setFiltroSede] = useState<string>(userRole === "encargado" ? (sedeId || "S001") : "todas")
  const [filtroTurno, setFiltroTurno] = useState<string>("todos")

  // POS filter state
  const [posSearch, setPosSearch] = useState("")

  // Stock filter/sort states
  const [stockSearch, setStockSearch] = useState("")
  const [stockSortKey, setStockSortKey] = useState<StockSortKey>("nombre")
  const [stockSortAsc, setStockSortAsc] = useState(true)

  // Payment flow states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("efectivo")
  const [clientDni, setClientDni] = useState("")
  const [clientName, setClientName] = useState("")
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // Order confirmation data
  const [confirmedOrder, setConfirmedOrder] = useState<{
    tipo: "externo" | "interno"
    destino: string
    productos: Product[]
    fecha: string
    numero: string
  } | null>(null)

  // Auditoria state
  const [showAuditoriaDialog, setShowAuditoriaDialog] = useState(false)
  const [auditoriaProduct, setAuditoriaProduct] = useState<number | "">("")
  const [auditoriaPhysicalCount, setAuditoriaPhysicalCount] = useState<string>("")

  // Last order receipt state
  const [showLastOrderReceipt, setShowLastOrderReceipt] = useState(false)

  // Report dialog state
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportDateFrom, setReportDateFrom] = useState("")
  const [reportDateTo, setReportDateTo] = useState("")
  const [reportSedeId, setReportSedeId] = useState(userRole === "administrador" ? "todas" : sedeId)

  const filteredPosProductos = useMemo(() => {
    const q = posSearch.toLowerCase().trim()
    if (!q) return productos
    return productos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [productos, posSearch])

  const handleStockSort = (key: StockSortKey) => {
    if (stockSortKey === key) {
      setStockSortAsc((prev) => !prev)
    } else {
      setStockSortKey(key)
      setStockSortAsc(true)
    }
  }

  const filteredAndSortedProductos = useMemo(() => {
    const q = stockSearch.toLowerCase().trim()
    const filtered = productos.filter((p) => p.nombre.toLowerCase().includes(q))
    return [...filtered].sort((a, b) => {
      if (stockSortKey === "nombre") {
        return stockSortAsc
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre)
      }
      const va = a[stockSortKey]
      const vb = b[stockSortKey]
      return stockSortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
  }, [productos, stockSearch, stockSortKey, stockSortAsc])

  const StockSortButton = ({ label, keyName }: { label: string; keyName: StockSortKey }) => {
    const active = stockSortKey === keyName
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStockSort(keyName)}
        className={`text-xs gap-1 ${active ? "border-foreground text-foreground font-medium" : "text-muted-foreground"}`}
      >
        {label}
        {active
          ? stockSortAsc
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />
          : <ArrowDown className="w-3 h-3 opacity-30" />}
      </Button>
    )
  }

  const addToCart = (product: Product) => {
    const existingItem = carrito.find((item) => item.product.id === product.id)
    if (existingItem) {
      if (existingItem.cantidad < product.stock) {
        setCarrito(
          carrito.map((item) =>
            item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        )
      }
    } else {
      setCarrito([...carrito, { product, cantidad: 1 }])
    }
  }

  const removeFromCart = (productId: number) => {
    const existingItem = carrito.find((item) => item.product.id === productId)
    if (existingItem && existingItem.cantidad > 1) {
      setCarrito(
        carrito.map((item) =>
          item.product.id === productId ? { ...item, cantidad: item.cantidad - 1 } : item
        )
      )
    } else {
      setCarrito(carrito.filter((item) => item.product.id !== productId))
    }
  }

  const deleteFromCart = (productId: number) => {
    setCarrito(carrito.filter((item) => item.product.id !== productId))
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.product.precio * item.cantidad, 0)

  // Search client by DNI
  const handleDniSearch = (dni: string) => {
    setClientDni(dni)
    const cliente = clientes[dni]
    if (cliente) {
      setClientName(`${cliente.nombre} ${cliente.apellido}`)
    } else {
      setClientName("")
    }
  }

  const openPaymentModal = () => {
    setShowPaymentModal(true)
    setPaymentMethod("efectivo")
    setClientDni("")
    setClientName("")
  }

  const procesarVenta = () => {
    const now = new Date()
    const receiptData: ReceiptData = {
      numero: `V-${Date.now().toString().slice(-6)}`,
      fecha: now.toLocaleDateString("es-AR"),
      hora: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      items: carrito.map(item => ({
        nombre: item.product.nombre,
        cantidad: item.cantidad,
        precio: item.product.precio,
      })),
      total: totalCarrito,
      medio: paymentMethod === "efectivo" ? "Efectivo" : paymentMethod === "qr" ? "QR" : "Tarjeta",
      cliente: clientName || undefined,
      dniCliente: clientDni || undefined,
      sede: sedeInfo,
    }

    // Add to sales (persistent)
    const nuevaVenta: VentaKiosco = {
      id: receiptData.numero,
      fecha: receiptData.fecha,
      hora: receiptData.hora,
      items: receiptData.items,
      total: receiptData.total,
      medio: receiptData.medio,
      cliente: receiptData.cliente,
      dniCliente: receiptData.dniCliente,
      sedeId,
      sede,
      turno: turnoDesdeHora(receiptData.hora),
    }
    setVentas([nuevaVenta, ...ventas])


    // Update stock
    const updatedProductos = productos.map((p) => {
      const cartItem = carrito.find((item) => item.product.id === p.id)
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.cantidad }
      }
      return p
    })
    setProductos(updatedProductos)

    setReceipt(receiptData)
    setShowPaymentModal(false)
    setShowReceipt(true)
    setCarrito([])
    showToast(`Venta procesada: $${totalCarrito.toLocaleString()}`)
  }

  const handleOrderSubmit = () => {
    const orderNumber = `PED-${Date.now().toString().slice(-6)}`
    const selectedProds = productos.filter(p => selectedProducts.includes(p.id))

    const quantities: Record<number, number> = {}
    selectedProds.forEach(p => {
      quantities[p.id] = preventiveQuantities[p.id] || (p.minimo - p.stock > 0 ? p.minimo - p.stock + 10 : 20)
    })

    globalLastOrder = {
      usuario: userRole ?? "desconocido",
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      resumen: selectedProds.map(p => `${p.nombre} (x${quantities[p.id]})`).join(", "),
      productQuantities: quantities,
    }

    setConfirmedOrder({
      tipo: orderType,
      destino: orderType === "externo" ? orderDetails.proveedor : orderDetails.sede,
      productos: selectedProds,
      fecha: new Date().toLocaleDateString("es-AR"),
      numero: orderNumber,
    })

    // Update global state so they don't trigger the intrusive alert anymore
    setProductos(
      productos.map((p) =>
        selectedProducts.includes(p.id) ? { ...p, pedidoEnCurso: true } : p
      )
    )

    if (orderType === "externo") {
      const estimatedMonto = selectedProds.reduce((sum, p) => sum + (p.precio * (preventiveQuantities[p.id] || 0)), 0)
      const provider = proveedoresOptions.find(p => p.nombre === orderDetails.proveedor) || proveedoresOptions[0]
      
      const newPago: any = {
        id: `EG-${Date.now().toString().slice(-6)}`,
        proveedor: {
          id: provider.id,
          nombre: provider.nombre,
          rubro: provider.rubro,
          contacto: "Pendiente",
          telefono: "Pendiente",
          email: "pendiente@proveedor.com"
        },
        concepto: `Reposición Kiosco - ${orderNumber}`,
        monto: estimatedMonto,
        fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        diasAtraso: 0,
        sedeId,
      }
      
      if (setPagosPendientes) {
        setPagosPendientes((prev: any) => [newPago, ...prev])
      }
    }

    setShowOrderDialog(false)
    setShowOrderConfirmation(true)
    showToast(
      orderType === "externo"
        ? "Pedido a proveedor generado y obligación de pago creada"
        : "Pedido interno generado"
    )
  }

  const closeOrderConfirmation = () => {
    setShowOrderConfirmation(false)
    setConfirmedOrder(null)
    setSelectedProducts([])
    setOrderDetails({ proveedor: "", sede: "", notas: "" })
  }

  const closeReceipt = () => {
    setShowReceipt(false)
    setReceipt(null)
  }

  const lowStockProducts = productos.filter((p) => p.stock < p.minimo && p.stock > 0 && !p.pedidoEnCurso)
  const outOfStockProducts = productos.filter((p) => p.stock === 0 && !p.pedidoEnCurso)

  // ── Filtered ventas for the "ventas-diarias" view ────────────────────────
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      if (filtroFecha && filtroFecha !== "todas" && v.fecha !== filtroFecha) return false
      if (filtroSede !== "todas" && v.sedeId !== filtroSede) return false
      if (filtroTurno !== "todos" && v.turno !== filtroTurno) return false
      return true
    })
  }, [ventas, filtroFecha, filtroSede, filtroTurno])

  // Unique sorted dates present in the full dataset (for the date picker)
  const fechasDisponibles = useMemo(() => {
    const set = new Set(ventas.map(v => v.fecha))
    return Array.from(set).sort((a, b) => {
      // Parse DD/MM/AAAA for comparison
      const [da, ma, ya] = a.split("/").map(Number)
      const [db, mb, yb] = b.split("/").map(Number)
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime()
    })
  }, [ventas])

  // KPIs for today across all branches (hub badge)
  const ventasStats = useMemo(() => {
    const todayVentas = ventas.filter(v => v.fecha === today)
    const totalVentas = todayVentas.reduce((acc, v) => acc + v.total, 0)
    const cantidadVentas = todayVentas.length
    const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0
    return { totalVentas, cantidadVentas, promedioVenta }
  }, [ventas, today])

  // KPIs for the active filter selection
  const filteredStats = useMemo(() => {
    const totalVentas = ventasFiltradas.reduce((acc, v) => acc + v.total, 0)
    const cantidadVentas = ventasFiltradas.length
    const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0
    return { totalVentas, cantidadVentas, promedioVenta }
  }, [ventasFiltradas])


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {!(userRole === "secretaria" && view === "pos") && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (initialView && initialView !== "hub") {
                onBack()
              } else {
                view === "hub" ? onBack() : setView("hub")
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administración de Kiosco</h2>
          <p className="text-muted-foreground">
            {view === "hub" && "Selecciona una opción"}
            {view === "pos" && "Punto de Venta"}
            {view === "stock" && "Control de Stock"}
            {view === "ventas-diarias" && "Ventas del Día"}
          </p>
        </div>
      </div>

      {/* Hub View */}
      {view === "hub" && (
        <div className="space-y-6">
          {/* Alert Cards */}
          {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outOfStockProducts.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertOctagon className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-destructive">Productos Agotados</h3>
                      <p className="text-sm text-muted-foreground">
                        {outOfStockProducts.length} productos sin stock
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {lowStockProducts.length > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#f59e0b]">Stock Bajo</h3>
                      <p className="text-sm text-muted-foreground">
                        {lowStockProducts.length} productos bajo mínimo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors border-border bg-card group"
              onClick={() => setView("pos")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Punto de Venta</h3>
                <p className="text-muted-foreground">Registrar ventas del kiosco</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors border-border bg-card group"
              onClick={() => setView("stock")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Package className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Control de Stock</h3>
                <p className="text-muted-foreground">Gestionar inventario y reposición</p>
                {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                  <div className="mt-3 px-3 py-1 rounded-full bg-warning/10 text-[#f59e0b] text-sm inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {lowStockProducts.length + outOfStockProducts.length} alertas
                  </div>
                )}
              </CardContent>
            </Card>

            {userRole !== "secretaria" && (
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors border-border bg-card group"
                onClick={() => setView("ventas-diarias")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ventas Diarias</h3>
                  <p className="text-muted-foreground">Ver historial de ventas del día</p>
                  <div className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ${ventasStats.totalVentas.toLocaleString()} hoy
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* POS View */}
      {view === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle>Productos</CardTitle>
                {/* Filtro POS */}
                <div className="relative mt-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredPosProductos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    No se encontraron productos con ese criterio de búsqueda.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPosProductos.map((producto) => {
                      const enCarrito = carrito.find((item) => item.product.id === producto.id)
                      return (
                        <div
                          key={producto.id}
                          className={`p-4 rounded-lg border transition-all ${producto.stock === 0
                            ? "border-destructive/50 bg-destructive/5 opacity-70"
                            : producto.stock < producto.minimo
                              ? "border-warning/50 bg-warning/5"
                              : "border-border bg-secondary/30 hover:border-primary/50"
                            }`}
                        >
                          <div className="text-4xl text-center mb-2">{producto.imagen}</div>
                          <h4 className="font-medium text-foreground text-sm text-center truncate">
                            {producto.nombre}
                          </h4>
                          <p className="text-primary font-semibold text-center">
                            ${producto.precio.toLocaleString()}
                          </p>
                          <p className={`text-xs text-center mb-2 ${producto.stock === 0
                            ? "text-destructive font-medium"
                            : producto.stock < producto.minimo
                              ? "text-[#f59e0b]"
                              : "text-muted-foreground"
                            }`}>
                            {producto.stock === 0 ? "AGOTADO" : `Stock: ${producto.stock}`}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              className="h-8 w-8 border-0 transition-opacity"
                              style={{
                                backgroundColor: enCarrito ? "#f5c2c2" : "#ebebeb",
                                color: enCarrito ? "#7a2020" : "#999999",
                                opacity: enCarrito ? 1 : 0.45,
                              }}
                              onClick={() => removeFromCart(producto.id)}
                              disabled={!enCarrito}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-6 text-center font-medium">
                              {enCarrito?.cantidad || 0}
                            </span>
                            <Button
                              size="icon"
                              className="h-8 w-8 border-0 transition-opacity"
                              style={{
                                backgroundColor: producto.stock === 0 ? "#ebebeb" : "#C2D8C4",
                                color: producto.stock === 0 ? "#999999" : "#2d4f30",
                                opacity: producto.stock === 0 ? 0.45 : 1,
                              }}
                              onClick={() => addToCart(producto)}
                              disabled={producto.stock === 0}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div>
            <Card className="border-border bg-card sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrito
                </CardTitle>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">El carrito está vacío</p>
                ) : (
                  <div className="space-y-3">
                    {carrito.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.product.imagen}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                              {item.product.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">x{item.cantidad}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            ${(item.product.precio * item.cantidad).toLocaleString()}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteFromCart(item.product.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${totalCarrito.toLocaleString()}
                        </span>
                      </div>
                      <Button
                        onClick={openPaymentModal}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Procesar Pago
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Daily Sales View */}
      {view === "ventas-diarias" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                {/* Date filter */}
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Fecha
                  </label>
                  <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las fechas</SelectItem>
                      {fechasDisponibles.map(f => (
                        <SelectItem key={f} value={f}>
                          {f === today ? `Hoy (${f})` : f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch filter */}
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Sede
                  </label>
                  <Select 
                    value={filtroSede} 
                    onValueChange={setFiltroSede}
                    disabled={userRole === "encargado"}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Todas las sedes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las sedes</SelectItem>
                      {sedesOptions.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Shift filter */}
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Turno
                  </label>
                  <Select value={filtroTurno} onValueChange={setFiltroTurno}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Todos los turnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los turnos</SelectItem>
                      <SelectItem value="mañana">☀️ Mañana (hasta 12:59)</SelectItem>
                      <SelectItem value="tarde">🌤️ Tarde (13:00–17:59)</SelectItem>
                      <SelectItem value="noche">🌙 Noche (18:00+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset button */}
                {(filtroFecha !== today || (userRole !== "encargado" && filtroSede !== "todas") || filtroTurno !== "todos") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-end text-muted-foreground hover:text-foreground text-xs gap-1"
                    onClick={() => { 
                      setFiltroFecha(today); 
                      setFiltroSede(userRole === "encargado" ? (sedeId || "S001") : "todas"); 
                      setFiltroTurno("todos");
                    }}
                  >
                    <X className="w-3.5 h-3.5" /> Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Active-filter summary pill */}
              <div className="mt-3 flex flex-wrap gap-2">
                {filtroFecha !== "todas" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    <Calendar className="w-3 h-3" />
                    {filtroFecha === today ? "Hoy" : filtroFecha}
                  </span>
                )}
                {filtroSede !== "todas" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    <MapPin className="w-3 h-3" />
                    {sedesOptions.find(s => s.id === filtroSede)?.nombre}
                  </span>
                )}
                {filtroTurno !== "todos" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                    <Clock className="w-3 h-3" />
                    Turno {filtroTurno}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards (filter-aware) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendido</p>
                    <p className="text-2xl font-bold text-primary">${filteredStats.totalVentas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad de Ventas</p>
                    <p className="text-2xl font-bold text-foreground">{filteredStats.cantidadVentas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio por Venta</p>
                    <p className="text-2xl font-bold text-foreground">${Math.round(filteredStats.promedioVenta).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Historial de Ventas
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ventasFiltradas.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Sin resultados para los filtros aplicados</p>
                  <p className="text-sm text-muted-foreground">Probá cambiando la fecha, la sede o el turno</p>
                  <Button variant="outline" size="sm" onClick={() => { 
                    setFiltroFecha(today); 
                    setFiltroSede(userRole === "encargado" ? (sedeId || "S001") : "todas"); 
                    setFiltroTurno("todos");
                  }}>
                    Ver ventas de hoy
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Fecha</TableHead>
                        <TableHead className="text-muted-foreground">Hora</TableHead>
                        <TableHead className="text-muted-foreground">Turno</TableHead>
                        <TableHead className="text-muted-foreground">Sede</TableHead>
                        <TableHead className="text-muted-foreground">N° Ticket</TableHead>
                        <TableHead className="text-muted-foreground">Cliente</TableHead>
                        <TableHead className="text-muted-foreground">Items</TableHead>
                        <TableHead className="text-muted-foreground">Medio</TableHead>
                        <TableHead className="text-muted-foreground text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventasFiltradas.map((venta) => (
                        <TableRow key={venta.id} className="border-border">
                          <TableCell className="text-muted-foreground text-sm">{venta.fecha}</TableCell>
                          <TableCell className="text-foreground">{venta.hora}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              venta.turno === "mañana"
                                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                : venta.turno === "tarde"
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}>
                              {venta.turno === "mañana" ? "☀️" : venta.turno === "tarde" ? "🌤️" : "🌙"} {venta.turno}
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground text-sm">{venta.sede}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{venta.id}</TableCell>
                          <TableCell className="text-foreground">
                            {venta.cliente || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {venta.items.map(i => `${i.cantidad}× ${i.nombre}`).join(", ")}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-secondary text-foreground">
                              {venta.medio}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            ${venta.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}


      {/* Stock View */}
      {view === "stock" && attemptingOrder && outOfStockProducts.length === 0 && lowStockProducts.length === 0 && !isPreventiveOrder ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-24 h-24 rounded-full bg-[#C2D8C4]/20 flex items-center justify-center">
            <Check className="w-12 h-12 text-[#C2D8C4]" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-foreground">¡Excelente!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Todos los productos están por encima del stock mínimo.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button variant="outline" onClick={() => {
              if (openOrderDialogOnMount) {
                onBack()
              } else {
                setAttemptingOrder(false)
              }
            }} className="min-w-[200px]">
              Volver
            </Button>
            {userRole !== "secretaria" && (
              <Button 
                onClick={() => {
                  setIsPreventiveOrder(true)
                }}
                className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 min-w-[200px]"
              >
                Realizar Pedido Preventivo
              </Button>
            )}
          </div>
          
          {/* Historial de Reposición Reciente */}
          <div className="w-full max-w-md mt-12 bg-secondary/30 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Truck className="w-4 h-4" />
              <h4 className="font-medium text-sm">Última reposición confirmada</h4>
            </div>
            <div className="space-y-1">
               <p className="text-sm font-semibold text-foreground capitalize">{globalLastOrder ? globalLastOrder.usuario : userRole}</p>
               <p className="text-xs text-muted-foreground">{globalLastOrder ? `${globalLastOrder.fecha} · ${globalLastOrder.hora}` : "Hoy · Hace un momento"}</p>
               <p className="text-xs text-muted-foreground mt-2">{globalLastOrder ? globalLastOrder.resumen : "Batido Proteico (x10), Agua Mineral (x20)"}</p>
               <Button 
                 variant="link" 
                 className="px-0 h-auto text-xs text-[#C2D8C4] mt-2 font-medium"
                 onClick={() => setShowLastOrderReceipt(true)}
               >
                 Ver comprobante →
               </Button>
            </div>
          </div>
        </div>
      ) : view === "stock" && (
        <div className="space-y-6">
          {/* Inventory Alerts */}
          {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outOfStockProducts.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                      <AlertOctagon className="w-5 h-5" />
                      Productos Agotados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {outOfStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{p.imagen}</span>
                          <span className="text-foreground">{p.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {lowStockProducts.length > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#f59e0b]">
                      <AlertTriangle className="w-5 h-5" />
                      Stock Bajo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{p.imagen}</span>
                            <span className="text-foreground">{p.nombre}</span>
                          </div>
                          <span className="text-[#f59e0b] font-medium">{p.stock} uds</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Inventario Completo</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => {
                  setAuditoriaProduct("")
                  setAuditoriaPhysicalCount("")
                  setShowAuditoriaDialog(true)
                }}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Auditar Stock
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportDialog(true)} 
                  className="gap-2 border-[#C2D8C4] text-[#C2D8C4] hover:bg-[#C2D8C4]/10"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Reporte
                </Button>
                {userRole !== "secretaria" && (
                  <Button
                    onClick={() => {
                      if (selectedProducts.length === 0 && hasShortage) {
                        const shortageIds = [...outOfStockProducts, ...lowStockProducts].map(p => p.id)
                        setSelectedProducts(shortageIds)
                        const initialQuantities: Record<number, number> = {}
                        shortageIds.forEach(id => {
                          const p = productos.find(x => x.id === id)
                          if (p) initialQuantities[id] = p.minimo - p.stock > 0 ? p.minimo - p.stock + 10 : 20
                        })
                        setPreventiveQuantities(initialQuantities)
                      } else if (selectedProducts.length === 0 && !hasShortage) {
                        showToast("Seleccioná al menos un producto de la tabla.", "info")
                        return
                      }
                      setShowOrderDialog(true)
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Generar Pedido
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros y ordenamiento */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <StockSortButton label="Nombre" keyName="nombre" />
                  <StockSortButton label="Precio" keyName="precio" />
                  <StockSortButton label="Stock" keyName="stock" />
                  <StockSortButton label="Mínimo" keyName="minimo" />
                </div>
              </div>

              {filteredAndSortedProductos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No se encontraron productos con ese criterio de búsqueda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {userRole !== "secretaria" && <TableHead className="w-12"></TableHead>}
                      <TableHead className="text-muted-foreground">Producto</TableHead>
                      <TableHead className="text-muted-foreground text-center">Precio</TableHead>
                      <TableHead className="text-muted-foreground text-center">Stock Actual</TableHead>
                      <TableHead className="text-muted-foreground text-center">Mínimo</TableHead>
                      <TableHead className="text-muted-foreground text-center">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-center">Estado de Reposición</TableHead>
                      {userRole !== "secretaria" && <TableHead className="text-muted-foreground text-center w-32">Reponer (Cant.)</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedProductos.map((producto) => {
                      const isOutOfStock = producto.stock === 0
                      const isLowStock = producto.stock < producto.minimo && producto.stock > 0
                      return (
                        <TableRow
                          key={producto.id}
                          className={`border-border cursor-pointer select-none ${isOutOfStock ? "bg-destructive/5" : isLowStock ? "bg-warning/5" : ""} ${userRole !== "secretaria" ? "hover:bg-secondary/50" : ""}`}
                          onClick={() => {
                            if (userRole === "secretaria") return
                            const isSelected = selectedProducts.includes(producto.id)
                            if (isSelected) {
                              setSelectedProducts(selectedProducts.filter(id => id !== producto.id))
                            } else {
                              setSelectedProducts([...selectedProducts, producto.id])
                              if (!preventiveQuantities[producto.id]) {
                                setPreventiveQuantities({...preventiveQuantities, [producto.id]: 20})
                              }
                            }
                          }}
                        >
                          {userRole !== "secretaria" && (
                            <TableCell>
                              <input 
                                type="checkbox"
                                checked={selectedProducts.includes(producto.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, producto.id])
                                    setPreventiveQuantities({...preventiveQuantities, [producto.id]: 20})
                                  } else {
                                    setSelectedProducts(selectedProducts.filter(id => id !== producto.id))
                                  }
                                }}
                                className="w-4 h-4 rounded border-border accent-primary"
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{producto.imagen}</span>
                              <span className="font-medium text-foreground">{producto.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-foreground">
                            ${producto.precio.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-semibold ${isOutOfStock ? "text-destructive" : isLowStock ? "text-[#f59e0b]" : "text-foreground"
                                }`}
                            >
                              {producto.stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {producto.minimo}
                          </TableCell>
                          <TableCell className="text-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                <AlertOctagon className="w-3 h-3" />
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-[#f59e0b]">
                                <AlertTriangle className="w-3 h-3" />
                                Bajo mínimo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                <Check className="w-3 h-3" />
                                OK
                              </span>
                            )}
                          </TableCell>
                          {/* ── Estado de Reposición ─────────────────── */}
                          <TableCell className="text-center">
                            {(() => {
                              const lastQty = globalLastOrder?.productQuantities?.[producto.id]
                              const manualQty = preventiveQuantities[producto.id]
                              const isSelected = selectedProducts.includes(producto.id)

                              if (isSelected && isPreventiveOrder && manualQty && lastQty) {
                                // Suma: base del historial + refuerzo manual
                                return (
                                  <span
                                    title="Cantidad base del sistema + refuerzo manual"
                                    className="inline-flex items-center gap-1 cursor-help"
                                  >
                                    <span className="text-xs text-muted-foreground/60">{lastQty}</span>
                                    <span className="text-xs text-muted-foreground/60">+</span>
                                    <span className="text-xs font-bold" style={{ color: "#C2D8C4" }}>{manualQty}</span>
                                  </span>
                                )
                              }

                              if (isSelected && isPreventiveOrder && manualQty) {
                                // Solo cantidad manual (sin historial previo)
                                return (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="text-xs font-bold" style={{ color: "#C2D8C4" }}>📦 {manualQty}</span>
                                  </span>
                                )
                              }

                              if (lastQty) {
                                // Badge del historial reciente
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                                    📦 {lastQty}
                                  </span>
                                )
                              }

                              return <span className="text-muted-foreground/40 text-xs">-</span>
                            })()}
                          </TableCell>
                          {userRole !== "secretaria" && (
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              {selectedProducts.includes(producto.id) ? (
                                <Input 
                                  type="number"
                                  min="1"
                                  className="w-16 mx-auto h-8 text-center bg-input border-border"
                                  value={preventiveQuantities[producto.id] || ""}
                                  onChange={(e) => setPreventiveQuantities({...preventiveQuantities, [producto.id]: parseInt(e.target.value) || 0})}
                                />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Procesar Pago</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seleccione el método de pago y complete la información del cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Client Search */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente (opcional)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ingresar DNI"
                    value={clientDni}
                    onChange={(e) => handleDniSearch(e.target.value)}
                    className="bg-input border-border text-foreground pl-10"
                  />
                </div>
              </div>
              {clientName && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Cliente encontrado:</p>
                  <p className="font-semibold text-foreground">{clientName}</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-foreground">Medio de Pago</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="efectivo" id="pos-efectivo" className="peer sr-only" />
                  <Label
                    htmlFor="pos-efectivo"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 border-border"
                  >
                    <Banknote className="w-6 h-6 mb-2" />
                    <span className="text-sm">Efectivo</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="qr" id="pos-qr" className="peer sr-only" />
                  <Label
                    htmlFor="pos-qr"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 border-border"
                  >
                    <QrCode className="w-6 h-6 mb-2" />
                    <span className="text-sm">QR</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="tarjeta" id="pos-tarjeta" className="peer sr-only" />
                  <Label
                    htmlFor="pos-tarjeta"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 border-border"
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-sm">Tarjeta</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Total */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-foreground">Total a Cobrar</span>
                <span className="text-2xl font-bold text-primary">${totalCarrito.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              onClick={procesarVenta}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="bg-background border-none shadow-none max-w-md p-0" aria-describedby={undefined} showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Recibo de Compra</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4">
              {/* Paper Receipt */}
              <div className="bg-white text-gray-800 rounded-lg shadow-2xl overflow-hidden">
                {/* Zigzag top edge */}
                <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />

                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="text-center border-b border-dashed border-gray-300 pb-4">
                    <div className="text-2xl font-bold tracking-tight">SQUATGYM</div>
                    <div className="text-xs text-gray-500 mt-1">KIOSCO</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {receipt.sede.direccion}
                    </div>
                    <div className="text-xs text-gray-500">Tel: {receipt.sede.telefono}</div>
                    <div className="text-xs text-gray-500">CUIT: {receipt.sede.cuit}</div>
                  </div>

                  {/* Receipt Info */}
                  <div className="text-center space-y-1">
                    <div className="text-lg font-semibold">TICKET DE VENTA</div>
                    <div className="text-sm text-gray-600 font-mono">#{receipt.numero}</div>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {receipt.fecha}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {receipt.hora}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-300" />

                  {/* Client Info */}
                  {receipt.cliente && (
                    <>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Cliente</div>
                        <div className="font-semibold">{receipt.cliente}</div>
                        <div className="text-sm text-gray-600">DNI: {receipt.dniCliente}</div>
                      </div>
                      <div className="border-t border-dashed border-gray-300" />
                    </>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Detalle</div>
                    <div className="space-y-1">
                      {receipt.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.cantidad}x {item.nombre}</span>
                          <span>${(item.precio * item.cantidad).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-300" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL</span>
                    <span>${receipt.total.toLocaleString()}</span>
                  </div>

                  {/* Payment Method */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Forma de Pago</span>
                    <span className="font-medium">{receipt.medio}</span>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-4 border-t border-dashed border-gray-300">
                    <div className="text-xs text-gray-500">Gracias por su compra</div>
                    <div className="text-xs text-gray-400 mt-1">www.squatgym.com</div>
                  </div>

                  {/* Barcode simulation */}
                  <div className="flex justify-center pt-2">
                    <div className="flex gap-[2px]">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-800"
                          style={{
                            width: Math.random() > 0.5 ? "2px" : "1px",
                            height: "30px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zigzag bottom edge */}
                <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border" onClick={closeReceipt}>
                  Cerrar
                </Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" className="border-border">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Last Order Receipt Modal */}
      <Dialog open={showLastOrderReceipt} onOpenChange={setShowLastOrderReceipt}>
        <DialogContent className="bg-transparent border-none shadow-none max-w-md p-0" aria-describedby={undefined} showCloseButton={false}>
           <div className="flex justify-end mb-2">
             <Button 
               variant="outline" 
               size="icon" 
               onClick={() => setShowLastOrderReceipt(false)} 
               className="rounded-full bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-colors w-10 h-10 shadow-sm"
             >
                <X className="w-5 h-5" />
             </Button>
           </div>
           <DialogHeader className="sr-only">
             <DialogTitle>Comprobante de Reposición</DialogTitle>
           </DialogHeader>
           <div className="bg-white text-gray-800 rounded-lg shadow-2xl overflow-hidden relative">
              <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />
              <div className="p-6 space-y-4">
                 <div className="text-center border-b border-dashed border-gray-300 pb-4">
                    <div className="text-2xl font-bold tracking-tight">SQUATGYM</div>
                    <div className="text-xs text-gray-500 mt-1">REPOSICIÓN KIOSCO</div>
                 </div>
                 <div className="text-center space-y-1">
                    <div className="text-lg font-semibold">COMPROBANTE</div>
                    <div className="text-sm text-gray-600 font-mono">#{globalLastOrder ? "PED-" + globalLastOrder.hora.replace(":", "") + "A" : "PED-00001"}</div>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {globalLastOrder ? globalLastOrder.fecha : "Hoy"}</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {globalLastOrder ? globalLastOrder.hora : "Hace un momento"}</span>
                    </div>
                 </div>
                 <div className="border-t border-dashed border-gray-300" />
                 <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Usuario</div>
                    <div className="font-semibold capitalize">{globalLastOrder ? globalLastOrder.usuario : userRole}</div>
                 </div>
                 <div className="border-t border-dashed border-gray-300" />
                 <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Detalle</div>
                    <div className="space-y-1 text-sm font-medium">
                       {globalLastOrder ? globalLastOrder.resumen : "Batido Proteico (x10), Agua Mineral (x20)"}
                    </div>
                 </div>
              </div>
              <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />
           </div>
           <div className="flex gap-3">
             <Button variant="outline" className="flex-1 border-border" onClick={() => { setShowLastOrderReceipt(false); onBack(); }}>
               Volver al Inicio
             </Button>
             <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => showToast("Imprimiendo comprobante...", "info")}>
               <Printer className="w-4 h-4 mr-2" />
               Imprimir / Enviar
             </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Generar Pedido de Reposición</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure el tipo de pedido y seleccione los productos a reponer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-foreground">Tipo de Pedido</Label>
              <RadioGroup
                value={orderType}
                onValueChange={(value) => setOrderType(value as "externo" | "interno")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="externo" id="externo" className="peer sr-only" />
                  <Label
                    htmlFor="externo"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 border-border"
                  >
                    <Truck className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="font-medium text-foreground">Externo</span>
                    <span className="text-xs text-muted-foreground">Proveedor</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="interno" id="interno" className="peer sr-only" />
                  <Label
                    htmlFor="interno"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 border-border"
                  >
                    <Building2 className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="font-medium text-foreground">Interno</span>
                    <span className="text-xs text-muted-foreground">Otras Sedes</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Productos a reponer</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {productos.filter(p => selectedProducts.includes(p.id)).map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{producto.imagen}</span>
                      <span className="text-foreground">{producto.nombre}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-medium ${producto.stock === 0 ? "text-destructive" : "text-[#f59e0b]"}`}>
                        Stock actual: {producto.stock}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        + {preventiveQuantities[producto.id] || 0} uds
                      </span>
                    </div>
                  </div>
                ))}
                {selectedProducts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No has seleccionado ningún producto.
                  </p>
                )}
              </div>
            </div>

            {orderType === "externo" && (
              <div className="space-y-2">
                <Label className="text-foreground">Proveedor</Label>
                <Select
                  value={orderDetails.proveedor}
                  onValueChange={(value) => setOrderDetails({ ...orderDetails, proveedor: value })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {proveedoresOptions.map((prov) => (
                      <SelectItem key={prov.id} value={prov.nombre}>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{prov.nombre}</span>
                          <span className="text-xs text-muted-foreground">{prov.rubro}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orderDetails.proveedor && (
                  <p className="text-xs text-muted-foreground">
                    {proveedoresOptions.find(p => p.nombre === orderDetails.proveedor)?.rubro}
                  </p>
                )}
              </div>
            )}

            {orderType === "interno" && (
              <div className="space-y-2">
                <Label className="text-foreground">Sede Destino</Label>
                <Select
                  value={orderDetails.sede}
                  onValueChange={(value) => setOrderDetails({ ...orderDetails, sede: value })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Seleccionar sede..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {sedesOptions.map((sede) => (
                      <SelectItem key={sede.id} value={sede.nombre}>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{sede.nombre}</span>
                          <span className="text-xs text-muted-foreground">{sede.direccion}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {orderDetails.sede && (
                  <p className="text-xs text-muted-foreground">
                    {sedesOptions.find(s => s.nombre === orderDetails.sede)?.direccion}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-foreground">Notas adicionales</Label>
              <Input
                placeholder="Observaciones del pedido"
                value={orderDetails.notas}
                onChange={(e) => setOrderDetails({ ...orderDetails, notas: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowOrderDialog(false)} className="border-border">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleOrderSubmit}
              disabled={selectedProducts.length === 0 || (orderType === "externo" && !orderDetails.proveedor) || (orderType === "interno" && !orderDetails.sede)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Generar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Modal */}
      <Dialog open={showOrderConfirmation} onOpenChange={setShowOrderConfirmation}>
        <DialogContent className="bg-card border-border" aria-describedby={undefined}>
          <DialogHeader>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-foreground text-center text-xl">Pedido Generado</DialogTitle>
          </DialogHeader>
          {confirmedOrder && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° de Pedido</span>
                  <span className="font-mono font-semibold text-primary">{confirmedOrder.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="text-foreground capitalize">{confirmedOrder.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{confirmedOrder.tipo === "externo" ? "Proveedor" : "Sede Destino"}</span>
                  <span className="text-foreground">{confirmedOrder.destino}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="text-foreground">{confirmedOrder.fecha}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Productos solicitados</Label>
                <div className="space-y-2">
                  {confirmedOrder.productos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.imagen}</span>
                        <span className="text-foreground">{p.nombre}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Stock actual: {p.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={closeOrderConfirmation}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Auditoría de Stock */}
      <Dialog open={showAuditoriaDialog} onOpenChange={setShowAuditoriaDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ClipboardList className="w-5 h-5 text-primary" />
              Auditoría de Inventario
            </DialogTitle>
            <DialogDescription>
              Registrá el conteo físico real. Si difiere del sistema, se actualizará el stock y se emitirá una alerta de inconsistencia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Producto</Label>
              <Select 
                value={auditoriaProduct.toString()} 
                onValueChange={(val) => setAuditoriaProduct(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.imagen} {p.nombre} (Sistema: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {auditoriaProduct !== "" && (
              <div className="space-y-2">
                <Label className="text-foreground">Conteo Físico Real</Label>
                <Input
                  type="number"
                  min="0"
                  value={auditoriaPhysicalCount}
                  onChange={(e) => setAuditoriaPhysicalCount(e.target.value)}
                  placeholder="Ej: 5"
                />
              </div>
            )}

            {auditoriaProduct !== "" && auditoriaPhysicalCount !== "" && (
              <div className={`p-3 rounded-md text-sm border ${
                Number(auditoriaPhysicalCount) === productos.find(p => p.id === auditoriaProduct)?.stock
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}>
                {Number(auditoriaPhysicalCount) === productos.find(p => p.id === auditoriaProduct)?.stock ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Coincide perfectamente con el sistema.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertOctagon className="w-4 h-4" />
                      Inconsistencia detectada
                    </div>
                    <span>Diferencia: {Number(auditoriaPhysicalCount) - (productos.find(p => p.id === auditoriaProduct)?.stock || 0)} unidades.</span>
                    <span>El stock se actualizará a {auditoriaPhysicalCount}.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAuditoriaDialog(false)}>
              Cancelar
            </Button>
            <Button 
              disabled={auditoriaProduct === "" || auditoriaPhysicalCount === ""}
              onClick={() => {
                const prodId = Number(auditoriaProduct)
                const physical = Number(auditoriaPhysicalCount)
                const prod = productos.find(p => p.id === prodId)
                
                if (prod && prod.stock !== physical) {
                  // Registrar inconsistencia
                  const diff = physical - prod.stock
                  setProductos(productos.map(p => p.id === prodId ? { ...p, stock: physical } : p))
                  setShowAuditoriaDialog(false)
                  showToast(`Inconsistencia de inventario registrada en ${prod.nombre}. Diferencia: ${diff > 0 ? '+' : ''}${diff}.`, "info")
                } else {
                  setShowAuditoriaDialog(false)
                  showToast("Auditoría correcta. Sin diferencias.", "success")
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Imprimir Reporte de Inventario</DialogTitle>
            <DialogDescription>
              Seleccione los parámetros para generar el reporte de stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input type="date" value={reportDateFrom} onChange={(e) => setReportDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input type="date" value={reportDateTo} onChange={(e) => setReportDateTo(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sucursal</Label>
              <Select
                value={reportSedeId}
                onValueChange={setReportSedeId}
                disabled={userRole !== "administrador"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {userRole === "administrador" && (
                    <SelectItem value="todas">Todas las sucursales</SelectItem>
                  )}
                  {sedesOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => {
                showToast("Generando reporte...", "success")
                setShowReportDialog(false)
              }}
              className="bg-[#C2D8C4] text-black hover:bg-[#C2D8C4]/80"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}