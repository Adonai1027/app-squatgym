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
import { Plan, Promocion } from "./types"
import { sedesOptions } from "./data"

interface ConsolaConfiguracionProps {
  planes: Plan[]
  promociones: Promocion[]
}

export function ConsolaConfiguracion({ planes: initialPlanes, promociones: initialPromociones }: ConsolaConfiguracionProps) {
  const [activeTab, setActiveTab] = useState<"planes" | "promociones">("planes")
  const [planes, setPlanes] = useState<Plan[]>(initialPlanes)
  const [promociones, setPromociones] = useState<Promocion[]>(initialPromociones)
  
  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingType, setEditingType] = useState<"plan" | "promo" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  
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
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-semibold text-sm ${
            activeTab === "planes" ? "border-[#C2D8C4] text-[#C2D8C4]" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Planes y Precios
        </button>
        <button
          onClick={() => setActiveTab("promociones")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-semibold text-sm ${
            activeTab === "promociones" ? "border-[#C2D8C4] text-[#C2D8C4]" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          Promociones
        </button>
      </div>

      {activeTab === "planes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          {planes.map(plan => (
            <Card key={plan.id} className="border-border bg-card group hover:border-[#C2D8C4]/50 transition-all hover:shadow-lg overflow-hidden flex flex-col">
              <div className="h-2 bg-[#C2D8C4]/20" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-black text-foreground">{plan.nombre}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditPlan(plan)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">{plan.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">${plan.precio.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ mes</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-secondary text-muted-foreground rounded-md flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Sede Central
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-secondary text-muted-foreground rounded-md flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Sede Norte
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/20 border-t border-border mt-auto px-6 py-4">
                <Button variant="link" className="text-primary font-bold p-0 h-auto text-xs" onClick={() => handleEditPlan(plan)}>
                  CONFIGURAR DETALLES →
                </Button>
              </CardFooter>
            </Card>
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
                 <h4 className="font-bold text-foreground">Análisis de ROI de Ofertas</h4>
                 <p className="text-sm text-muted-foreground">Revisá el rendimiento de tus campañas lanzadas.</p>
               </div>
             </div>
             <Button variant="outline" className="border-[#C2D8C4] text-[#C2D8C4] hover:bg-[#C2D8C4]/10 font-bold">
                Ver Informe ROI
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promociones.map(promo => (
              <Card key={promo.id} className="border-border bg-card hover:border-primary/50 transition-all flex group overflow-hidden">
                <div className={`w-24 flex flex-col items-center justify-center ${promo.activa ? 'bg-[#C2D8C4]' : 'bg-muted'}`}>
                  <span className="text-2xl font-black text-[#222222]">{promo.descuentoPorcentaje}%</span>
                  <span className="text-[10px] font-bold text-[#222222] uppercase tracking-tighter">OFF</span>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{promo.activa ? 'Campaña Activa' : 'Finalizada'}</p>
                      <h4 className="text-xl font-bold text-foreground">{promo.codigo}</h4>
                      <p className="text-sm text-muted-foreground mt-2">Válido para planes seleccionados y pago en efectivo.</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditPromo(promo)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Editor Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px] bg-card border-l border-border overflow-y-auto">
          <SheetHeader className="pb-6 border-b border-border mb-6">
            <SheetTitle className="text-2xl font-black">
              {editingId ? 'Editar' : 'Nuevo'} {editingType === 'plan' ? 'Plan' : 'Promoción'}
            </SheetTitle>
            <SheetDescription>
              Completá los datos para {editingId ? 'actualizar' : 'crear'} el {editingType === 'plan' ? 'plan de suscripción' : 'descuento comercial'}.
            </SheetDescription>
          </SheetHeader>

          {editingType === 'plan' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plan-nombre" className="font-bold">Nombre del Plan</Label>
                <Input id="plan-nombre" value={planForm.nombre} onChange={e => setPlanForm({...planForm, nombre: e.target.value})} placeholder="Ej: Musculación Total" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc" className="font-bold">Descripción</Label>
                <Textarea id="plan-desc" value={planForm.descripcion} onChange={e => setPlanForm({...planForm, descripcion: e.target.value})} placeholder="Detallá los beneficios del plan..." className="bg-input border-border min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-precio" className="font-bold">Precio Mensual ($)</Label>
                <Input id="plan-precio" type="number" value={planForm.precio} onChange={e => setPlanForm({...planForm, precio: Number(e.target.value)})} className="bg-input border-border" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold">Sedes Aplicables</Label>
                <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border">
                  {sedesOptions.map(sede => (
                    <div key={sede.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`sede-${sede.id}`} 
                        checked={planForm.sedes.includes(sede.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPlanForm({...planForm, sedes: [...planForm.sedes, sede.id]})
                          else setPlanForm({...planForm, sedes: planForm.sedes.filter(id => id !== sede.id)})
                        }}
                      />
                      <label htmlFor={`sede-${sede.id}`} className="text-sm font-medium leading-none cursor-pointer">{sede.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="promo-codigo" className="font-bold">Código de Promoción</Label>
                <Input id="promo-codigo" value={promoForm.codigo} onChange={e => setPromoForm({...promoForm, codigo: e.target.value.toUpperCase()})} placeholder="Ej: VERANO2026" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-desc" className="font-bold">Porcentaje de Descuento (%)</Label>
                <Input id="promo-desc" type="number" value={promoForm.descuento} onChange={e => setPromoForm({...promoForm, descuento: Number(e.target.value)})} className="bg-input border-border" />
              </div>
              
              <div className="space-y-3">
                <Label className="font-bold">Sedes Aplicables</Label>
                <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border">
                  {sedesOptions.map(sede => (
                    <div key={sede.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`promo-sede-${sede.id}`} 
                        checked={promoForm.sedes.includes(sede.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPromoForm({...promoForm, sedes: [...promoForm.sedes, sede.id]})
                          else setPromoForm({...promoForm, sedes: promoForm.sedes.filter(id => id !== sede.id)})
                        }}
                      />
                      <label htmlFor={`promo-sede-${sede.id}`} className="text-sm font-medium leading-none cursor-pointer">{sede.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold">Planes Compatibles</Label>
                <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border">
                  {planes.map(plan => (
                    <div key={plan.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`promo-plan-${plan.id}`} 
                        checked={promoForm.planesCompatibles.includes(plan.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setPromoForm({...promoForm, planesCompatibles: [...promoForm.planesCompatibles, plan.id]})
                          else setPromoForm({...promoForm, planesCompatibles: promoForm.planesCompatibles.filter(id => id !== plan.id)})
                        }}
                      />
                      <label htmlFor={`promo-plan-${plan.id}`} className="text-sm font-medium leading-none cursor-pointer">{plan.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="mt-8 pt-6 border-t border-border">
            <div className="flex gap-3 w-full">
              <SheetClose asChild>
                <Button variant="outline" className="flex-1 border-border">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground font-bold">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
