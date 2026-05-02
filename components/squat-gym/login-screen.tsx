"use client"

import { useState } from "react"
import { Dumbbell, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export type UserRole = "alumno" | "secretaria" | "encargado" | "administrador"

interface LoginScreenProps {
  onLogin: (role: UserRole, alumnoIndex?: number) => void
  alumnoCount: number
  nextAlumnoIndex: number
}

// Credenciales:
// - user/user (Alumno) ← rota entre alumnos en cada login
// - [8 dígitos numéricos]/[mismo dni] (Alumno) ← rota entre alumnos
// - sec/sec (Secretaria)
// - enc/enc (Encargado)
// - admin/admin (Administrador)

const EIGHT_DIGIT_REGEX = /^\d{8}$/

export function LoginScreen({ onLogin, alumnoCount, nextAlumnoIndex }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Validate DNI (8 numeric digits) — same value for user and password
    if (EIGHT_DIGIT_REGEX.test(username) && username === password) {
      onLogin("alumno", nextAlumnoIndex % alumnoCount)
    } else if (EIGHT_DIGIT_REGEX.test(username) && password !== username) {
      // Typed a valid DNI format but wrong password
      setError("Contraseña incorrecta para el DNI ingresado.")
      setIsLoading(false)
    } else if (username === "user" && password === "user") {
      onLogin("alumno", nextAlumnoIndex % alumnoCount)
    } else if (username === "sec" && password === "sec") {
      onLogin("secretaria")
    } else if (username === "enc" && password === "enc") {
      onLogin("encargado")
    } else if (username === "admin" && password === "admin") {
      onLogin("administrador")
    } else if (username.length === 8 && !EIGHT_DIGIT_REGEX.test(username)) {
      // 8 chars but not all digits
      setError("El usuario debe ser un DNI con exactamente 8 dígitos numéricos.")
      setIsLoading(false)
    } else {
      setError("Usuario o contraseña incorrectos.")
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setUsername("")
    setPassword("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">SquatGym</h1>
            <p className="text-muted-foreground text-sm mt-1">Sistema de Gestión V3</p>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Acceso denegado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}