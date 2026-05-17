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

import { Product, PagoPendiente, Alumno, Plan, Promocion, Recibo, VentaKiosco, RegistroPago, Proveedor } from "./types"
import { sedesOptions, proveedoresIniciales } from "./data"

interface DashboardProps {
  onLogout: () => void
  userRole: UserRole
  activeAlumnoIndex: number
  pagosPendientes: PagoPendiente[]
  setPagosPendientes: React.Dispatch<React.SetStateAction<PagoPendiente[]>>
  productos: Product[]
  setProductos: React.Dispatch<React.SetStateAction<Product[]>>
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
  registrosPagos: RegistroPago[]
  setRegistrosPagos: (r: RegistroPago[]) => void
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
  ventas, setVentas, registrosPagos, setRegistrosPagos
}: DashboardProps) {
  const [currentView, _setCurrentView] = useState<View>(getInitialView(userRole))
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null)
  const [alertPanelOpen, setAlertPanelOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Encargado and secretaria are always locked to Sede Central (S001); only admin can switch branches
  const [selectedSedeId, setSelectedSedeId] = useState<string>(sedesOptions[0].id)
  const effectiveSedeId = (userRole === "encargado" || userRole === "secretaria") ? "S001" : selectedSedeId

  // Scoped data for the current branch — filter by explicit sedeId field
  const activePagosPendientes = pagosPendientes.filter(p => p.sedeId === effectiveSedeId || !p.sedeId)
  const activeProductos = productos.filter(p => p.sedeId === effectiveSedeId)

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
            pagosPendientes={userRole === "encargado" ? activePagosPendientes : pagosPendientes}
            setPagosPendientes={userRole === "encargado"
              ? (updated: PagoPendiente[]) => {
                  // Merge: keep all pagos from OTHER branches, replace this branch's with updated
                  setPagosPendientes((prev: PagoPendiente[]) => [
                    ...prev.filter(p => p.sedeId !== effectiveSedeId && p.sedeId != null),
                    ...updated,
                  ])
                }
              : setPagosPendientes
            }
            registrosPagos={registrosPagos}
            setRegistrosPagos={setRegistrosPagos}
          />
        )
      case "kiosco-pos":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="pos"
            productos={activeProductos}
            setProductos={(newProds) => {
              setProductos(prev => {
                const map = new Map(prev.map(p => [p.id, p]))
                ;(newProds as Product[]).forEach(p => map.set(p.id, p))
                return Array.from(map.values())
              })
            }}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
            sedeId={effectiveSedeId}
          />
        )
      case "kiosco-stock":
        return (
          <AdministracionKiosco
            key={currentView}
            onBack={() => setCurrentView(backTarget)}
            showToast={showToast}
            initialView="stock"
            productos={activeProductos}
            setProductos={(newProds) => {
              setProductos(prev => {
                const map = new Map(prev.map(p => [p.id, p]))
                ;(newProds as Product[]).forEach(p => map.set(p.id, p))
                return Array.from(map.values())
              })
            }}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
            sedeId={effectiveSedeId}
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
            productos={activeProductos}
            setProductos={(newProds) => {
              setProductos(prev => {
                const map = new Map(prev.map(p => [p.id, p]))
                ;(newProds as Product[]).forEach(p => map.set(p.id, p))
                return Array.from(map.values())
              })
            }}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
            sedeId={effectiveSedeId}
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
            setPlanes={setPlanes}
            promociones={promociones}
            setPromociones={setPromociones}
          />
        )
      case "registro-pagos":
        return (
          <RegistroPagos
            alumnos={alumnos}
            planes={planes}
            promociones={promociones}
            recibos={recibos}
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
            productos={activeProductos}
            setProductos={(newProds) => {
              setProductos(prev => {
                const map = new Map(prev.map(p => [p.id, p]))
                ;(newProds as Product[]).forEach(p => map.set(p.id, p))
                return Array.from(map.values())
              })
            }}
            ventas={ventas}
            setVentas={setVentas}
            setPagosPendientes={setPagosPendientes}
            userRole={userRole}
            sedeId={effectiveSedeId}
          />
        )
      case "secretaria-dashboard":
        return (
          <SecretariaDashboard 
            setCurrentView={setCurrentView} 
            productos={activeProductos}
            ventas={ventas}
          />
        )
      default:
        return (
          <AdminDashboard
            setCurrentView={setCurrentView}
            pagosPendientes={activePagosPendientes}
            stockBajo={stockBajo}
            productos={activeProductos}
            ventas={ventas}
            selectedSedeId={effectiveSedeId}
            setSelectedSedeId={setSelectedSedeId}
            userRole={userRole}
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
              stockBajo={activeProductos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)}
            />
          )}
          {userRole === "encargado" && (
            <EncargadoNav
              currentView={currentView}
              setCurrentView={setCurrentView}
              pagosPendientes={activePagosPendientes}
              stockBajo={activeProductos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)}
            />
          )}
          {userRole === "alumno" && (
            <AlumnoNav currentView={currentView} setCurrentView={setCurrentView} />
          )}
          {userRole === "administrador" && (
            <AdministradorNav
              currentView={currentView}
              setCurrentView={setCurrentView}
              pagosPendientes={activePagosPendientes}
              stockBajo={activeProductos.filter(p => p.stock < p.minimo && !p.pedidoEnCurso)}
            />
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
                {getAlertCount(activePagosPendientes, activeProductos, userRole) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {getAlertCount(activePagosPendientes, activeProductos, userRole)}
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
                    {userRole !== "secretaria" && activePagosPendientes.filter((p) => p.diasAtraso >= 14).map((p) => (
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
                    {activeProductos.filter((p) => p.stock < p.minimo && !p.pedidoEnCurso).map((s) => (
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
                    {getAlertCount(activePagosPendientes, activeProductos, userRole) === 0 && (
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
  productos,
  ventas,
  selectedSedeId,
  setSelectedSedeId,
  userRole
}: {
  setCurrentView: (v: View) => void
  pagosPendientes: PagoPendiente[]
  stockBajo: Product[]
  productos?: Product[]
  ventas?: VentaKiosco[]
  selectedSedeId: string
  setSelectedSedeId: (id: string) => void
  userRole?: string
}) {
  const selectedSede = sedesOptions.find(s => s.id === selectedSedeId)

  // Use the props directly, as they are already filtered by the parent Dashboard component
  const branchPagos = pagosPendientes
  const branchStockBajo = productos?.filter(p => p.stock < p.minimo && !p.pedidoEnCurso) || stockBajo

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {userRole === "administrador" ? "Panel de Administrador" : "Panel de Control"}
          </h2>
          {userRole === "administrador" && (
            <p className="text-muted-foreground mt-1 text-lg">
              Estás visualizando la sucursal: <span className="font-semibold text-primary">{selectedSede?.nombre.replace("Sede ", "")}</span>
            </p>
          )}
        </div>
        {userRole === "administrador" && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Seleccionar Sucursal:</span>
            <select 
              className="p-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              value={selectedSedeId}
              onChange={(e) => setSelectedSedeId(e.target.value)}
            >
              {sedesOptions.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagos Pendientes Card */}
        <div className={`rounded-2xl border ${branchPagos.length > 0 ? 'border-destructive/40' : 'border-border'} bg-card p-5 shadow-sm hover:shadow-md transition-all`}>
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl w-fit ${branchPagos.length > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
            {branchPagos.length > 0 ? (
              <AlertOctagon className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            )}
            <p className={`text-sm font-bold uppercase tracking-wider ${branchPagos.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>Pagos Pendientes</p>
          </div>
          {branchPagos.length > 0 ? (
            <div className="space-y-3">
              {branchPagos.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.proveedor.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.diasAtraso > 0 ? `${p.diasAtraso} días de atraso` : "Al día"}</p>
                  </div>
                  <p className={`font-black text-sm ${p.diasAtraso >= 14 ? "text-destructive" : "text-foreground"}`}>${p.monto.toLocaleString()}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 text-sm font-semibold rounded-xl" onClick={() => setCurrentView("pagos-proveedores")}>
                Gestionar pagos →
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center bg-background rounded-xl border border-border">
              <CheckCircle2 className="w-8 h-8 text-[#C2D8C4] mx-auto mb-2" />
              <p className="font-semibold text-foreground">Al día</p>
              <p className="text-xs text-muted-foreground">No hay pagos pendientes para esta sucursal.</p>
            </div>
          )}
        </div>

        {/* Stock Bajo Card */}
        <div className={`rounded-2xl border ${branchStockBajo.length > 0 ? 'border-[#f59e0b]/40' : 'border-border'} bg-card p-5 shadow-sm hover:shadow-md transition-all`}>
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl w-fit ${branchStockBajo.length > 0 ? 'bg-[#f59e0b]/10' : 'bg-muted'}`}>
            {branchStockBajo.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            )}
            <p className={`text-sm font-bold uppercase tracking-wider ${branchStockBajo.length > 0 ? 'text-[#f59e0b]' : 'text-muted-foreground'}`}>Alertas de Stock</p>
          </div>
          {branchStockBajo.length > 0 ? (
            <div className="space-y-3">
              {branchStockBajo.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.imagen}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{s.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Mín: {s.minimo} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#f59e0b] text-sm">{s.stock} uds</p>
                    <p className="text-[10px] text-muted-foreground">En stock</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/10 text-sm font-semibold rounded-xl" onClick={() => setCurrentView("kiosco-reposicion")}>
                Generar pedido →
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center bg-background rounded-xl border border-border">
              <CheckCircle2 className="w-8 h-8 text-[#C2D8C4] mx-auto mb-2" />
              <p className="font-semibold text-foreground">Stock óptimo</p>
              <p className="text-xs text-muted-foreground">Todos los productos sobre el mínimo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-foreground">¡Hola de nuevo! 👋</h2>
          <p className="text-muted-foreground mt-1 capitalize text-lg">
            {fecha} · {hora}
          </p>
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
    </div>
  )
}