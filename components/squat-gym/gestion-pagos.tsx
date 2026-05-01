"use client"

import { useState, useMemo } from "react"
import {
  ArrowLeft,
  Search,
  Package,
  Receipt,
  Calendar,
  DollarSign,
  CreditCard,
  Download,
  Check,
  Clock,
  Printer,
  AlertTriangle,
  Truck,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"


interface GestionPagosProps {
  onBack: () => void
  showToast: (message: string, type?: "success" | "info") => void
}

type PaymentView = "list" | "form" | "receipt"

interface Proveedor {
  id: string
  nombre: string
  rubro: string
  contacto: string
  telefono: string
  email: string
}

interface PagoPendiente {
  id: string
  proveedor: Proveedor
  concepto: string
  monto: number
  fechaVencimiento: string
  diasAtraso: number
  factura?: string
}

interface RegistroPago {
  id: string
  proveedor: Proveedor
  concepto: string
  monto: number
  medioPago: string
  factura: string
  fechaPago: string
  horaPago: string
  numero: string
  notas: string
}

const sedeInfo = {
  nombre: "SquatGym - Sede Central",
  direccion: "French 414, Resistencia Chaco",
  telefono: "+54 9 362410101010",
  cuit: "30-12345678-9",
}

// Mock providers
const proveedores: Proveedor[] = [
  {
    id: "P001",
    nombre: "FitSupply Corp",
    rubro: "Insumos y Equipamiento",
    contacto: "Juan Rodríguez",
    telefono: "+54 362 123-4567",
    email: "ventas@fitsupply.com",
  },
  {
    id: "P002",
    nombre: "Bebidas Premium SA",
    rubro: "Bebidas e Isotónicos",
    contacto: "María López",
    telefono: "+54 362 234-5678",
    email: "contacto@bebidasprm.com",
  },
  {
    id: "P003",
    nombre: "Equipos Deportivos XXL",
    rubro: "Equipamiento",
    contacto: "Carlos Menéndez",
    telefono: "+54 362 345-6789",
    email: "admin@equiposxl.com",
  },
  {
    id: "P004",
    nombre: "Nutrición & Energía",
    rubro: "Proteínas y Suplementos",
    contacto: "Ana García",
    telefono: "+54 362 456-7890",
    email: "pedidos@nutricion-energia.com",
  },
]

// Mock pending payments
const pagosPendientesIniciales: PagoPendiente[] = [
  {
    id: "PPend-001",
    proveedor: proveedores[0],
    concepto: "Insumos",
    monto: 45000,
    fechaVencimiento: "2026-04-15",
    diasAtraso: 9,
    factura: "AFIP-2026-001234",
  },
  {
    id: "PPend-002",
    proveedor: proveedores[1],
    concepto: "Bebidas",
    monto: 28500,
    fechaVencimiento: "2026-04-10",
    diasAtraso: 14,
    factura: "AFIP-2026-001235",
  },
  {
    id: "PPend-003",
    proveedor: proveedores[2],
    concepto: "Equipamiento",
    monto: 125000,
    fechaVencimiento: "2026-05-01",
    diasAtraso: 0,
  },
]

const conceptosDisponibles = [
  "Insumos",
  "Bebidas",
  "Equipamiento",
  "Mantenimiento",
  "Servicios",
  "Otros",
]

const mediosPago = [
  { id: "efectivo", nombre: "Efectivo", icon: Check },
  { id: "transferencia", nombre: "Transferencia Bancaria", icon: CreditCard },
  { id: "cheque", nombre: "Cheque", icon: Receipt },
]

export function GestionPagos({ onBack, showToast }: GestionPagosProps) {
  const [view, setView] = useState<PaymentView>("list")
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>(pagosPendientesIniciales)
  const [registrosPagos, setRegistrosPagos] = useState<RegistroPago[]>([])

  // Form state
  const [selectedProveedor, setSelectedProveedor] = useState<string>("")
  const [concepto, setConcepto] = useState<string>("")
  const [monto, setMonto] = useState<string>("")
  const [factura, setFactura] = useState<string>("")
  const [medioPago, setMedioPago] = useState<string>("efectivo")
  const [notas, setNotas] = useState<string>("")
  const [receipt, setReceipt] = useState<RegistroPago | null>(null)

  const totalPendiente = pagosPendientes.reduce((sum, p) => sum + p.monto, 0)
  const cantidadPendiente = pagosPendientes.length
  const montoCritico = pagosPendientes.filter((p) => p.diasAtraso >= 14).length

  const handleRegistrarPago = () => {
    if (!selectedProveedor || !concepto || !monto || parseFloat(monto) <= 0) {
      showToast("Por favor complete todos los campos requeridos", "info")
      return
    }

    const proveedorSeleccionado = proveedores.find((p) => p.id === selectedProveedor)
    if (!proveedorSeleccionado) return

    const now = new Date()
    const medioPagoObj = mediosPago.find((m) => m.id === medioPago)

    const nuevoPago: RegistroPago = {
      id: `PAG-${Date.now().toString().slice(-8)}`,
      proveedor: proveedorSeleccionado,
      concepto,
      monto: parseFloat(monto),
      medioPago: medioPagoObj?.nombre || "Efectivo",
      factura: factura || `AFIP-AUTO-${Date.now().toString().slice(-6)}`,
      fechaPago: now.toLocaleDateString("es-AR"),
      horaPago: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      numero: `PAG-${Date.now().toString().slice(-6)}`,
      notas,
    }

    // Remove from pending payments
    setPagosPendientes(
      pagosPendientes.filter((p) => p.proveedor.id !== selectedProveedor || p.monto !== parseFloat(monto))
    )

    // Add to registered payments
    setRegistrosPagos([nuevoPago, ...registrosPagos])

    setReceipt(nuevoPago)
    setView("receipt")
    showToast(`Pago de $${parseFloat(monto).toLocaleString()} registrado exitosamente`)

    // Reset form
    setSelectedProveedor("")
    setConcepto("")
    setMonto("")
    setFactura("")
    setMedioPago("efectivo")
    setNotas("")
  }

  const resetForm = () => {
    setSelectedProveedor("")
    setConcepto("")
    setMonto("")
    setFactura("")
    setMedioPago("efectivo")
    setNotas("")
    setView("list")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={view === "list" ? onBack : resetForm}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Pagos a Proveedores</h2>
          <p className="text-muted-foreground">Registra pagos de egresos y gastos del gimnasio</p>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Alert Banner */}
          {montoCritico > 0 && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ {montoCritico} pago(s) en estado crítico ({">"}14 días de atraso)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Riesgo de corte de suministro. Procesar inmediatamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pendiente</p>
                    <p className="text-2xl font-bold text-destructive">
                      ${totalPendiente.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-foreground">{cantidadPendiente}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos Registrados</p>
                    <p className="text-2xl font-bold text-primary">{registrosPagos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Payment Button */}
          <Button
            onClick={() => setView("form")}
            className="w-full bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Nuevo Pago
          </Button>

          {/* Pending Payments */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Pagos Pendientes a Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pagosPendientes.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 text-primary mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No hay pagos pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pagosPendientes.map((pago) => (
                    <div
                      key={pago.id}
                      className={`p-4 rounded-lg border ${pago.diasAtraso >= 14
                        ? "border-destructive/50 bg-destructive/5"
                        : pago.diasAtraso >= 7
                          ? "border-warning/50 bg-warning/5"
                          : "border-border bg-secondary/30"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{pago.proveedor.nombre}</p>
                          <p className="text-sm text-muted-foreground">{pago.concepto}</p>
                        </div>
                        {pago.diasAtraso >= 14 && (
                          <span className="px-2 py-1 rounded-full bg-destructive text-white text-xs font-medium">
                            CRÍTICO
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Monto</p>
                          <p className="font-bold text-destructive">
                            ${pago.monto.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Vencimiento</p>
                          <p className="font-medium text-foreground">
                            {new Date(pago.fechaVencimiento).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Días de Atraso</p>
                          <p
                            className={`font-bold ${pago.diasAtraso >= 14
                              ? "text-destructive"
                              : pago.diasAtraso >= 7
                                ? "text-[#f59e0b]"
                                : "text-foreground"
                              }`}
                          >
                            {pago.diasAtraso} días
                          </p>
                        </div>
                        <div className="text-right">
                          <Button
                            onClick={() => {
                              setSelectedProveedor(pago.proveedor.id)
                              setConcepto(pago.concepto)
                              setMonto(pago.monto.toString())
                              setFactura(pago.factura || "")
                              setView("form")
                            }}
                            className="w-full h-8 bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 text-xs"
                          >
                            Pagar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          {registrosPagos.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Pagos Registrados Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {registrosPagos.map((pago) => (
                    <div
                      key={pago.id}
                      className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{pago.proveedor.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {pago.horaPago} • {pago.medioPago}
                        </p>
                      </div>
                      <p className="font-bold text-primary">${pago.monto.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Form View */}
      {view === "form" && (
        <Card className="max-w-2xl mx-auto border-border bg-card">
          <CardHeader>
            <CardTitle>Registrar Pago a Proveedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Proveedor *</Label>
              <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {proveedores.map((prov) => (
                    <SelectItem key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider Info */}
            {selectedProveedor && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                {proveedores
                  .filter((p) => p.id === selectedProveedor)
                  .map((prov) => (
                    <div key={prov.id} className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <strong>Rubro:</strong> {prov.rubro}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Contacto:</strong> {prov.contacto}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Email:</strong> {prov.email}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {/* Concept */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Concepto *</Label>
              <Select value={concepto} onValueChange={setConcepto}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Seleccionar concepto" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {conceptosDisponibles.map((con) => (
                    <SelectItem key={con} value={con}>
                      {con}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Monto ($) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="bg-input border-border text-foreground"
                min="0"
                step="0.01"
              />
            </div>

            {/* Invoice */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">
                Factura / Comprobante AFIP
              </Label>
              <Input
                placeholder="Ej: AFIP-2026-001234"
                value={factura}
                onChange={(e) => setFactura(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Medio de Pago *</Label>
              <RadioGroup value={medioPago} onValueChange={setMedioPago} className="grid grid-cols-3 gap-3">
                <div>
                  <RadioGroupItem value="efectivo" id="pag-efectivo" className="peer sr-only" />
                  <Label
                    htmlFor="pag-efectivo"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-[#C2D8C4] peer-data-[state=checked]:bg-[#C2D8C4]/10 border-border"
                  >
                    <Receipt className="w-6 h-6 mb-2" />
                    <span className="text-sm text-center">Efectivo</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="transferencia" id="pag-transferencia" className="peer sr-only" />
                  <Label
                    htmlFor="pag-transferencia"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-[#C2D8C4] peer-data-[state=checked]:bg-[#C2D8C4]/10 border-border"
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-sm text-center">Transferencia</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cheque" id="pag-cheque" className="peer sr-only" />
                  <Label
                    htmlFor="pag-cheque"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer hover:bg-secondary/50 peer-data-[state=checked]:border-[#C2D8C4] peer-data-[state=checked]:bg-[#C2D8C4]/10 border-border"
                  >
                    <Check className="w-6 h-6 mb-2" />
                    <span className="text-sm text-center">Cheque</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Notas/Observaciones</Label>
              <Textarea
                placeholder="Observaciones del pago..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="bg-input border-border text-foreground"
                rows={3}
              />
            </div>

            {/* Summary */}
            {monto && (
              <div className="p-4 rounded-lg bg-[#C2D8C4]/10 border border-[#C2D8C4]">
                <div className="flex justify-between">
                  <span className="text-foreground font-medium">Monto a Pagar</span>
                  <span className="text-2xl font-bold text-[#C2D8C4]">
                    ${parseFloat(monto || "0").toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1 border-border text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegistrarPago}
                className="flex-1 bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-semibold"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar Pago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt View */}
      {view === "receipt" && receipt && (
        <div className="max-w-md mx-auto">
          {/* Paper Receipt */}
          <div className="bg-white text-gray-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Zigzag top edge */}
            <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <div className="text-2xl font-bold tracking-tight">SQUATGYM</div>
                <div className="text-xs text-gray-500 mt-1">COMPROBANTE DE EGRESO</div>
                <div className="text-xs text-gray-500 mt-1">Pago a Proveedor</div>
              </div>

              {/* Receipt Info */}
              <div className="text-center space-y-1">
                <div className="text-lg font-semibold">COMPROBANTE DE PAGO</div>
                <div className="text-sm text-gray-600 font-mono">#{receipt.numero}</div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {receipt.fechaPago}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {receipt.horaPago}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300" />

              {/* Provider Info */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Proveedor</div>
                <div className="font-semibold">{receipt.proveedor.nombre}</div>
                <div className="text-sm text-gray-600">
                  <p>{receipt.proveedor.contacto}</p>
                  <p>{receipt.proveedor.email}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300" />

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Concepto</span>
                  <span className="font-medium">{receipt.concepto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monto</span>
                  <span className="font-semibold">${receipt.monto.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medio de Pago</span>
                  <span className="font-medium">{receipt.medioPago}</span>
                </div>
                {receipt.factura && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Factura/Comprobante</span>
                    <span className="font-mono text-xs">{receipt.factura}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300" />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL PAGADO</span>
                <span>${receipt.monto.toLocaleString()}</span>
              </div>

              {/* Notes */}
              {receipt.notas && (
                <>
                  <div className="border-t border-dashed border-gray-300" />
                  <div className="text-xs text-gray-600">
                    <strong>Observaciones:</strong>
                    <p className="mt-1">{receipt.notas}</p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="text-center pt-4 border-t border-dashed border-gray-300">
                <div className="text-xs text-gray-500">Pago Registrado en Sistema</div>
                <div className="text-xs text-gray-400 mt-1">www.squatgym.com</div>
              </div>
            </div>

            {/* Zigzag bottom edge */}
            <div className="h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#e5e5e5_10px,#e5e5e5_20px)]" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={resetForm}
            >
              Nueva Operación
            </Button>
            <Button className="flex-1 bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" className="border-border">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
