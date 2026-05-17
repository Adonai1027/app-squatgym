export interface Proveedor {
  id: string
  nombre: string
  rubro: string
  contacto: string
  telefono: string
  email: string
}

export interface PagoPendiente {
  id: string
  proveedor: Proveedor
  concepto: string
  monto: number
  fechaVencimiento: string
  diasAtraso: number
  factura?: string
  sedeId?: string
}

export interface Product {
  id: number
  catalogId: number      // logical product id (same across branches)
  sedeId: string         // which branch this stock entry belongs to
  nombre: string
  precio: number
  stock: number
  minimo: number
  imagen: string
  pedidoEnCurso?: boolean
}

export interface Plan {
  id: string
  nombre: string
  precio: number
  descripcion: string
}

export interface Promocion {
  id: string
  codigo: string
  descuentoPorcentaje: number
  activa: boolean
}

export interface Alumno {
  id: string
  dni: string
  nombre: string
  planId: string
  deuda: number
  fechaVencimiento: string
  fechaAlta: string
}

export interface Recibo {
  id: string
  alumnoId: string
  fecha: string
  monto: number
  metodo: "Efectivo" | "Tarjeta" | "Transferencia" | "QR"
  concepto: string
}

export type Turno = "mañana" | "tarde" | "noche"

export interface VentaKiosco {
  id: string
  fecha: string       // "DD/MM/AAAA"
  hora: string        // "HH:MM"
  items: { nombre: string; cantidad: number; precio: number }[]
  total: number
  medio: string
  cliente?: string
  dniCliente?: string
  sedeId: string
  sede: string
  turno: Turno
}

export interface RegistroPago {
  id: string
  proveedor: Proveedor
  concepto: string
  monto: number
  medioPago: string
  factura: string
  fechaPago: string
  horaPago: string
  numero: string
  notas: string
}
