"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell,
  CreditCard,
  ShoppingBag,
  LogOut,
  AlertTriangle,
  Package,
  X,
  Bell,
  FileDown,
  LayoutDashboard,
  AlertOctagon,
  TrendingDown,
  ShoppingCart,
  ClipboardList,
  Zap,
  Settings,
  Menu,
  CheckCircle2,
  History,
  TrendingUp,
  BarChart3,
  Users,
  Truck,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GestionPagosProveedores } from "./gestion-pagos-proveedores"
import { AdministracionKiosco } from "./administracion-kiosco"
import { PortalSocio } from "./portal-socio"
import { ConsolaConfiguracion } from "./consola-configuracion"
import { RegistroPagos } from "./registro-pagos"
import { UserRole } from "./login-screen"

import { Product, PagoPendiente, Alumno, Plan, Promocion, Recibo, VentaKiosco } from "./types"

interface DashboardProps {
  onLogout: () => void
  userRole: UserRole
  activeAlumnoIndex: number
  pagosPendientes: PagoPendiente[]
  setPagosPendientes: (p: PagoPendiente[]) => void
  productos: Product[]
  setProductos: (p: Product[]) => void
  alumnos: Alumno[]
  setAlumnos: (a: Alumno[]) => void
  planes: Plan[]
  setPlanes: (p: Plan[]) => void
  promociones: Promocion[]
  setPromociones: (p: Promocion[]) => void
  recibos: Recibo[]
  setRecibos: (r: Recibo[]) => void
  ventas: VentaKiosco[]
  setVentas: (v: VentaKiosco[]) => void
}

type View =
  | "dashboard"
  | "pagos-proveedores"
  | "kiosco-pos"
  | "kiosco-stock"
  | "kiosco-reposicion"
  | "kiosco-ventas"
  | "portal-socio"
  | "consola-configuracion"
  | "registro-pagos"
  | "secretaria-dashboard"

function getAlertCount(pagos: PagoPendiente[], productos: Product[], role: UserRole) {
  const criticos = role === "secretaria" ? [] : pagos.filter((p) => p.diasAtraso >= 14)
  const stockBajo = productos.filter((p) => p.stock < p.minimo && !p.pedidoEnCurso)
  return criticos.length + stockBajo.length
}

function getInitialView(role: UserRole): View {
  if (role === "secretaria") return "secretaria-dashboard"
  if (role === "alumno") return "portal-socio"
  return "dashboard"
}

