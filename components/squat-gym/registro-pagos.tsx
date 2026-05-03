"use client"

import { useState } from "react"
import { Search, UserCircle, CreditCard, Tag, Calendar, Receipt, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alumno, Plan, Promocion } from "./types"

interface RegistroPagosProps {
  alumnos: Alumno[]
  planes: Plan[]
  promociones: Promocion[]
  onPagar: (alumnoId: string, monto: number, metodo: string, promoId?: string) => void
  onBack: () => void
  showToast: (msg: string, type: "success" | "info") => void
}

export function RegistroPagos({ alumnos, planes, promociones, onPagar, onBack, showToast }: RegistroPagosProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)
  const [selectedPromo, setSelectedPromo] = useState<Promocion | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo")
  
  // Nuevos estados
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [prorrateoFactor, setProrrateoFactor] = useState<number | null>(null)

  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  const handleSearch = () => {
    const found = alumnos.find(a => a.dni === searchTerm || a.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    if (found) {
      setSelectedAlumno(found)
      setSelectedPlanId(found.planId)
      setSelectedPromo(null)
      setCouponCode("")
      setAppliedCoupon(null)
      setProrrateoFactor(null)
      setShowReceipt(false)
    } else {
      showToast("Alumno no encontrado", "info")
      setSelectedAlumno(null)
    }
  }

  const handlePagar = () => {
    if (!selectedAlumno) return
    const plan = planes.find(p => p.id === selectedPlanId)
    if (!plan) return

    let montoBase = selectedAlumno.deuda > 0 ? selectedAlumno.deuda : plan.precio
    if (prorrateoFactor !== null) {
      montoBase = montoBase * prorrateoFactor
    }

    let descuento = 0
    if (selectedPromo) {
      descuento = montoBase * (selectedPromo.descuentoPorcentaje / 100)
    } else if (appliedCoupon) {
      descuento = montoBase * 0.20 // 20% OFF por cupón
    }

    const total = montoBase - descuento

    onPagar(selectedAlumno.id, total, selectedMethod, selectedPromo?.id)

    // Generar recibo
    setReceiptData({
      fecha: new Date().toLocaleString(),
      alumno: selectedAlumno.nombre,
      plan: plan.nombre,
      total: total,
      metodo: selectedMethod,
      promo: selectedPromo ? selectedPromo.codigo : (appliedCoupon ? `CUPON: ${appliedCoupon}` : undefined),
      prorrateo: prorrateoFactor !== null
    })

    setShowReceipt(true)
    showToast("Pago registrado exitosamente", "success")
  }

  if (showReceipt && receiptData) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => { setShowReceipt(false); setSelectedAlumno(null); setSearchTerm("") }}>
            ← Nuevo Pago
          </Button>
          <h2 className="text-xl font-bold">Comprobante Emitido</h2>
        </div>

        <Card className="border-[#C2D8C4] bg-card overflow-hidden">
          <div className="bg-[#C2D8C4] p-4 text-center">
            <Receipt className="w-12 h-12 text-[#222222] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-[#222222]">Recibo Digital</h3>
            <p className="text-sm text-[#222222]/80">SquatGym</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium text-foreground">{receiptData.fecha}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Alumno</span>
              <span className="font-medium text-foreground">{receiptData.alumno}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Concepto</span>
              <span className="font-medium text-foreground">Cuota {receiptData.plan}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Medio de Pago</span>
              <span className="font-medium text-foreground">{receiptData.metodo}</span>
            </div>
            {receiptData.promo && (
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">Promoción</span>
                <span className="font-medium text-success">{receiptData.promo}</span>
              </div>
            )}
            <div className="flex justify-between pt-2">
              <span className="text-lg font-bold text-foreground">Total Pagado</span>
              <span className="text-2xl font-bold text-[#C2D8C4]">${receiptData.total.toLocaleString()}</span>
            </div>

            <Button className="w-full mt-6 bg-secondary text-foreground hover:bg-secondary/80">
              <ExternalLink className="w-4 h-4 mr-2" />
              Imprimir / Enviar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registrar Pago de Cuota</h2>
          <p className="text-muted-foreground mt-1">Busca un alumno para gestionar su pago.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar por DNI o Nombre..."
            className="pl-10 h-12 text-lg bg-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="h-12 px-8 bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 text-lg">
          Buscar
        </Button>
      </div>

      {selectedAlumno && (() => {
        const plan = planes.find(p => p.id === selectedPlanId)
        if (!plan) return null

        let montoBase = selectedAlumno.deuda > 0 ? selectedAlumno.deuda : plan.precio
        const prop = prorrateoFactor
        if (prop !== null) {
          montoBase = montoBase * prop
        }

        let descuento = 0
        if (selectedPromo) {
          descuento = montoBase * (selectedPromo.descuentoPorcentaje / 100)
        } else if (appliedCoupon) {
          descuento = montoBase * 0.20
        }

        const total = montoBase - descuento

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserCircle className="w-5 h-5 text-[#C2D8C4]" />
                  Datos del Alumno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-bold text-lg text-foreground">{selectedAlumno.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DNI</p>
                  <p className="font-medium text-foreground">{selectedAlumno.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plan a cobrar</p>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {planes.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} (${p.precio.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {selectedAlumno.deuda > 0 ? (
                    <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                      Deuda Pendiente
                    </span>
                  ) : (
                    <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                      Al Día
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CreditCard className="w-5 h-5 text-[#C2D8C4]" />
                  Detalle del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">Aplicar Promoción</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {promociones.filter(p => p.activa).map(promo => (
                      <button
                        key={promo.id}
                        onClick={() => {
                          if (appliedCoupon) {
                            showToast("No se puede aplicar una promoción si ya hay un cupón activo.", "info")
                            return
                          }
                          setSelectedPromo(selectedPromo?.id === promo.id ? null : promo)
                        }}
                        className={`p-2 rounded-lg border text-sm text-left transition-colors flex justify-between items-center ${selectedPromo?.id === promo.id ? "border-[#C2D8C4] bg-[#C2D8C4]/10 text-[#C2D8C4]" : "border-border hover:border-[#C2D8C4]/50"
                          }`}
                      >
                        <span className="font-medium">{promo.codigo}</span>
                        <span className="text-xs bg-background px-1.5 py-0.5 rounded">-{promo.descuentoPorcentaje}%</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Cupón de Descuento (20% OFF)</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: CLUB-LA-NACION"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode("") }}>Quitar</Button>
                    ) : (
                      <Button onClick={() => {
                        if (selectedPromo) {
                          showToast("No se puede aplicar un cupón si ya hay una promoción activa.", "info")
                          return
                        }
                        if (!couponCode) {
                          showToast("Ingrese un código de cupón.", "info")
                          return
                        }
                        setAppliedCoupon(couponCode)
                        showToast(`Cupón aplicado exitosamente.`, "success")
                      }}>Aplicar</Button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Medio de Pago</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {["Efectivo", "Tarjeta", "Transferencia"].map((method: any) => (
                      <button
                        key={method}
                        onClick={() => setSelectedMethod(method)}
                        className={`flex-1 py-2 rounded-lg border text-sm text-center transition-colors ${selectedMethod === method ? "border-foreground bg-secondary text-foreground font-semibold" : "border-border text-muted-foreground hover:bg-secondary/50"
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-medium">Inscripción fuera de término</p>
                    <p className="text-xs text-muted-foreground">Calcular cobro prorrateado</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (prorrateoFactor !== null) {
                        setProrrateoFactor(null)
                        return
                      }
                      const dayOfMonth = new Date().getDate();
                      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                      const prop = (daysInMonth - dayOfMonth + 1) / daysInMonth;
                      setProrrateoFactor(prop)
                      showToast(`Prorrateo calculado: ${dayOfMonth}/${daysInMonth} días restantes`, "info");
                    }}
                  >
                    {prorrateoFactor !== null ? "Quitar Prorrateo" : "Calcular Prorrateo"}
                  </Button>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monto Base</span>
                    <span>${montoBase.toLocaleString()}</span>
                  </div>
                  {prorrateoFactor !== null && (
                    <div className="flex justify-between text-sm text-info">
                      <span className="text-muted-foreground">Prorrateo Aplicado</span>
                      <span>-{(montoBase / prorrateoFactor * (1 - prorrateoFactor)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  {descuento > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Descuento ({selectedPromo?.codigo || appliedCoupon})</span>
                      <span>-${descuento.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-bold text-foreground">Total a Cobrar</span>
                    <span className="text-2xl font-bold text-[#C2D8C4]">${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePagar}
                  className="w-full bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 text-lg py-6"
                >
                  Registrar Pago
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
