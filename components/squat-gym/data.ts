import { Product, Proveedor, PagoPendiente, Plan, Promocion, Alumno, Recibo, VentaKiosco, Turno, RegistroPago } from "./types"

// Helper to build a past date string "DD/MM/AAAA"
function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString("es-AR")
}

function turnoFromHora(hora: string): Turno {
  const h = parseInt(hora.split(":")[0], 10)
  if (h < 13) return "mañana"
  if (h < 18) return "tarde"
  return "noche"
}

function mkVenta(
  id: string,
  daysAgo: number,
  hora: string,
  sedeId: string,
  sede: string,
  items: { nombre: string; cantidad: number; precio: number }[],
  medio: string,
  cliente?: string,
  dniCliente?: string
): VentaKiosco {
  return {
    id,
    fecha: pastDate(daysAgo),
    hora,
    items,
    total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    medio,
    cliente,
    dniCliente,
    sedeId,
    sede,
    turno: turnoFromHora(hora),
  }
}

// ── Sedes del gimnasio ────────────────────────────────────────────────────────
export const sedesOptions = [
  { id: "S001", nombre: "Sede Central", direccion: "Av. Corrientes 1234, CABA" },
  { id: "S002", nombre: "Sede Norte", direccion: "Av. Cabildo 2500, CABA" },
  { id: "S003", nombre: "Sede Sur", direccion: "Av. Rivadavia 8900, CABA" },
  { id: "S004", nombre: "Sede Oeste", direccion: "Av. San Martín 3400, CABA" },
]

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

export const registrosPagosIniciales: RegistroPago[] = []

export const productosIniciales: Product[] = [
  { id: 1, nombre: "Agua Mineral 500ml", precio: 500, stock: 3, minimo: 10, imagen: "💧" },
  { id: 2, nombre: "Bebida Isotónica", precio: 800, stock: 5, minimo: 12, imagen: "🥤" },
  { id: 3, nombre: "Barra de Proteína", precio: 1200, stock: 2, minimo: 8, imagen: "🍫" },
  { id: 4, nombre: "Batido Proteico", precio: 1500, stock: 15, minimo: 10, imagen: "🥛" },
  { id: 5, nombre: "Banana", precio: 300, stock: 0, minimo: 15, imagen: "🍌" },
  { id: 6, nombre: "Yogurt Griego", precio: 600, stock: 8, minimo: 6, imagen: "🥣" },
  { id: 7, nombre: "Café Express", precio: 400, stock: 30, minimo: 20, imagen: "☕" },
  { id: 8, nombre: "Galletas Integrales", precio: 350, stock: 12, minimo: 10, imagen: "🍪" },
  { id: 9, nombre: "Toalla Deportiva", precio: 3500, stock: 5, minimo: 5, imagen: "🧻" },
  { id: 10, nombre: "Venda Elástica", precio: 1800, stock: 10, minimo: 5, imagen: "🩹" },
  { id: 11, nombre: "Agua Mineral 1L", precio: 800, stock: 20, minimo: 15, imagen: "💧" },
  { id: 12, nombre: "Pre-Entreno", precio: 2500, stock: 4, minimo: 10, imagen: "⚡" },
]

export const planesIniciales: Plan[] = [
  { id: "PL1", nombre: "Pase Libre", precio: 25000, descripcion: "Acceso ilimitado todas las sedes" },
  { id: "PL2", nombre: "Musculación", precio: 18000, descripcion: "Acceso solo a sala de musculación" },
  { id: "PL3", nombre: "Clases Grupales", precio: 15000, descripcion: "Acceso a clases de spinning y yoga" },
  { id: "PL4", nombre: "Kickboxing", precio: 17000, descripcion: "Clases de kickboxing con profesor" },
  { id: "PL5", nombre: "Zumba", precio: 14000, descripcion: "Clases de zumba de lunes a viernes" },
]

export const promocionesIniciales: Promocion[] = [
  { id: "PR1", codigo: "VERANO26", descuentoPorcentaje: 15, activa: true },
  { id: "PR2", codigo: "ESTUDIANTE", descuentoPorcentaje: 20, activa: true },
  { id: "PR3", codigo: "CUPON30", descuentoPorcentaje: 30, activa: false },
]