// ─────────────────────────────────────────────────────────────────────────────
export function Dashboard({
  onLogout, userRole, activeAlumnoIndex, pagosPendientes, setPagosPendientes, productos, setProductos,
  alumnos, setAlumnos, planes, setPlanes, promociones, setPromociones, recibos, setRecibos,
  ventas, setVentas
}: DashboardProps) {
  const [currentView, _setCurrentView] = useState<View>(getInitialView(userRole))
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null)
  const [alertPanelOpen, setAlertPanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const setCurrentView = (v: View) => {
    _setCurrentView(v)
    setMobileMenuOpen(false)
  }

  // Reset view whenever the logged-in role changes (logout → new login with different role)
  useEffect(() => {
    _setCurrentView(getInitialView(userRole))
    setAlertPanelOpen(false)
    setMobileMenuOpen(false)
  }, [userRole])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type })
  }

  const homeView: View = getInitialView(userRole)
  const backTarget: View = getInitialView(userRole)

  const handlePagarAlumno = (alumnoId: string, monto: number, metodo: string, promoId?: string) => {
    const alumno = alumnos.find(a => a.id === alumnoId)
    if (!alumno) return

    // Update debt and expiration if fully paid
    const newAlumnos = alumnos.map(a => {
      if (a.id === alumnoId) {
        let newDeuda = a.deuda - monto
        if (newDeuda < 0) newDeuda = 0

        let newVencimiento = a.fechaVencimiento
        if (newDeuda === 0) {
          // Add 30 days if paid in full
          const date = new Date(a.fechaVencimiento)
          date.setDate(date.getDate() + 30)
          newVencimiento = date.toISOString()
        }

        return { ...a, deuda: newDeuda, fechaVencimiento: newVencimiento }
      }
      return a
    })
    setAlumnos(newAlumnos)

    // Add receipt with correlative number
    const nextNum = recibos.length + 1
    const recNum = `REC-${String(nextNum).padStart(4, "0")}`
    const newRecibo: Recibo = {
      id: recNum,
      alumnoId,
      fecha: new Date().toISOString(),
      monto,
      metodo: metodo as any,
      concepto: `Pago cuota mensual`
    }
    setRecibos([newRecibo, ...recibos])
  }

  const renderContent = () => {
    const stockBajo = productos.filter((p) => p.stock < p.minimo && !p.pedidoEnCurso)

    switch (currentView) {
      case "pagos-proveedores":
        return (
          <GestionPagosProveedores
            onBack={() => setCurrentView("dashboard")}
            showToast={showToast}
            pagosPendientes={pagosPendientes}
            setPagosPendientes={setPagosPendientes}
          />
        )
      case "kiosco-pos":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="pos"
            productos={productos}
            setProductos={setProductos}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
          />
        )
      case "kiosco-stock":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="stock"
            productos={productos}
            setProductos={setProductos}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
          />
        )
      case "kiosco-reposicion":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="stock"
            openOrderDialogOnMount
            productos={productos}
            setProductos={setProductos}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
          />
        )
      case "portal-socio": {
        const currentUserAlumno = alumnos[activeAlumnoIndex] ?? alumnos[0]
        const currentPlan = planes.find(p => p.id === currentUserAlumno.planId)!
        const studentRecibos = recibos.filter(r => r.alumnoId === currentUserAlumno.id)
        return (
          <PortalSocio
            alumno={currentUserAlumno}
            plan={currentPlan}
            recibos={studentRecibos}
            onPagar={(metodo, monto) => handlePagarAlumno(currentUserAlumno.id, monto, metodo)}
          />
        )
      }
      case "consola-configuracion":
        return (
          <ConsolaConfiguracion
            planes={planes}
            promociones={promociones}
          />
        )
      case "registro-pagos":
        return (
          <RegistroPagos
            alumnos={alumnos}
            planes={planes}
            promociones={promociones}
            onPagar={handlePagarAlumno}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
          />
        )
      case "kiosco-ventas":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="ventas-diarias"
            productos={productos}
            setProductos={setProductos}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
          />
        )
      case "secretaria-dashboard":
        return (
          <SecretariaDashboard 
            setCurrentView={setCurrentView} 
            productos={productos}
            ventas={ventas}
          />
        )
      default:
        return (
          <AdminDashboard
            setCurrentView={setCurrentView}
            pagosPendientes={pagosPendientes}
            stockBajo={stockBajo}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-full z-50 transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <button
            onClick={() => setCurrentView(homeView)}
            className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#C2D8C4]/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#C2D8C4]" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">SquatGym</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {userRole === "secretaria" && (
            <SecretariaNav
              currentView={currentView}
              setCurrentView={setCurrentView}
              stockBajo={productos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)}
            />
          )}
          {userRole === "encargado" && (
            <EncargadoNav
              currentView={currentView}
              setCurrentView={setCurrentView}
              pagosPendientes={pagosPendientes}
              stockBajo={productos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)}
            />
          )}
          {userRole === "alumno" && (
            <AlumnoNav currentView={currentView} setCurrentView={setCurrentView} />
          )}
          {userRole === "administrador" && (
            <AdministradorNav currentView={currentView} setCurrentView={setCurrentView} />
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C2D8C4]" />
            <div>
              <p className="text-xs text-muted-foreground">Rol activo</p>
              <p className="text-sm font-semibold text-sidebar-foreground capitalize">
                {userRole}
              </p>
            </div>
          </div>

          {(userRole === "encargado" || userRole === "administrador") && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-[#C2D8C4]/40 text-[#C2D8C4] hover:bg-[#C2D8C4]/10 text-sm"
              onClick={() => showToast("Generando informe...", "info")}
            >
              <FileDown className="w-4 h-4" />
              Descargar Informe
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive text-sm"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar with non-intrusive alert bell */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5 text-foreground" />
            </Button>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#C2D8C4]" />
              <span className="font-bold text-foreground">SquatGym</span>
            </div>
          </div>

          <div className="flex-1 hidden md:block" />

          {userRole !== "alumno" && (
            <div className="relative">
              <button
                onClick={() => setAlertPanelOpen(!alertPanelOpen)}
                className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {getAlertCount(pagosPendientes, productos, userRole) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {getAlertCount(pagosPendientes, productos, userRole)}
                  </span>
                )}
              </button>

              {alertPanelOpen && (
                <div className="absolute top-11 right-0 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="font-semibold text-foreground text-sm">Centro de Alertas</p>
                    <button onClick={() => setAlertPanelOpen(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {userRole !== "secretaria" && pagosPendientes.filter((p) => p.diasAtraso >= 14).map((p) => (
                      <button
                        key={p.id}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors flex gap-3 items-start"
                        onClick={() => { setCurrentView("pagos-proveedores"); setAlertPanelOpen(false) }}
                      >
                        <AlertOctagon className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-destructive">Pago crítico</p>
                          <p className="text-xs text-foreground">{p.proveedor.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.diasAtraso} días de atraso · ${p.monto.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                    {productos.filter((p) => p.stock < p.minimo && !p.pedidoEnCurso).map((s) => (
                      <button
                        key={s.id}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors flex gap-3 items-start"
                        onClick={() => { setCurrentView("kiosco-stock"); setAlertPanelOpen(false) }}
                      >
                        <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-[#f59e0b]">Stock bajo</p>
                          <p className="text-xs text-foreground">{s.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.stock} uds / mín {s.minimo}
                          </p>
                        </div>
                      </button>
                    ))}
                    {getAlertCount(pagosPendientes, productos, userRole) === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        Sin alertas activas
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="p-8 flex-1">
          {renderContent()}
        </div>
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50 ${toast.type === "success"
            ? "bg-[#C2D8C4] text-[#222222]"
            : "bg-secondary text-secondary-foreground"
            }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Secretaria nav ───────────────────────────────────────────────────────────
function SecretariaNav({
  currentView,
  setCurrentView,
  stockBajo,
}: {
  currentView: View
  setCurrentView: (v: View) => void
  stockBajo: Product[]
}) {
  return (
    <>
      <NavButton
        active={currentView === "secretaria-dashboard"}
        icon={<LayoutDashboard className="w-4 h-4" />}
        label="Inicio"
        onClick={() => setCurrentView("secretaria-dashboard")}
      />

      <div className="pt-3 pb-1 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pagos
        </p>
      </div>
      <NavButton
        active={currentView === "registro-pagos"}
        icon={<CreditCard className="w-4 h-4" />}
        label="Cobro de Cuotas"
        onClick={() => setCurrentView("registro-pagos")}
      />

      <div className="pt-3 pb-1 px-2 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Kiosco
        </p>
      </div>
      <NavButton
        active={currentView === "kiosco-pos"}
        icon={<ShoppingCart className="w-4 h-4" />}
        label="Punto de Venta"
        onClick={() => setCurrentView("kiosco-pos")}
      />
      <NavButton
        active={currentView === "kiosco-stock"}
        icon={<Package className="w-4 h-4" />}
        label="Ver Stock"
        badge={stockBajo.length > 0 ? stockBajo.length : undefined}
        badgeColor="warning"
        onClick={() => setCurrentView("kiosco-stock")}
      />
      <NavButton
        active={currentView === "kiosco-reposicion"}
        icon={<ClipboardList className="w-4 h-4" />}
        label="Generar Pedido"
        onClick={() => setCurrentView("kiosco-reposicion")}
      />
    </>
  )
}

// ─── Encargado nav ────────────────────────────────────────────────────────────
function EncargadoNav({
  currentView,
  setCurrentView,
  pagosPendientes,
  stockBajo,
}: {
  currentView: View
  setCurrentView: (v: View) => void
  pagosPendientes: PagoPendiente[]
  stockBajo: Product[]
}) {
  const criticos = pagosPendientes.filter((p) => p.diasAtraso >= 14)

  return (
    <>
      <NavButton
        active={currentView === "dashboard"}
        icon={<LayoutDashboard className="w-4 h-4" />}
        label="Dashboard"
        onClick={() => setCurrentView("dashboard")}
      />

      <div className="pt-3 pb-1 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Finanzas
        </p>
      </div>
      <NavButton
        active={currentView === "pagos-proveedores"}
        icon={<CreditCard className="w-4 h-4" />}
        label="Pagos a Proveedores"
        badge={criticos.length > 0 ? criticos.length : undefined}
        badgeColor="destructive"
        onClick={() => setCurrentView("pagos-proveedores")}
      />

      <div className="pt-3 pb-1 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Kiosco
        </p>
      </div>
      <NavButton
        active={currentView === "kiosco-pos"}
        icon={<ShoppingCart className="w-4 h-4" />}
        label="Punto de Venta"
        onClick={() => setCurrentView("kiosco-pos")}
      />
      <NavButton
        active={currentView === "kiosco-stock"}
        icon={<Package className="w-4 h-4" />}
        label="Control de Stock"
        badge={stockBajo.length > 0 ? stockBajo.length : undefined}
        badgeColor="warning"
        onClick={() => setCurrentView("kiosco-stock")}
      />
      <NavButton
        active={currentView === "kiosco-reposicion"}
        icon={<ClipboardList className="w-4 h-4" />}
        label="Generar Pedido"
        onClick={() => setCurrentView("kiosco-reposicion")}
      />
      <NavButton
        active={currentView === "kiosco-ventas"}
        icon={<History className="w-4 h-4" />}
        label="Ventas del Día"
        onClick={() => setCurrentView("kiosco-ventas")}
      />
    </>
  )
}

// ─── Alumno nav ───────────────────────────────────────────────────────────────
function AlumnoNav({
  currentView,
  setCurrentView,
}: {
  currentView: View
  setCurrentView: (v: View) => void
}) {
  return (
    <>
      <NavButton
        active={currentView === "portal-socio"}
        icon={<LayoutDashboard className="w-4 h-4" />}
        label="Mi Portal"
        onClick={() => setCurrentView("portal-socio")}
      />
    </>
  )
}

// ─── Administrador nav ────────────────────────────────────────────────────────
function AdministradorNav({
  currentView,
  setCurrentView,
}: {
  currentView: View
  setCurrentView: (v: View) => void
}) {
  return (
    <>
      <NavButton
        active={currentView === "dashboard"}
        icon={<LayoutDashboard className="w-4 h-4" />}
        label="Dashboard"
        onClick={() => setCurrentView("dashboard")}
      />

      <div className="pt-3 pb-1 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Gestión Comercial
        </p>
      </div>
      <NavButton
        active={currentView === "consola-configuracion"}
        icon={<Settings className="w-4 h-4" />}
        label="Planes y Promos"
        onClick={() => setCurrentView("consola-configuracion")}
      />

      <div className="pt-3 pb-1 px-2 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Reportes y Operaciones
        </p>
      </div>
      <NavButton
        active={currentView === "kiosco-ventas"}
        icon={<History className="w-4 h-4" />}
        label="Ventas del Kiosco"
        onClick={() => setCurrentView("kiosco-ventas")}
      />
    </>
  )
}

// ─── Reusable nav button ──────────────────────────────────────────────────────
function NavButton({
  active,
  icon,
  label,
  badge,
  badgeColor = "destructive",
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  badge?: number
  badgeColor?: "destructive" | "warning"
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${active
        ? "bg-[#C2D8C4] text-[#222222] font-semibold"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor === "destructive" ? "bg-destructive text-white" : "bg-[#f59e0b] text-white"
            }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

// ─── Admin Dashboard Home ─────────────────────────────────────────────────────
function AdminDashboard({
  setCurrentView,
  pagosPendientes,
  stockBajo,
}: {
  setCurrentView: (v: View) => void
  pagosPendientes: PagoPendiente[]
  stockBajo: Product[]
}) {
  const criticos = pagosPendientes.filter((p) => p.diasAtraso >= 14)
  const totalPendiente = pagosPendientes.reduce((s, p) => s + p.monto, 0)

  const todoAlDia = totalPendiente === 0 && stockBajo.length === 0 && criticos.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Panel Administrativo</h2>
          <p className="text-muted-foreground mt-1">
            Gestión de egresos, inventario y operaciones
          </p>
        </div>
      </div>

      {todoAlDia ? (
        /* ── PANEL DE ÉXITO (todo en orden) ── */
        <div
          className="w-full rounded-2xl border border-[#C2D8C4] p-6 sm:p-10 flex flex-col items-center justify-center gap-4 text-center"
          style={{ backgroundColor: "rgba(194, 216, 196, 0.12)" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#C2D8C4]/20 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" style={{ color: "#C2D8C4" }} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">¡Todo al día!</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              No tenés tareas administrativas pendientes. Todos los pagos están saldados y el stock está completo.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-[#C2D8C4]/50 text-[#C2D8C4] hover:bg-[#C2D8C4]/10 gap-2"
            onClick={() => setCurrentView("pagos-proveedores")}
          >
            <History className="w-4 h-4" />
            Ver historial completo
          </Button>
        </div>
      ) : (
        /* ── KPIs + ALERTAS (hay cosas pendientes) ── */
        <>
          {/* KPI strip — solo muestra tarjetas con valor > 0 en rojo/amarillo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {totalPendiente > 0 && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Pendiente</p>
                    <p className="text-xl font-bold text-destructive">${totalPendiente.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stockBajo.length > 0 && (
              <Card className="border-[#f59e0b]/40 bg-[#f59e0b]/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bajo Mínimo</p>
                    <p className="text-xl font-bold text-[#f59e0b]">{stockBajo.length} productos</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {criticos.length > 0 && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pagos Críticos</p>
                    <p className="text-xl font-bold text-destructive">{criticos.length}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Alert detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending payments — solo si hay */}
            {pagosPendientes.length > 0 && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-destructive text-base">
                    <AlertOctagon className="w-4 h-4" />
                    Pagos Pendientes a Proveedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pagosPendientes.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{p.proveedor.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.diasAtraso > 0 ? `${p.diasAtraso} días de atraso` : "Al día"}
                        </p>
                      </div>
                      <p className={`font-bold text-sm ${p.diasAtraso >= 14 ? "text-destructive" : "text-foreground"}`}>
                        ${p.monto.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-1 border-destructive/40 text-destructive hover:bg-destructive/10 text-sm"
                    onClick={() => setCurrentView("pagos-proveedores")}
                  >
                    Ver y gestionar pagos →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Low stock — solo si hay */}
            {stockBajo.length > 0 && (
              <Card className="border-[#f59e0b]/40 bg-[#f59e0b]/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#f59e0b] text-base">
                    <AlertTriangle className="w-4 h-4" />
                    Stock Bajo en Kiosco
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stockBajo.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{s.nombre}</p>
                        <p className="text-xs text-muted-foreground">Mín: {s.minimo} unidades</p>
                      </div>
                      <p className="font-bold text-[#f59e0b] text-sm">{s.stock} uds</p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-1 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/10 text-sm"
                    onClick={() => setCurrentView("kiosco-reposicion")}
                  >
                    Generar pedido de reposición →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Quick access — siempre visible */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Accesos Rápidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <QuickCard
            icon={<CreditCard className="w-7 h-7 text-[#C2D8C4]" />}
            title="Pagos a Proveedores"
            sub="Registrar egresos y gastos"
            onClick={() => setCurrentView("pagos-proveedores")}
          />
          <QuickCard
            icon={<ShoppingCart className="w-7 h-7 text-[#C2D8C4]" />}
            title="Punto de Venta"
            sub="Iniciar venta en kiosco"
            onClick={() => setCurrentView("kiosco-pos")}
          />
          <QuickCard
            icon={<ClipboardList className="w-7 h-7 text-[#C2D8C4]" />}
            title="Control de Stock"
            sub="Ver inventario completo"
            onClick={() => setCurrentView("kiosco-stock")}
          />
        </div>
      </div>
    </div>
  )
}

function QuickCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer hover:border-[#C2D8C4]/50 transition-colors border-border bg-card group"
      onClick={onClick}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#C2D8C4]/10 flex items-center justify-center group-hover:bg-[#C2D8C4]/20 transition-colors flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Secretaria Dashboard ─────────────────────────────────────────────────────
function SecretariaDashboard({ 
  setCurrentView, 
  productos,
  ventas 
}: { 
  setCurrentView: (v: View) => void,
  productos: Product[],
  ventas: VentaKiosco[]
}) {
  const now = new Date()
  const hora = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  const fecha = now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  
  const todayStr = new Date().toLocaleDateString("es-AR")
  const ventasHoy = ventas.filter(v => v.fecha === todayStr)
  const totalHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0)
  
  const stockCritico = productos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-foreground">¡Hola de nuevo! 👋</h2>
          <p className="text-muted-foreground mt-1 capitalize text-lg">
            {fecha} · {hora}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setCurrentView("registro-pagos")}
            className="bg-[#C2D8C4] text-[#222222] hover:bg-[#C2D8C4]/90 font-bold px-6"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Cobrar Cuota
          </Button>
          <Button 
            onClick={() => setCurrentView("kiosco-pos")}
            variant="outline"
            className="border-[#C2D8C4] text-[#C2D8C4] hover:bg-[#C2D8C4]/10 font-bold px-6"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Venta Kiosco
          </Button>
        </div>
      </div>

      {/* Operative Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ventas del Kiosco hoy */}
        <Card className="border-border bg-card overflow-hidden group hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Ventas del Kiosco Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">${totalHoy.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">{ventasHoy.length} transacciones</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
              <span>Última venta: {ventasHoy[0]?.hora || "--:--"}</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setCurrentView("kiosco-pos")}>
                Ir a POS →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Alertas de stock críticas */}
        <Card className={`border-border bg-card overflow-hidden group hover:shadow-md transition-shadow ${stockCritico.length > 0 ? "border-warning/50" : ""}`}>
          <CardHeader className={`pb-2 ${stockCritico.length > 0 ? "bg-warning/5" : "bg-primary/5"}`}>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${stockCritico.length > 0 ? "text-warning" : "text-primary"}`} />
              Alertas de Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {stockCritico.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-warning">{stockCritico.length}</span>
                  <span className="text-sm text-muted-foreground">Productos bajo mínimo</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden py-1">
                   {stockCritico.slice(0, 5).map(p => (
                     <div key={p.id} className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-sm shadow-sm" title={p.nombre}>
                       {p.imagen}
                     </div>
                   ))}
                   {stockCritico.length > 5 && (
                     <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                       +{stockCritico.length - 5}
                     </div>
                   )}
                </div>
                <Button 
                  onClick={() => setCurrentView("kiosco-stock")}
                  className="w-full bg-warning/10 text-warning hover:bg-warning/20 border-0 text-xs font-bold h-8"
                >
                  Resolver Alertas Ahora
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Stock al día</p>
                <p className="text-xs text-muted-foreground">No hay productos bajo el mínimo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Otras Gestiones */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Otras Operaciones
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuickCard
            icon={<Package className="w-6 h-6 text-[#C2D8C4]" />}
            title="Inventario"
            sub="Ver catálogo"
            onClick={() => setCurrentView("kiosco-stock")}
          />
          <QuickCard
            icon={<ClipboardList className="w-6 h-6 text-[#C2D8C4]" />}
            title="Reposición"
            sub="Generar pedido"
            onClick={() => setCurrentView("kiosco-reposicion")}
          />
          <QuickCard
            icon={<BarChart3 className="w-6 h-6 text-[#C2D8C4]" />}
            title="Mis Ventas"
            sub="Historial hoy"
            onClick={() => setCurrentView("kiosco-pos")} 
          />
          <QuickCard
            icon={<Users className="w-6 h-6 text-[#C2D8C4]" />}
            title="Socios"
            sub="Listado alumnos"
            onClick={() => setCurrentView("registro-pagos")}
          />
        </div>
      </div>
    </div>
  )
}