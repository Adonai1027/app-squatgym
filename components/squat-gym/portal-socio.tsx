"use client"

import { useState } from "react"
import { Wallet, CreditCard, History, QrCode, Building, Receipt, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alumno, Plan, Recibo } from "./types"

interface PortalSocioProps {
  alumno: Alumno
  plan: Plan
  recibos: Recibo[]
  onPagar: (metodo: "Efectivo" | "Tarjeta" | "Transferencia" | "QR", monto: number) => void
}

export function PortalSocio({ alumno, plan, recibos, onPagar }: PortalSocioProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"QR" | "Transferencia" | "Tarjeta" | null>(null)

  const diasParaVencer = Math.floor((new Date(alumno.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))

  if (showPayment) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => { setShowPayment(false); setSelectedMethod(null) }}>
            ← Volver
          </Button>
          <h2 className="text-xl font-bold">Realizar Pago</h2>
        </div>

        <Card className="border-[#C2D8C4]/40 bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">Total a pagar</p>
            <p className="text-3xl font-bold text-[#C2D8C4] mb-6">${alumno.deuda.toLocaleString()}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <PaymentMethodCard
                icon={<QrCode className="w-6 h-6" />}
                title="QR MODO"
                active={selectedMethod === "QR"}
                onClick={() => setSelectedMethod("QR")}
              />
              <PaymentMethodCard
                icon={<Building className="w-6 h-6" />}
                title="Transferencia"
                active={selectedMethod === "Transferencia"}
                onClick={() => setSelectedMethod("Transferencia")}
              />
              <PaymentMethodCard
                icon={<CreditCard className="w-6 h-6" />}
                title="Tarjeta"
                active={selectedMethod === "Tarjeta"}
                onClick={() => setSelectedMethod("Tarjeta")}
              />
            </div>

            {selectedMethod && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-center min-h-[150px]">
                  {selectedMethod === "QR" && <p className="text-muted-foreground flex flex-col items-center gap-2"><QrCode className="w-16 h-16 opacity-50" /> Escanea con tu app de pagos</p>}
                  {selectedMethod === "Transferencia" && (
                    <div className="text-center">
                      <p className="font-semibold mb-1">CBU: 0000003100000000000000</p>
                      <p className="text-sm text-muted-foreground">Alias: SQUAT.GYM.PAGOS</p>
                    </div>
                  )}
                  {selectedMethod === "Tarjeta" && <p className="text-muted-foreground text-center">Serás redirigido al portal de MercadoPago</p>}
                </div>

                <Button
                  className="w-full bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 text-lg py-6"
                  onClick={() => {
                    onPagar(selectedMethod, alumno.deuda)
                    setShowPayment(false)
                  }}
                >
                  Pagar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Portal del Socio</h2>
        <p className="text-muted-foreground mt-1">
          ¡Hola {alumno.nombre}! Gestiona tu cuenta y pagos desde aquí.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Wallet className="w-4 h-4 text-[#C2D8C4]" />
              Estado de Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alumno.deuda > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Saldo Pendiente</p>
                  <p className="text-3xl font-bold text-destructive">${alumno.deuda.toLocaleString()}</p>
                </div>
                <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive">Vencimiento: {new Date(alumno.fechaVencimiento).toLocaleDateString()}</p>
                </div>
                <Button
                  className="w-full bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90"
                  onClick={() => setShowPayment(true)}
                >
                  Pagar Ahora
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Saldo Pendiente</p>
                  <p className="text-3xl font-bold text-success">$0</p>
                </div>
                <div className="px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm font-medium text-success">
                    Al día. Próximo vencimiento: {new Date(alumno.fechaVencimiento).toLocaleDateString()}
                  </p>
                </div>
                <Button disabled variant="outline" className="w-full opacity-50">
                  Nada que pagar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <History className="w-4 h-4 text-[#C2D8C4]" />
              Mi Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xl font-bold text-foreground">{plan.nombre}</p>
              <p className="text-sm text-muted-foreground mt-1">{plan.descripcion}</p>
            </div>
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Valor mensual</p>
              <p className="font-semibold text-foreground">${plan.precio.toLocaleString()}</p>
            </div>
            {/* Vencimiento con alerta visual */}
            {diasParaVencer < 0 ? (
              <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium text-destructive">
                  ⚠ Membresía vencida hace {Math.abs(diasParaVencer)} días
                </p>
              </div>
            ) : diasParaVencer <= 5 ? (
              <div className="px-3 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
                <p className="text-sm font-medium text-[#f59e0b]">
                  ⏳ Vence en {diasParaVencer} día{diasParaVencer !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <div className="px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success">
                  Vigente hasta {new Date(alumno.fechaVencimiento).toLocaleDateString()} ({diasParaVencer} días)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Historial de Pagos</h3>
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recibos.length > 0 ? (
                recibos.map((recibo) => (
                  <div key={recibo.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#C2D8C4]/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-[#C2D8C4]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{recibo.concepto}</p>
                        <p className="text-xs text-muted-foreground">{new Date(recibo.fecha).toLocaleDateString()} · {recibo.metodo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">${recibo.monto.toLocaleString()}</p>
                      <button className="text-xs text-[#C2D8C4] hover:underline flex items-center gap-1 justify-end mt-1">
                        <ExternalLink className="w-3 h-3" />
                        Ver recibo
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No hay pagos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PaymentMethodCard({ icon, title, active, onClick }: { icon: React.ReactNode; title: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${active
          ? "border-[#C2D8C4] bg-[#C2D8C4]/10 text-[#C2D8C4]"
          : "border-border bg-card text-muted-foreground hover:border-[#C2D8C4]/50"
        }`}
    >
      {icon}
      <span className="text-xs font-semibold">{title}</span>
    </button>
  )
}
