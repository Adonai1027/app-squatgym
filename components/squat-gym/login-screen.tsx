"use client"

import { useState } from "react"
import { Dumbbell, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export type UserRole = "alumno" | "secretaria" | "encargado" | "administrador"

interface LoginScreenProps {
  onLogin: (role: UserRole) => void
}

// Credenciales: 
// - user/user (Alumno)
// - sec/sec (Secretaria)
// - enc/enc (Encargado)
// - admin/admin (Administrador)

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(false)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Role-based authentication
    if (username === "user" && password === "user") {
      onLogin("alumno")
    } else if (username === "sec" && password === "sec") {
      onLogin("secretaria")
    } else if (username === "enc" && password === "enc") {
      onLogin("encargado")
    } else if (username === "admin" && password === "admin") {
      onLogin("administrador")
    } else {
      setError(true)
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(false)
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
                  <p className="font-medium text-destructive">Credenciales incorrectas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    El usuario o contraseña ingresados no son válidos.
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