export const alumnosIniciales: Alumno[] = [
  { id: "A001", dni: "35123456", nombre: "Martín Palermo", planId: "PL1", deuda: 25000, fechaVencimiento: "2026-05-05", fechaAlta: "2025-05-05" },
  { id: "A002", dni: "40987654", nombre: "Lionel Messi", planId: "PL2", deuda: 0, fechaVencimiento: "2026-05-20", fechaAlta: "2025-05-20" },
  { id: "A003", dni: "38111222", nombre: "Emanuel Ginóbili", planId: "PL3", deuda: 15000, fechaVencimiento: "2026-04-30", fechaAlta: "2025-04-30" },
  { id: "A004", dni: "42333444", nombre: "Luciana Aymar", planId: "PL1", deuda: 0, fechaVencimiento: "2026-06-15", fechaAlta: "2025-06-15" },
  { id: "A005", dni: "31555666", nombre: "Gabriela Sabatini", planId: "PL2", deuda: 36000, fechaVencimiento: "2026-03-10", fechaAlta: "2025-03-10" },
  { id: "A006", dni: "39888777", nombre: "Juan Martín del Potro", planId: "PL1", deuda: 0, fechaVencimiento: "2026-05-18", fechaAlta: "2025-05-18" },
  { id: "A007", dni: "45112233", nombre: "Julián Álvarez", planId: "PL3", deuda: 15000, fechaVencimiento: "2026-05-02", fechaAlta: "2025-05-02" },
]

export const recibosIniciales: Recibo[] = [
  { id: "REC-001", alumnoId: "A002", fecha: "2026-04-20T10:00:00Z", monto: 18000, metodo: "Transferencia", concepto: "Pago cuota mensual - Musculación" },
]

