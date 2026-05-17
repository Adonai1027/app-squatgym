"use client"

import { useState } from "react"
import { Settings, Tag, Plus, Edit2, Save, X, Trash2, TrendingUp, Building2, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plan, Promocion } from "./types"
import { sedesOptions } from "./data"

interface ConsolaConfiguracionProps {
  planes: Plan[]
  setPlanes: (planes: Plan[]) => void
  promociones: Promocion[]
  setPromociones: (promociones: Promocion[]) => void
}

export function ConsolaConfiguracion({ planes, setPlanes, promociones, setPromociones }: ConsolaConfiguracionProps) {
  const [activeTab, setActiveTab] = useState<"planes" | "promociones">("planes")

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingType, setEditingType] = useState<"plan" | "promo" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Report dialog state
  const [showPromoReportDialog, setShowPromoReportDialog] = useState(false)
  const [reportPromoDateFrom, setReportPromoDateFrom] = useState("")
  const [reportPromoDateTo, setReportPromoDateTo] = useState("")
  const [reportPromoSedeId, setReportPromoSedeId] = useState("todas")

  // Form states
  const [planForm, setPlanForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    sedes: [] as string[]
  })

  const [promoForm, setPromoForm] = useState({
    nombre: "",
    codigo: "",
    descuento: 0,
    sedes: [] as string[],
    planesCompatibles: [] as string[]
  })

  const handleNewPlan = () => {
    setEditingType("plan")
    setEditingId(null)
    setPlanForm({ nombre: "", descripcion: "", precio: 0, sedes: [] })
    setIsSheetOpen(true)
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingType("plan")
    setEditingId(plan.id)
    setPlanForm({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio,
      sedes: [] // Mock: usually would come from plan data
    })
    setIsSheetOpen(true)
  }

  const handleNewPromo = () => {
    setEditingType("promo")
    setEditingId(null)
    setPromoForm({ nombre: "", codigo: "", descuento: 0, sedes: [], planesCompatibles: [] })
    setIsSheetOpen(true)
  }

  const handleEditPromo = (promo: Promocion) => {
    setEditingType("promo")
    setEditingId(promo.id)
    setPromoForm({
      nombre: "Promoción Especial", // Mock extension of Promocion type
      codigo: promo.codigo,
      descuento: promo.descuentoPorcentaje,
      sedes: [],
      planesCompatibles: []
    })
    setIsSheetOpen(true)
  }

  const handleSave = () => {
    if (editingType === "plan") {
      if (editingId) {
        setPlanes(planes.map(p => p.id === editingId ? { ...p, ...planForm } : p))
      } else {
        const newPlan: Plan = {
          id: `PL-${Date.now()}`,
          ...planForm
        }
        setPlanes([...planes, newPlan])
      }
    } else {
      if (editingId) {
        setPromociones(promociones.map(p => p.id === editingId ? { ...p, codigo: promoForm.codigo, descuentoPorcentaje: promoForm.descuento } : p))
      } else {
        const newPromo: Promocion = {
          id: `PR-${Date.now()}`,
          codigo: promoForm.codigo,
          descuentoPorcentaje: promoForm.descuento,
          activa: true
        }
        setPromociones([...promociones, newPromo])
      }
    }
    setIsSheetOpen(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Gestión Comercial</h2>
          <p className="text-muted-foreground mt-1">
            Configuración de planes de suscripción y estrategias de promoción.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "planes" ? (
            <Button onClick={handleNewPlan} className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plan
            </Button>
          ) : (
            <Button onClick={handleNewPromo} className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Promoción
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("planes")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-semibold text-sm ${activeTab === "planes" ? "border-[#C2D8C4] text-[#C2D8C4]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Settings className="w-4 h-4" />
          Planes y Precios
        </button>
        <button
          onClick={() => setActiveTab("promociones")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-semibold text-sm ${activeTab === "promociones" ? "border-[#C2D8C4] text-[#C2D8C4]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Tag className="w-4 h-4" />
          Promociones
        </button>
      </div>

      {activeTab === "planes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          {planes.map(plan => (
            <div
              key={plan.id}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col group hover:border-[#C2D8C4]/60 transition-all duration-200"
              style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            >
              {/* accent bar */}
              <div className="h-1.5 bg-[#C2D8C4]/40 group-hover:bg-[#C2D8C4] transition-colors duration-200" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-black text-foreground">{plan.nombre}</h3>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="w-9 h-9 rounded-xl bg-[#C2D8C4]/10 hover:bg-[#C2D8C4]/20 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-[#C2D8C4]" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{plan.descripcion}</p>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-black text-foreground">${plan.precio.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/ mes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#C2D8C4]/10 text-[#C2D8C4] rounded-lg flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Sede Central
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#C2D8C4]/10 text-[#C2D8C4] rounded-lg flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Sede Norte
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "promociones" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between bg-[#C2D8C4]/5 p-6 rounded-2xl border border-[#C2D8C4]/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C2D8C4]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#C2D8C4]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Análisis de Promociones</h4>
                <p className="text-sm text-muted-foreground">Revisá el rendimiento de tus campañas lanzadas.</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowPromoReportDialog(true)} className="border-[#C2D8C4] text-[#C2D8C4] hover:bg-[#C2D8C4]/10 font-bold">
              Ver Informe de Promociones
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promociones.map(promo => (
              <div
                key={promo.id}
                className="rounded-2xl border border-border bg-card overflow-hidden flex group hover:border-[#C2D8C4]/50 transition-all duration-200"
                style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              >
                <div className={`w-24 flex flex-col items-center justify-center flex-shrink-0 ${promo.activa ? 'bg-[#C2D8C4]' : 'bg-muted'}`}>
                  <span className="text-2xl font-black text-[#222222]">{promo.descuentoPorcentaje}%</span>
                  <span className="text-[10px] font-bold text-[#222222] uppercase tracking-tighter">OFF</span>
                </div>
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-[#C2D8C4] uppercase tracking-widest mb-1">{promo.activa ? 'Campaña Activa' : 'Finalizada'}</p>
                      <h4 className="text-xl font-bold text-foreground">{promo.codigo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Válido para planes seleccionados.</p>
                    </div>
                    <button
                      onClick={() => handleEditPromo(promo)}
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
                      <span>Compatible: Pase Libre</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[550px] bg-card border-l-0 overflow-y-auto sm:rounded-l-3xl shadow-[-10px_0_40px_rgba(0,0,0,0.1)] px-8 pt-8 pb-6">
          <SheetHeader className="pb-8 mb-8 border-b border-border/50">
            <SheetTitle className="text-3xl font-black text-foreground flex items-center gap-2">
              {editingId ? 'Editar' : 'Nuevo'} <span className="text-[#C2D8C4]">{editingType === 'plan' ? 'Plan' : 'Promo'}</span>
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground mt-2">
              Completá los datos para {editingId ? 'actualizar' : 'crear'} el {editingType === 'plan' ? 'plan de suscripción' : 'descuento comercial'} del gimnasio.
            </SheetDescription>
          </SheetHeader>

          {editingType === 'plan' ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="plan-nombre" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Plan</Label>
                <Input id="plan-nombre" value={planForm.nombre} onChange={e => setPlanForm({ ...planForm, nombre: e.target.value })} placeholder="Ej: Musculación Total" className="h-12 rounded-xl bg-background border-border hover:border-[#C2D8C4]/50 focus:border-[#C2D8C4] focus:ring-1 focus:ring-[#C2D8C4] px-4 transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</Label>
                <Textarea id="plan-desc" value={planForm.descripcion} onChange={e => setPlanForm({ ...planForm, descripcion: e.target.value })} placeholder="Detallá los beneficios del plan..." className="min-h-[120px] rounded-xl bg-background border-border hover:border-[#C2D8C4]/50 focus:border-[#C2D8C4] focus:ring-1 focus:ring-[#C2D8C4] p-4 transition-all resize-none shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-precio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Mensual ($)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground font-medium">$</span>
                  </div>
                  <Input id="plan-precio" type="number" value={planForm.precio} onChange={e => setPlanForm({ ...planForm, precio: Number(e.target.value) })} className="h-12 pl-8 rounded-xl bg-background border-border hover:border-[#C2D8C4]/50 focus:border-[#C2D8C4] focus:ring-1 focus:ring-[#C2D8C4] transition-all text-lg font-bold shadow-sm" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Sedes Aplicables</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/10 p-5 rounded-2xl border border-border shadow-inner">
                  {sedesOptions.map(sede => (
                    <label key={sede.id} htmlFor={`sede-${sede.id}`} className="flex items-center space-x-3 p-3 rounded-xl border border-transparent hover:border-[#C2D8C4]/30 hover:bg-[#C2D8C4]/5 transition-colors cursor-pointer group">
                      <Checkbox
                        id={`sede-${sede.id}`}
                        checked={planForm.sedes.includes(sede.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPlanForm({ ...planForm, sedes: [...planForm.sedes, sede.id] })
                          else setPlanForm({ ...planForm, sedes: planForm.sedes.filter(id => id !== sede.id) })
                        }}
                        className="data-[state=checked]:bg-[#C2D8C4] data-[state=checked]:border-[#C2D8C4] text-[#222222]"
                      />
                      <span className="text-sm font-semibold group-hover:text-foreground transition-colors">{sede.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="promo-codigo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Código de Promoción</Label>
                <Input id="promo-codigo" value={promoForm.codigo} onChange={e => setPromoForm({ ...promoForm, codigo: e.target.value.toUpperCase() })} placeholder="Ej: VERANO2026" className="h-12 rounded-xl bg-background border-border hover:border-[#C2D8C4]/50 focus:border-[#C2D8C4] focus:ring-1 focus:ring-[#C2D8C4] px-4 transition-all font-black text-lg uppercase tracking-wider shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-desc" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Descuento (%)</Label>
                <div className="relative">
                  <Input id="promo-desc" type="number" value={promoForm.descuento} onChange={e => setPromoForm({ ...promoForm, descuento: Number(e.target.value) })} className="h-12 pr-10 rounded-xl bg-background border-border hover:border-[#C2D8C4]/50 focus:border-[#C2D8C4] focus:ring-1 focus:ring-[#C2D8C4] transition-all text-lg font-bold shadow-sm" />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Sedes Aplicables</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/10 p-5 rounded-2xl border border-border shadow-inner">
                  {sedesOptions.map(sede => (
                    <label key={sede.id} htmlFor={`promo-sede-${sede.id}`} className="flex items-center space-x-3 p-3 rounded-xl border border-transparent hover:border-[#C2D8C4]/30 hover:bg-[#C2D8C4]/5 transition-colors cursor-pointer group">
                      <Checkbox
                        id={`promo-sede-${sede.id}`}
                        checked={promoForm.sedes.includes(sede.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPromoForm({ ...promoForm, sedes: [...promoForm.sedes, sede.id] })
                          else setPromoForm({ ...promoForm, sedes: promoForm.sedes.filter(id => id !== sede.id) })
                        }}
                        className="data-[state=checked]:bg-[#C2D8C4] data-[state=checked]:border-[#C2D8C4] text-[#222222]"
                      />
                      <span className="text-sm font-semibold group-hover:text-foreground transition-colors">{sede.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Planes Compatibles</Label>
                <div className="flex flex-col gap-1.5 bg-secondary/10 p-5 rounded-2xl border border-border shadow-inner">
                  {planes.map(plan => (
                    <label key={plan.id} htmlFor={`promo-plan-${plan.id}`} className="flex items-center space-x-3 p-3 rounded-xl border border-transparent hover:border-[#C2D8C4]/30 hover:bg-[#C2D8C4]/5 transition-colors cursor-pointer group">
                      <Checkbox
                        id={`promo-plan-${plan.id}`}
                        checked={promoForm.planesCompatibles.includes(plan.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPromoForm({ ...promoForm, planesCompatibles: [...promoForm.planesCompatibles, plan.id] })
                          else setPromoForm({ ...promoForm, planesCompatibles: promoForm.planesCompatibles.filter(id => id !== plan.id) })
                        }}
                        className="data-[state=checked]:bg-[#C2D8C4] data-[state=checked]:border-[#C2D8C4] text-[#222222]"
                      />
                      <span className="text-sm font-semibold group-hover:text-foreground transition-colors">{plan.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-12 pt-6 border-t border-border/50">
            <div className="flex gap-4 w-full">
              <SheetClose asChild>
                <Button className="flex-1 h-12 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition-colors border border-red-200">
                  Cancelar
                </Button>
              </SheetClose>
              <Button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-black shadow-[0_4px_14px_0_rgba(194,216,196,0.39)] hover:shadow-[0_6px_20px_rgba(194,216,196,0.23)] hover:-translate-y-0.5 transition-all">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Promo Report Dialog */}
      <Dialog open={showPromoReportDialog} onOpenChange={setShowPromoReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Informe de Promociones</DialogTitle>
            <DialogDescription>
              Seleccione los parámetros para generar el reporte de rendimiento de promociones.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input type="date" value={reportPromoDateFrom} onChange={(e) => setReportPromoDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input type="date" value={reportPromoDateTo} onChange={(e) => setReportPromoDateTo(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sucursal</Label>
              <Select
                value={reportPromoSedeId}
                onValueChange={setReportPromoSedeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las sucursales</SelectItem>
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
            <Button variant="outline" onClick={() => setShowPromoReportDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => {
                // Here we would typically generate the report.
                // For now, we'll just close and maybe show a toast if available (we don't have showToast prop here, so just close)
                setShowPromoReportDialog(false)
              }}
              className="bg-[#C2D8C4] text-black hover:bg-[#C2D8C4]/80"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Imprimir Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
