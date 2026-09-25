"use client"
import { useState, useEffect } from "react"
import { Wallet, CreditCard, History, QrCode, Building, Receipt, ExternalLink, Edit2, Building2, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alumno, Plan, Recibo, VentaKiosco } from "./types"

interface PortalSocioProps {
  alumno: Alumno
  plan: Plan
  recibos: Recibo[]
  comprasKiosco?: VentaKiosco[]
  onPagar: (metodo: "Efectivo" | "Tarjeta"  | "QR", monto: number) => void
  planToPurchase?: string | null     // NUEVO
  clearPlanToPurchase?: () => void   // NUEVO
}
export function PortalSocio({ alumno, plan, recibos, comprasKiosco = [], onPagar, planToPurchase, clearPlanToPurchase }: PortalSocioProps) {
// Estados existentes
  const [showPayment, setShowPayment] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"QR" | "Tarjeta" | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<Recibo | null>(null)
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan>(plan)
  const [promoSeleccionada, setPromoSeleccionada] = useState<any | null>(null)
  const [localFechaVencimiento, setLocalFechaVencimiento] = useState(alumno.fechaVencimiento)
  const [localDeuda, setLocalDeuda] = useState(alumno.deuda)
  const diasParaVencer = Math.floor((new Date(localFechaVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))

  // Mock promotions for demonstration
  const mockPromociones = [
    { id: 'PR1', codigo: 'VERANO26', descuentoPorcentaje: 20, activa: true },
    { id: 'PR2', codigo: 'BIENVENIDA', descuentoPorcentaje: 15, activa: true },
    { id: 'PR3', codigo: 'DESCONTO', descuentoPorcentaje: 10, activa: false },
  ];
  // Nuevo estado para el dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Actualiza tu lista de planes para incluir promociones
  const mockPlanesDisponibles: (Plan & { precioPromocional?: number })[] = [
    plan, 
    { id: '1', nombre: 'Musculación', descripcion: 'Acceso a la sala de aparatos y pesas', precio: 15000, precioPromocional: 12000 },
    { id: '2', nombre: 'Pase Libre', descripcion: 'Musculación + Clases grupales', precio: 22000 },
    { id: '3', nombre: 'Crossfit', descripcion: 'Entrenamiento funcional de alta intensidad', precio: 18000, precioPromocional: 14500 }
  ].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
useEffect(() => {
    if (planToPurchase && clearPlanToPurchase) {
      // Buscamos el plan que el usuario seleccionó en la otra pestaña
      const planElegido = mockPlanesDisponibles.find(p => p.id === planToPurchase);
      
      if (planElegido) {
        setPlanSeleccionado(planElegido); // Lo fijamos en el menú desplegable
        setShowPayment(true); // ¡Abrimos la pantalla de pago!
      }
      
      // Limpiamos la memoria del dashboard para no quedar en un bucle infinito
      setTimeout(() => {
        clearPlanToPurchase(); 
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planToPurchase, clearPlanToPurchase]); 
  // ------------------------------------


  const mockPromocionesVigentes = mockPromociones.filter(promo => promo.activa);

  
  const handleDownloadReceipt = () => {
    if (!viewingReceipt) return;
    const receiptText = `
SquatGym
Recibo N°: ${viewingReceipt.id}
Fecha: ${new Date(viewingReceipt.fecha).toLocaleDateString()}
Alumno: ${alumno.nombre}
Concepto: ${viewingReceipt.concepto}
Monto: $${viewingReceipt.monto.toLocaleString()}
Método de pago: ${viewingReceipt.metodo}
  `.trim();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${viewingReceipt.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (viewingReceipt) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setViewingReceipt(null)}>
            ← Volver
          </Button>
          <h2 className="text-xl font-bold">Comprobante</h2>
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
              <span className="font-medium text-foreground">{new Date(viewingReceipt.fecha).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Alumno</span>
              <span className="font-medium text-foreground">{alumno.nombre}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Concepto</span>
              <span className="font-medium text-foreground">{viewingReceipt.concepto}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Medio de Pago</span>
              <span className="font-medium text-foreground">{viewingReceipt.metodo}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-lg font-bold text-foreground">Total Pagado</span>
              <span className="text-2xl font-bold text-[#C2D8C4]">${viewingReceipt.monto.toLocaleString()}</span>
            </div>

            <Button className="w-full mt-6 bg-secondary text-foreground hover:bg-secondary/80" onClick={handleDownloadReceipt}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Descargar recibo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

if (showPayment) {
    // Cálculos para el resumen
   const precioBasePlan = (planSeleccionado as any).precioPromocional || planSeleccionado.precio;
    
    const subtotal = precioBasePlan;
    const montoDescuento = promoSeleccionada ? (subtotal * promoSeleccionada.descuentoPorcentaje) / 100 : 0;
    const descuentoPonderado = diasParaVencer > 0 ? Math.floor((precioBasePlan / 30) * Math.min(diasParaVencer, 30)) : 0;
    const totalPagar = Math.max(0, subtotal - montoDescuento - descuentoPonderado);

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => { setShowPayment(false); setSelectedMethod(null); setPromoSeleccionada(null); setPlanSeleccionado(plan) }}>
            ← Volver
          </Button>
          <h2 className="text-xl font-bold">Renovar y Pagar</h2>
        </div>

        <Card className="border-[#C2D8C4]/40 bg-card">
          <CardContent className="p-6">
            {/* AVISO DE PLAN ACTIVO */}
            {diasParaVencer > 0 && (
              <div className="mb-6 px-4 py-3 bg-[#C2D8C4]/20 border border-[#C2D8C4] rounded-xl">
                <p className="text-sm font-bold text-foreground">¡Plan Actual Activo!</p>
                <p className="text-xs text-muted-foreground">Te quedan {diasParaVencer} días de tu plan actual. Hemos aplicado un descuento a tu renovación como saldo a favor.</p>
              </div>
            )}
            {/* 1. SELECT DE PLANES (Dropdown Personalizado) */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium mb-2 text-foreground">Plan a contratar</label>
              
              {/* Botón que abre el menú */}
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground flex justify-between items-center cursor-pointer hover:border-[#C2D8C4]/50 transition-colors"
              >
                <span className="font-medium">{planSeleccionado.nombre}</span>
                <div className="flex items-center gap-2">
                  {(planSeleccionado as any).precioPromocional ? (
                    <>
                      <s className="text-muted-foreground text-sm">${planSeleccionado.precio.toLocaleString()}</s>
                      <span className="text-[#C2D8C4] font-bold">${(planSeleccionado as any).precioPromocional.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="font-bold">${planSeleccionado.precio.toLocaleString()}</span>
                  )}
                  <span className="text-xs ml-2 opacity-50">{isDropdownOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Menú de opciones (Aparece por encima del resto) */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {mockPlanesDisponibles.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setPlanSeleccionado(p);
                        setIsDropdownOpen(false); // Cierra el menú al elegir
                      }}
                      className="p-4 hover:bg-secondary/50 cursor-pointer flex justify-between items-center border-b border-border last:border-0 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-foreground">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                      </div>
                      <div className="text-right">
                        {p.precioPromocional ? (
                          <div className="flex flex-col items-end">
                            <s className="text-muted-foreground text-xs">${p.precio.toLocaleString()}</s>
                            <span className="text-[#C2D8C4] font-bold text-lg">${p.precioPromocional.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-foreground text-lg">${p.precio.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. SECCIÓN DE DESCUENTOS */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Descuentos Activos</label>
              {mockPromocionesVigentes.length > 0 ? (
                <div className="grid gap-2">
                  {mockPromocionesVigentes.map(promo => (
                    <div 
                      key={promo.id}
                      onClick={() => setPromoSeleccionada(promoSeleccionada?.id === promo.id ? null : promo)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        promoSeleccionada?.id === promo.id 
                          ? "border-[#C2D8C4] bg-[#C2D8C4]/10 ring-1 ring-[#C2D8C4]" 
                          : "border-border hover:border-[#C2D8C4]/50"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm text-foreground">{promo.codigo}</p>
                        <p className="text-xs text-muted-foreground">{promo.descuentoPorcentaje}% OFF en tu plan</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${promoSeleccionada?.id === promo.id ? 'border-[#C2D8C4] bg-[#C2D8C4]' : 'border-muted-foreground'}`}>
                        {promoSeleccionada?.id === promo.id && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay descuentos disponibles.</p>
              )}
            </div>

            {/* 3. RESUMEN DE PAGO */}
            <div className="mb-8 p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
              <h3 className="font-bold text-foreground mb-2">Resumen de pago</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({planSeleccionado.nombre})</span>
                <span className="text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              {promoSeleccionada && (
                <div className="flex justify-between text-sm text-[#C2D8C4] font-medium">
                  <span>Descuento ({promoSeleccionada.codigo})</span>
                  <span>-${montoDescuento.toLocaleString()}</span>
                </div>
              )}
              {descuentoPonderado > 0 && (
                <div className="flex justify-between text-sm text-[#C2D8C4] font-medium">
                  <span>Saldo a favor ({diasParaVencer} días no usados)</span>
                  <span>-${descuentoPonderado.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-border mt-2">
                <span className="text-foreground">Total a pagar</span>
                <span className="text-[#C2D8C4]">${totalPagar.toLocaleString()}</span>
              </div>
            </div>

            {/* 4. MÉTODOS DE PAGO */}
            <label className="block text-sm font-medium mb-2 text-foreground">Selecciona un método de pago</label>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <PaymentMethodCard
                icon={<QrCode className="w-6 h-6" />}
                title="QR MODO"
                active={selectedMethod === "QR"}
                onClick={() => setSelectedMethod("QR")}
              />
              <PaymentMethodCard
                icon={<CreditCard className="w-6 h-6" />}
                title="Tarjeta"
                active={selectedMethod === "Tarjeta"}
                onClick={() => setSelectedMethod("Tarjeta")}
              />
            </div>

            {/* 5. CONFIRMACIÓN */}
            {selectedMethod && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-center min-h-[150px]">
                  {selectedMethod === "QR" && <p className="text-muted-foreground flex flex-col items-center gap-2"><QrCode className="w-16 h-16 opacity-50" /> Escanea con tu app de pagos</p>}
                 
                  {selectedMethod === "Tarjeta" && (
                    <div className="w-full flex flex-col gap-3 text-left">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-foreground">Número de Tarjeta</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000" 
                          maxLength={19}
                          className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-[#C2D8C4] outline-none text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-foreground">Nombre del Titular</label>
                        <input 
                          type="text" 
                          placeholder="Como aparece en la tarjeta" 
                          className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-[#C2D8C4] outline-none text-sm" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-foreground">Vencimiento</label>
                          <input 
                            type="text" 
                            placeholder="MM/AA" 
                            maxLength={5}
                            className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-[#C2D8C4] outline-none text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-foreground">CVC</label>
                          <input 
                            type="password" 
                            placeholder="123" 
                            maxLength={4} 
                            className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-[#C2D8C4] outline-none text-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 text-lg py-6 shadow-lg shadow-[#C2D8C4]/20"
                  onClick={() => {
                    // Enviamos el total con el descuento ya aplicado
                    onPagar(selectedMethod, totalPagar)
                    setShowPayment(false)
                    setPromoSeleccionada(null)
                    const nuevaFecha = new Date();
                    if (diasParaVencer > 0) {
                      // Si estaba activo, le sumamos 30 días a su vencimiento actual
                      nuevaFecha.setTime(new Date(localFechaVencimiento).getTime() + (30 * 24 * 60 * 60 * 1000));
                    } else {
                      // Si estaba vencido, le damos 30 días a partir de hoy
                      nuevaFecha.setDate(nuevaFecha.getDate() + 30);
                    }
                    
                    setLocalFechaVencimiento(nuevaFecha.toISOString());
                    setLocalDeuda(0);
                  }}
                
                >
                  Confirmar Pago de ${totalPagar.toLocaleString()}
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
            {(() => {
              const isVencido = diasParaVencer < 0;
              // Usamos localDeuda en lugar de alumno.deuda
              const displayDebt = localDeuda > 0 ? localDeuda : (isVencido ? plan.precio : 0);
              const showDebt = localDeuda > 0 || isVencido;

              return showDebt ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Saldo Pendiente</p>
                    <p className="text-3xl font-bold text-destructive">${displayDebt.toLocaleString()}</p>
                  </div>
                  <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                    {isVencido ? (
                      <p className="text-sm font-medium text-destructive">
                        ⚠ Membresía vencida hace {Math.abs(diasParaVencer)} día{diasParaVencer !== -1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-destructive">
                        Vencimiento: {new Date(alumno.fechaVencimiento).toLocaleDateString()}
                      </p>
                    )}
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
              );
            })()}
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
                      <button 
                        onClick={() => setViewingReceipt(recibo)}
                        className="text-xs text-[#C2D8C4] hover:underline flex items-center gap-1 justify-end mt-1"
                      >
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

      {comprasKiosco.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Compras en Kiosco</h3>
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {comprasKiosco.map((compra) => (
                  <div key={compra.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#C2D8C4]/10 flex items-center justify-center">
                        <span className="text-xl">🥤</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {compra.items.map(i => `${i.cantidad}x ${i.nombre}`).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{compra.fecha} · {compra.hora} · {compra.medio}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">${compra.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promociones vigentes */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Promociones vigentes</h3>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {mockPromocionesVigentes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockPromocionesVigentes.map(promo => (
                  <div key={promo.id} className="rounded-2xl border border-border bg-card overflow-hidden flex group hover:border-[#C2D8C4]/50 transition-all duration-200" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    <div className={`w-24 flex flex-col items-center justify-center flex-shrink-0 ${promo.activa ? 'bg-[#C2D8C4]' : 'bg-muted'}`}>
                      <span className="text-2xl font-black text-[#222222]">{promo.descuentoPorcentaje}%</span>
                      <span className="text-[10px] font-bold text-[#222222] uppercase tracking-tighter">OFF</span>
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-[#C2D8C4] uppercase tracking-widest mb-1">{promo.activa ? 'Campaña Activa' : 'Finalizada'}</p>
                          <h4 className="text-xl font-bold text-foreground">{promo.codigo}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Descuento del {promo.descuentoPorcentaje}% en planes seleccionados.</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, we would open a modal to edit the promo.
                            // For now, we just show an alert.
                            alert(`Promoción ${promo.codigo} seleccionada`);
                          }}
                          className="w-9 h-9 rounded-xl bg-[#C2D8C4]/10 hover:bg-[#C2D8C4]/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Edit2 className="w-4 h-4 text-[#C2D8C4]" />
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Todas las sedes</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Compatible: Todos los planes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay promociones activas en este momento.</p>
            )}
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
      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
        active
          ? "border-[#C2D8C4] bg-[#C2D8C4]/10 text-[#C2D8C4] ring-2 ring-[#C2D8C4] ring-offset-2 ring-offset-background scale-[1.02]"
          : "border-border bg-card text-muted-foreground hover:border-[#C2D8C4]/50 hover:bg-secondary/20"
      }`}
    >
      {/* Icono de check (círculo) que aparece solo si está activo */}
      {active && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#C2D8C4] rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-black rounded-full" />
        </div>
      )}
      {icon}
      <span className="text-sm font-bold">{title}</span>
    </button>
  )
}