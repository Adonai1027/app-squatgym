import { Product, Proveedor, PagoPendiente, Plan, Promocion, Alumno, Recibo } from "./types"

export const proveedoresIniciales: Proveedor[] = [
  {
    id: "P001",
    nombre: "FitSupply Corp",
    rubro: "Insumos y Equipamiento",
    contacto: "Juan Rodríguez",
    telefono: "+54 362 123-4567",
    email: "ventas@fitsupply.com",
  },
  {
    id: "P002",
    nombre: "Bebidas Premium SA",
    rubro: "Bebidas e Isotónicos",
    contacto: "María López",
    telefono: "+54 362 234-5678",
    email: "contacto@bebidasprm.com",
  },
  {
    id: "P003",
    nombre: "Equipos Deportivos XXL",
    rubro: "Equipamiento",
    contacto: "Carlos Menéndez",
    telefono: "+54 362 345-6789",
    email: "admin@equiposxl.com",
  },
  {
    id: "P004",
    nombre: "Nutrición & Energía",
    rubro: "Proteínas y Suplementos",
    contacto: "Ana García",
    telefono: "+54 362 456-7890",
    email: "pedidos@nutricion-energia.com",
  },
]

export const pagosPendientesIniciales: PagoPendiente[] = [
  {
    id: "PPend-001",
    proveedor: proveedoresIniciales[0],
    concepto: "Insumos",
    monto: 45000,
    fechaVencimiento: "2026-04-15",
    diasAtraso: 9,
    factura: "AFIP-2026-001234",
  },
  {
    id: "PPend-002",
    proveedor: proveedoresIniciales[1],
    concepto: "Bebidas",
    monto: 28500,
    fechaVencimiento: "2026-04-10",
    diasAtraso: 14,
    factura: "AFIP-2026-001235",
  },
  {
    id: "PPend-003",
    proveedor: proveedoresIniciales[2],
    concepto: "Equipamiento",
    monto: 125000,
    fechaVencimiento: "2026-05-01",
    diasAtraso: 0,
  },
]

export const productosIniciales: Product[] = [
  { id: 1, nombre: "Agua Mineral 500ml", precio: 500, stock: 3, minimo: 10, imagen: "💧" },
  { id: 2, nombre: "Bebida Isotónica", precio: 800, stock: 5, minimo: 12, imagen: "🥤" },
  { id: 3, nombre: "Barra de Proteína", precio: 1200, stock: 2, minimo: 8, imagen: "🍫" },
  { id: 4, nombre: "Batido Proteico", precio: 1500, stock: 15, minimo: 10, imagen: "🥛" },
  { id: 5, nombre: "Banana", precio: 300, stock: 0, minimo: 15, imagen: "🍌" },
  { id: 6, nombre: "Yogurt Griego", precio: 600, stock: 8, minimo: 6, imagen: "🥣" },
  { id: 7, nombre: "Café Express", precio: 400, stock: 30, minimo: 20, imagen: "☕" },
  { id: 8, nombre: "Galletas Integrales", precio: 350, stock: 12, minimo: 10, imagen: "🍪" },
]

export const planesIniciales: Plan[] = [
  { id: "PL1", nombre: "Pase Libre", precio: 25000, descripcion: "Acceso ilimitado todas las sedes" },
  { id: "PL2", nombre: "Musculación", precio: 18000, descripcion: "Acceso solo a sala de musculación" },
  { id: "PL3", nombre: "Clases Grupales", precio: 15000, descripcion: "Acceso a clases de spinning y yoga" },
]

export const promocionesIniciales: Promocion[] = [
  { id: "PR1", codigo: "VERANO26", descuentoPorcentaje: 15, activa: true },
  { id: "PR2", codigo: "ESTUDIANTE", descuentoPorcentaje: 20, activa: true },
  { id: "PR3", codigo: "CUPON30", descuentoPorcentaje: 30, activa: false },
]

export const alumnosIniciales: Alumno[] = [
  { id: "A001", dni: "35123456", nombre: "Martín Palermo", planId: "PL1", deuda: 25000, fechaVencimiento: "2026-05-05" },
  { id: "A002", dni: "40987654", nombre: "Lionel Messi", planId: "PL2", deuda: 0, fechaVencimiento: "2026-05-20" },
  { id: "A003", dni: "38111222", nombre: "Emanuel Ginóbili", planId: "PL3", deuda: 15000, fechaVencimiento: "2026-04-30" },
]

export const recibosIniciales: Recibo[] = [
  { id: "REC-001", alumnoId: "A002", fecha: "2026-04-20T10:00:00Z", monto: 18000, metodo: "Transferencia", concepto: "Pago cuota mensual - Musculación" },
]
