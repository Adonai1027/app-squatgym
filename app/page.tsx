"use client"

import { useState } from "react"
import { LoginScreen, UserRole } from "@/components/squat-gym/login-screen"
import { Dashboard } from "@/components/squat-gym/dashboard"
import { pagosPendientesIniciales, productosIniciales, alumnosIniciales, planesIniciales, promocionesIniciales, recibosIniciales, ventasKioscoIniciales, registrosPagosIniciales } from "@/components/squat-gym/data"
import { PagoPendiente, Product, Alumno, Plan, Promocion, Recibo, VentaKiosco, RegistroPago } from "@/components/squat-gym/types"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("secretaria")
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>(pagosPendientesIniciales)
  const [productos, setProductos] = useState<Product[]>(productosIniciales)
  
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosIniciales)
  const [planes, setPlanes] = useState<Plan[]>(planesIniciales)
  const [promociones, setPromociones] = useState<Promocion[]>(promocionesIniciales)
  const [recibos, setRecibos] = useState<Recibo[]>(recibosIniciales)
  const [ventas, setVentas] = useState<VentaKiosco[]>(ventasKioscoIniciales)
  const [registrosPagos, setRegistrosPagos] = useState<RegistroPago[]>(registrosPagosIniciales)

  // Tracks which alumno will log in next — rotates through all alumnos
  const [nextAlumnoIndex, setNextAlumnoIndex] = useState(0)
  const [activeAlumnoIndex, setActiveAlumnoIndex] = useState(0)

  const handleLogin = (role: UserRole, alumnoIndex?: number) => {
    setUserRole(role)
    if (role === "alumno" && alumnoIndex !== undefined) {
      setActiveAlumnoIndex(alumnoIndex)
      // Advance the pointer for the NEXT alumno login
      setNextAlumnoIndex((alumnoIndex + 1) % alumnosIniciales.length)
    }
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        alumnoCount={alumnosIniciales.length}
        nextAlumnoIndex={nextAlumnoIndex}
      />
    )
  }

  return (
    <Dashboard 
      onLogout={handleLogout} 
      userRole={userRole}
      activeAlumnoIndex={activeAlumnoIndex}
      pagosPendientes={pagosPendientes}
      setPagosPendientes={setPagosPendientes}
      productos={productos}
      setProductos={setProductos}
      alumnos={alumnos}
      setAlumnos={setAlumnos}
      planes={planes}
      setPlanes={setPlanes}
      promociones={promociones}
      setPromociones={setPromociones}
      recibos={recibos}
      setRecibos={setRecibos}
      ventas={ventas}
      setVentas={setVentas}
      registrosPagos={registrosPagos}
      setRegistrosPagos={setRegistrosPagos}
    />
  )
}
