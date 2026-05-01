"use client"

import { useState } from "react"
import { LoginScreen, UserRole } from "@/components/squat-gym/login-screen"
import { Dashboard } from "@/components/squat-gym/dashboard"
import { pagosPendientesIniciales, productosIniciales, alumnosIniciales, planesIniciales, promocionesIniciales, recibosIniciales } from "@/components/squat-gym/data"
import { PagoPendiente, Product, Alumno, Plan, Promocion, Recibo } from "@/components/squat-gym/types"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("secretaria")
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>(pagosPendientesIniciales)
  const [productos, setProductos] = useState<Product[]>(productosIniciales)
  
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosIniciales)
  const [planes, setPlanes] = useState<Plan[]>(planesIniciales)
  const [promociones, setPromociones] = useState<Promocion[]>(promocionesIniciales)
  const [recibos, setRecibos] = useState<Recibo[]>(recibosIniciales)

  const handleLogin = (role: UserRole) => {
    setUserRole(role)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <Dashboard 
      onLogout={handleLogout} 
      userRole={userRole} 
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
    />
  )
}
