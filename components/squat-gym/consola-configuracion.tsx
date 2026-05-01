"use client"

import { useState } from "react"
import { Settings, BarChart3, Users, DollarSign, Tag, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plan, Promocion } from "./types"

interface ConsolaConfiguracionProps {
  planes: Plan[]
  promociones: Promocion[]
}

export function ConsolaConfiguracion({ planes, promociones }: ConsolaConfiguracionProps) {
  const [activeTab, setActiveTab] = useState<"general" | "planes" | "promociones">("general")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Consola de Configuración Central</h2>
        <p className="text-muted-foreground mt-1">
          Módulo estratégico: Configuración global, planes, promociones y reportes consolidados.
        </p>
      </div>

      <div className="flex gap-4 border-b border-border pb-px">
        <TabButton 
          active={activeTab === "general"} 
          onClick={() => setActiveTab("general")} 
          icon={<BarChart3 className="w-4 h-4" />} 
          label="Reportes Globales" 
        />
        <TabButton 
          active={activeTab === "planes"} 
          onClick={() => setActiveTab("planes")} 
          icon={<Settings className="w-4 h-4" />} 
          label="Planes y Precios" 
        />
        <TabButton 
          active={activeTab === "promociones"} 
          onClick={() => setActiveTab("promociones")} 
          icon={<Tag className="w-4 h-4" />} 
          label="Promociones" 
        />
      </div>

      {activeTab === "general" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<DollarSign className="w-6 h-6" />} title="Ingresos Mensuales" value="$1,245,000" trend="+12%" />
            <StatCard icon={<Users className="w-6 h-6" />} title="Socios Activos" value="842" trend="+5%" />
            <StatCard icon={<TrendingUp className="w-6 h-6" />} title="Ventas Kiosco" value="$340,500" trend="+18%" />
          </div>
          
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Rendimiento por Sede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-xl bg-secondary/30 border border-border flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de Rendimiento Consolidado (Simulado)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "planes" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Gestión de Planes</h3>
            <Button className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90">Nuevo Plan</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planes.map(plan => (
              <Card key={plan.id} className="border-border bg-card hover:border-[#C2D8C4]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-foreground text-lg">{plan.nombre}</p>
                      <p className="text-sm text-muted-foreground mt-1">{plan.descripcion}</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#C2D8C4]">${plan.precio.toLocaleString()}</p>
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="flex-1 border-[#C2D8C4]/20 hover:bg-[#C2D8C4]/10">Editar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "promociones" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Promociones Activas</h3>
            <Button className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90">Nueva Promoción</Button>
          </div>
          
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {promociones.map(promo => (
                  <div key={promo.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${promo.activa ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{promo.codigo}</p>
                        <p className="text-sm text-muted-foreground">{promo.descuentoPorcentaje}% de descuento</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${promo.activa ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {promo.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
        active ? "border-[#C2D8C4] text-[#C2D8C4]" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  )
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode; title: string; value: string; trend: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#C2D8C4]/10 flex items-center justify-center text-[#C2D8C4]">
            {icon}
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-full">
            {trend}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
