# Plan de App Web: Gastos de Vacaciones Brasil (Tefi + Facu)

## 1) Objetivo
Construir una app web privada, moderna y simple para que **Tefi** y **Facu** puedan:
- Registrar gastos de viaje.
- Editar, modificar y eliminar gastos.
- Cargar gastos en **USD, BRL o ARS**.
- Ver cada gasto y totales convertidos a las 3 monedas.
- Usarla desde web con acceso restringido solo a ustedes dos.

---

## 2) Reglas de negocio iniciales
Tipo de cambio fijo (MVP):
- **1 BRL = 280 ARS**
- **1 BRL = 0.20 USD**

Derivados:
- 1 USD = 5 BRL
- 1 USD = 1400 ARS
- 1 ARS = 0.003571 BRL
- 1 ARS = 0.000714 USD

Decisión recomendada:
- Guardar siempre el monto original + moneda original.
- Calcular conversiones en backend/frontend de forma consistente usando una función central.
- Dejar preparado para futuro “tipo de cambio editable” (sin implementarlo en el MVP si no hace falta).

---

## 3) Funcionalidades (MVP)
### 3.1 Autenticación y acceso privado
- Login obligatorio.
- Solo dos usuarios habilitados: Tefi y Facu.
- Sesión persistente segura.
- Rutas protegidas (si no hay sesión, redirigir a login).

### 3.2 Gestión de gastos
- Crear gasto con:
  - título/descripción (ej: vuelo, hotel, comida)
  - categoría (opcional en MVP, recomendable)
  - fecha
  - monto
  - moneda original (USD/BRL/ARS)
  - quién cargó el gasto (Tefi/Facu)
  - quién cubrió el gasto:
    - Tefi
    - Facu
    - Compartido
- Editar gasto existente.
- Eliminar gasto (con confirmación).
- Listado cronológico (más reciente primero).

### 3.3 Visualización y tracking
- Cada gasto se muestra en:
  - moneda original
  - equivalente en USD
  - equivalente en BRL
  - equivalente en ARS
- Resumen superior con:
  - total general en USD
  - total general en BRL
  - total general en ARS
  - total aportado por Tefi
  - total aportado por Facu
  - total compartido
- Filtros básicos sugeridos:
  - por persona (Tefi/Facu)
  - por categoría
  - por rango de fechas

### 3.4 UX/UI
- Diseño limpio y moderno.
- Priorizar mobile-first.
- Feedback claro en acciones (crear/editar/eliminar).
- Formularios simples con validaciones visibles.

---

## 4) Propuesta de stack tecnológico
## Opción recomendada (balance velocidad + escalabilidad)
- **Frontend + Backend**: Next.js (App Router) con TypeScript
- **UI**: Tailwind CSS + componentes accesibles (ej. shadcn/ui)
- **Auth**: Clerk o Auth0 (rápido y seguro), restringiendo usuarios por email permitido
- **Base de datos**: PostgreSQL gestionada (Neon o Supabase)
- **ORM**: Prisma
- **Deploy**: Vercel

Por qué esta opción:
- Flujo fullstack en un solo proyecto.
- Excelente integración con Vercel.
- Escalable si luego agregan reportes, exportaciones o presupuestos.

## Opción alternativa (más simple aún para arrancar)
- Next.js + Supabase (Auth + DB)
- Ventaja: menos piezas a configurar.
- Desventaja: un poco menos flexible que Prisma + DB separada según evolución.

---

## 5) Arquitectura funcional propuesta
- `Login` (pública)
- `Dashboard de gastos` (protegida)
  - Lista de gastos
  - Totales convertidos
  - Filtros
- `Alta/edición de gasto` (modal o página)
- API interna para CRUD de gastos
- Middleware/protección de rutas por sesión

### Entidades principales
- **User**
  - id
  - name (Tefi/Facu)
  - email
  - createdAt
- **Expense**
  - id
  - title
  - category
  - date
  - amount
  - currency (USD | BRL | ARS)
  - createdByUserId
  - paidBy (TEFI | FACU | SHARED)
  - createdAt
  - updatedAt

---

## 6) Seguridad (clave por ser app privada)
- Autenticación robusta (no “password hardcodeada”).
- Lista blanca de emails permitidos (solo 2).
- Variables sensibles en entorno seguro (`.env` + Vercel Environment Variables).
- Validación de inputs en backend.
- Autorización en cada operación CRUD.

---

## 7) Roadmap de implementación sugerido
### Fase 1 - Setup base
- Inicializar proyecto Next.js + TypeScript.
- Configurar UI base y layout.
- Configurar Auth y restricción por emails.
- Configurar DB y esquema inicial.

### Fase 2 - CRUD de gastos
- Crear endpoints/acciones para alta/listado.
- Implementar edición y eliminación.
- Validaciones de formularios.

### Fase 3 - Conversión y dashboard
- Función única de conversión de monedas.
- Mostrar montos convertidos por gasto.
- Totales globales en 3 monedas.
- Filtros básicos.

### Fase 4 - Calidad y despliegue
- Manejo de errores/estados vacíos/loading.
- Tests básicos (unit + integración ligera).
- Deploy a Vercel.
- Configurar dominios y variables de entorno.

---

## 8) Criterios de aceptación del MVP
- Solo Tefi y Facu pueden ingresar.
- Se pueden crear, editar y eliminar gastos.
- Cada gasto se visualiza en USD/BRL/ARS con las tasas definidas.
- El dashboard muestra totales correctos en las 3 monedas.
- Se puede registrar si un gasto lo cubrió Tefi, Facu o ambos.
- Se puede visualizar cuánto va aportando cada uno en particular.
- App deployada y accesible desde Vercel.

---

## 9) Riesgos y decisiones tempranas
- **Tipo de cambio fijo vs dinámico**: para MVP fijo está bien; luego se puede parametrizar.
- **Control de redondeo**: definir regla consistente (ej: 2 decimales para USD/BRL, 0-2 para ARS).
- **Privacidad**: evitar compartir link público sin login.

---

## 10) Siguiente paso recomendado
Cuando quieras, avanzamos con:
1. Inicialización del proyecto con la opción de stack elegida.
2. Configuración de auth privada para ustedes dos.
3. Primer CRUD funcional de gastos con conversiones.
