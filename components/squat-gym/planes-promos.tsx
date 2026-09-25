"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"

// Datos simulados con descripciones extendidas y beneficios
const mockPlanes = [
  { 
    id: '1', 
    nombre: 'Musculación', 
    descripcion: 'Acceso total a la sala de aparatos y pesas libres.', 
    precio: 15000, 
    precioPromocional: 12000,
    beneficios: ['Rutina personalizada', 'Acceso libre de horario', 'Uso de vestuarios y duchas']
  },
  { 
    id: '2', 
    nombre: 'Pase Libre', 
    descripcion: 'Musculación combinada con clases grupales ilimitadas.', 
    precio: 22000,
    beneficios: ['Acceso a todas las clases', 'Sala de musculación', 'Evaluación física mensual', 'App de seguimiento']
  },
  { 
    id: '3', 
    nombre: 'Crossfit', 
    descripcion: 'Entrenamiento funcional de alta intensidad.', 
    precio: 18000, 
    precioPromocional: 14500,
    beneficios: ['WOD diarios guiados', 'Coaches certificados', 'Comunidad exclusiva', 'Clases de levantamiento olímpico']
  }
]
interface PlanesYPromosProps {
  currentPlanId: string
  onElegirPlan: (planId: string) => void
}

export function PlanesYPromos({ currentPlanId, onElegirPlan }: PlanesYPromosProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Planes y Promos</h2>
        <p className="text-muted-foreground mt-2">
          Descubre nuestras membresías, compara beneficios y aprovecha los descuentos por tiempo limitado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockPlanes.map(plan => {
          const isCurrentPlan = plan.id === currentPlanId; // NUEVO: Verifica si es su plan
          
          return (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col transition-all hover:-translate-y-1 ${
              isCurrentPlan 
                ? 'border-[#C2D8C4] ring-2 ring-[#C2D8C4] shadow-lg shadow-[#C2D8C4]/20' 
                : plan.precioPromocional 
                  ? 'border-[#C2D8C4]/50 shadow-md' 
                  : 'border-border hover:border-foreground/20'
            }`}
          >
            {/* Etiqueta de Plan Actual o Promoción */}
            {(isCurrentPlan || plan.precioPromocional) && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-md ${
                isCurrentPlan ? 'bg-foreground text-background' : 'bg-[#C2D8C4] text-[#222222]'
              }`}>
                {isCurrentPlan ? <Check className="w-3 h-3" /> : <Star className="w-3 h-3" fill="currentColor" />}
                {isCurrentPlan ? 'Tu plan actual' : 'En Promo'}
              </div>
            )}
            {/* Etiqueta de promoción destacada */}
            {plan.precioPromocional && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C2D8C4] text-[#222222] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3" fill="currentColor" />
                En Promo
              </div>
            )}
            
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl text-center font-black">{plan.nombre}</CardTitle>
              <p className="text-sm text-center text-muted-foreground min-h-[40px] mt-2">
                {plan.descripcion}
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-8 pb-8 border-b border-border">
                {plan.precioPromocional ? (
                  <div className="flex flex-col items-center justify-center">
                    <s className="text-muted-foreground text-sm font-medium mb-1">
                      ${plan.precio.toLocaleString()}
                    </s>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-[#C2D8C4]">
                        ${plan.precioPromocional.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground font-bold">/mes</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-foreground">
                        ${plan.precio.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground font-bold">/mes</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de beneficios */}
              <div className="space-y-4 flex-1 mb-8">
                {plan.beneficios.map((beneficio, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#C2D8C4]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#C2D8C4]" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-foreground font-medium">{beneficio}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => onElegirPlan(plan.id)}
                variant={plan.precioPromocional || isCurrentPlan ? "default" : "outline"}
                className={`w-full py-6 text-base font-bold ${
                  (plan.precioPromocional || isCurrentPlan) 
                    ? "bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90" 
                    : ""
                }`}
              >
                {isCurrentPlan ? `Renovar ${plan.nombre}` : `Elegir ${plan.nombre}`}
              </Button>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </div>
  )
}