// ── Ventas históricas del kiosco ──────────────────────────────────────────────
export const ventasKioscoIniciales: VentaKiosco[] = [
  // Hoy – Sede Central
  mkVenta("V-001", 0, "08:45", "S001", "Sede Central",
    [{ nombre: "Agua Mineral 500ml", cantidad: 2, precio: 500 }, { nombre: "Barra de Proteína", cantidad: 1, precio: 1200 }],
    "Efectivo", "Juan Pérez", "12345678"),
  mkVenta("V-002", 0, "10:30", "S001", "Sede Central",
    [{ nombre: "Café Express", cantidad: 1, precio: 400 }], "QR"),
  mkVenta("V-003", 0, "11:55", "S001", "Sede Central",
    [{ nombre: "Batido Proteico", cantidad: 2, precio: 1500 }, { nombre: "Bebida Isotónica", cantidad: 1, precio: 800 }],
    "Tarjeta", "María García", "23456789"),
  mkVenta("V-004", 0, "14:10", "S001", "Sede Central",
    [{ nombre: "Yogurt Griego", cantidad: 1, precio: 600 }, { nombre: "Galletas Integrales", cantidad: 2, precio: 350 }],
    "Efectivo"),
  mkVenta("V-005", 0, "16:50", "S001", "Sede Central",
    [{ nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }], "QR", "Carlos López", "34567890"),
  mkVenta("V-006", 0, "19:30", "S001", "Sede Central",
    [{ nombre: "Agua Mineral 1L", cantidad: 3, precio: 800 }, { nombre: "Café Express", cantidad: 2, precio: 400 }],
    "Tarjeta"),

  // Hoy – Sede Norte
  mkVenta("V-007", 0, "09:00", "S002", "Sede Norte",
    [{ nombre: "Bebida Isotónica", cantidad: 2, precio: 800 }], "Efectivo"),
  mkVenta("V-008", 0, "12:15", "S002", "Sede Norte",
    [{ nombre: "Barra de Proteína", cantidad: 3, precio: 1200 }, { nombre: "Agua Mineral 500ml", cantidad: 1, precio: 500 }],
    "Tarjeta", "Ana Martínez", "45678901"),
  mkVenta("V-009", 0, "15:40", "S002", "Sede Norte",
    [{ nombre: "Batido Proteico", cantidad: 1, precio: 1500 }], "QR"),
  mkVenta("V-010", 0, "20:05", "S002", "Sede Norte",
    [{ nombre: "Venda Elástica", cantidad: 2, precio: 1800 }, { nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }],
    "Efectivo", "Pedro Rodríguez", "56789012"),

  // Hoy – Sede Sur
  mkVenta("V-011", 0, "10:00", "S003", "Sede Sur",
    [{ nombre: "Café Express", cantidad: 2, precio: 400 }, { nombre: "Galletas Integrales", cantidad: 1, precio: 350 }],
    "QR"),
  mkVenta("V-012", 0, "17:20", "S003", "Sede Sur",
    [{ nombre: "Agua Mineral 1L", cantidad: 2, precio: 800 }], "Efectivo"),

  // Ayer – Sede Central
  mkVenta("V-013", 1, "09:10", "S001", "Sede Central",
    [{ nombre: "Pre-Entreno", cantidad: 2, precio: 2500 }], "Tarjeta", "Juan Pérez", "12345678"),
  mkVenta("V-014", 1, "11:00", "S001", "Sede Central",
    [{ nombre: "Agua Mineral 500ml", cantidad: 4, precio: 500 }, { nombre: "Bebida Isotónica", cantidad: 2, precio: 800 }],
    "Efectivo"),
  mkVenta("V-015", 1, "14:30", "S001", "Sede Central",
    [{ nombre: "Barra de Proteína", cantidad: 2, precio: 1200 }], "QR"),
  mkVenta("V-016", 1, "18:45", "S001", "Sede Central",
    [{ nombre: "Toalla Deportiva", cantidad: 1, precio: 3500 }], "Tarjeta", "María García", "23456789"),

  // Ayer – Sede Norte
  mkVenta("V-017", 1, "08:30", "S002", "Sede Norte",
    [{ nombre: "Café Express", cantidad: 3, precio: 400 }, { nombre: "Agua Mineral 500ml", cantidad: 2, precio: 500 }],
    "Efectivo"),
  mkVenta("V-018", 1, "13:00", "S002", "Sede Norte",
    [{ nombre: "Batido Proteico", cantidad: 2, precio: 1500 }, { nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }],
    "Tarjeta", "Ana Martínez", "45678901"),
  mkVenta("V-019", 1, "19:15", "S002", "Sede Norte",
    [{ nombre: "Venda Elástica", cantidad: 1, precio: 1800 }], "QR"),

  // Ayer – Sede Oeste
  mkVenta("V-020", 1, "10:45", "S004", "Sede Oeste",
    [{ nombre: "Agua Mineral 1L", cantidad: 3, precio: 800 }, { nombre: "Yogurt Griego", cantidad: 2, precio: 600 }],
    "Efectivo"),
  mkVenta("V-021", 1, "16:00", "S004", "Sede Oeste",
    [{ nombre: "Bebida Isotónica", cantidad: 1, precio: 800 }, { nombre: "Galletas Integrales", cantidad: 3, precio: 350 }],
    "QR"),

  // 2 días atrás – Sede Sur
  mkVenta("V-022", 2, "09:30", "S003", "Sede Sur",
    [{ nombre: "Barra de Proteína", cantidad: 1, precio: 1200 }, { nombre: "Café Express", cantidad: 2, precio: 400 }],
    "Efectivo", "Carlos López", "34567890"),
  mkVenta("V-023", 2, "12:00", "S003", "Sede Sur",
    [{ nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }], "Tarjeta"),
  mkVenta("V-024", 2, "15:30", "S003", "Sede Sur",
    [{ nombre: "Agua Mineral 500ml", cantidad: 5, precio: 500 }, { nombre: "Batido Proteico", cantidad: 1, precio: 1500 }],
    "QR"),
  mkVenta("V-025", 2, "20:00", "S003", "Sede Sur",
    [{ nombre: "Venda Elástica", cantidad: 2, precio: 1800 }], "Efectivo", "Pedro Rodríguez", "56789012"),

  // 2 días atrás – Sede Central
  mkVenta("V-026", 2, "08:00", "S001", "Sede Central",
    [{ nombre: "Agua Mineral 1L", cantidad: 2, precio: 800 }], "Efectivo"),
  mkVenta("V-027", 2, "11:30", "S001", "Sede Central",
    [{ nombre: "Yogurt Griego", cantidad: 3, precio: 600 }, { nombre: "Galletas Integrales", cantidad: 2, precio: 350 }],
    "Tarjeta", "Juan Pérez", "12345678"),
  mkVenta("V-028", 2, "17:00", "S001", "Sede Central",
    [{ nombre: "Pre-Entreno", cantidad: 2, precio: 2500 }, { nombre: "Bebida Isotónica", cantidad: 2, precio: 800 }],
    "QR"),

  // 3 días atrás – múltiples sedes
  mkVenta("V-029", 3, "09:45", "S001", "Sede Central",
    [{ nombre: "Café Express", cantidad: 2, precio: 400 }], "Efectivo"),
  mkVenta("V-030", 3, "13:10", "S002", "Sede Norte",
    [{ nombre: "Batido Proteico", cantidad: 1, precio: 1500 }, { nombre: "Barra de Proteína", cantidad: 2, precio: 1200 }],
    "Tarjeta", "María García", "23456789"),
  mkVenta("V-031", 3, "15:00", "S003", "Sede Sur",
    [{ nombre: "Agua Mineral 500ml", cantidad: 3, precio: 500 }], "QR"),
  mkVenta("V-032", 3, "18:30", "S004", "Sede Oeste",
    [{ nombre: "Toalla Deportiva", cantidad: 1, precio: 3500 }, { nombre: "Venda Elástica", cantidad: 1, precio: 1800 }],
    "Efectivo", "Ana Martínez", "45678901"),
  mkVenta("V-033", 3, "20:45", "S001", "Sede Central",
    [{ nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }], "Tarjeta"),

  // 4 días atrás
  mkVenta("V-034", 4, "10:00", "S001", "Sede Central",
    [{ nombre: "Bebida Isotónica", cantidad: 4, precio: 800 }, { nombre: "Agua Mineral 500ml", cantidad: 2, precio: 500 }],
    "Efectivo"),
  mkVenta("V-035", 4, "14:20", "S002", "Sede Norte",
    [{ nombre: "Yogurt Griego", cantidad: 2, precio: 600 }], "QR"),
  mkVenta("V-036", 4, "16:45", "S003", "Sede Sur",
    [{ nombre: "Café Express", cantidad: 1, precio: 400 }, { nombre: "Galletas Integrales", cantidad: 2, precio: 350 }],
    "Tarjeta"),
  mkVenta("V-037", 4, "19:00", "S004", "Sede Oeste",
    [{ nombre: "Batido Proteico", cantidad: 2, precio: 1500 }], "Efectivo", "Carlos López", "34567890"),

  // 5 días atrás
  mkVenta("V-038", 5, "09:15", "S002", "Sede Norte",
    [{ nombre: "Barra de Proteína", cantidad: 2, precio: 1200 }, { nombre: "Pre-Entreno", cantidad: 1, precio: 2500 }],
    "Tarjeta", "Pedro Rodríguez", "56789012"),
  mkVenta("V-039", 5, "12:30", "S001", "Sede Central",
    [{ nombre: "Agua Mineral 1L", cantidad: 4, precio: 800 }], "Efectivo"),
  mkVenta("V-040", 5, "15:50", "S003", "Sede Sur",
    [{ nombre: "Venda Elástica", cantidad: 1, precio: 1800 }, { nombre: "Toalla Deportiva", cantidad: 1, precio: 3500 }],
    "QR"),
  mkVenta("V-041", 5, "20:00", "S004", "Sede Oeste",
    [{ nombre: "Café Express", cantidad: 3, precio: 400 }], "Efectivo"),

  // 6 días atrás
  mkVenta("V-042", 6, "08:30", "S001", "Sede Central",
    [{ nombre: "Batido Proteico", cantidad: 1, precio: 1500 }, { nombre: "Galletas Integrales", cantidad: 2, precio: 350 }],
    "Efectivo", "Juan Pérez", "12345678"),
  mkVenta("V-043", 6, "11:00", "S002", "Sede Norte",
    [{ nombre: "Agua Mineral 500ml", cantidad: 3, precio: 500 }, { nombre: "Bebida Isotónica", cantidad: 1, precio: 800 }],
    "Tarjeta"),
  mkVenta("V-044", 6, "14:00", "S003", "Sede Sur",
    [{ nombre: "Pre-Entreno", cantidad: 2, precio: 2500 }], "QR", "María García", "23456789"),
  mkVenta("V-045", 6, "17:30", "S004", "Sede Oeste",
    [{ nombre: "Yogurt Griego", cantidad: 1, precio: 600 }, { nombre: "Café Express", cantidad: 2, precio: 400 }],
    "Efectivo"),
  mkVenta("V-046", 6, "21:00", "S001", "Sede Central",
    [{ nombre: "Venda Elástica", cantidad: 3, precio: 1800 }], "Tarjeta", "Ana Martínez", "45678901"),
]
