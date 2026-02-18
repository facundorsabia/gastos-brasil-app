# Gastos Brasil App

Aplicación web privada para registrar y seguir gastos de viaje en **USD, BRL y ARS**, con conversiones automáticas y resumen por persona.

## Resumen
- Proyecto creado e iterado con apoyo de **Codex**.
- Permite login privado, CRUD de gastos, filtros y totales convertidos en las tres monedas.
- Enfocado en uso personal ligero para llevar control compartido de gastos del viaje.

## Tecnologías
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- API Routes de Next.js
- Persistencia local en JSON (`data/expenses.json`)
- Autenticación simple con `username + password hash` vía variables de entorno

## Propósito
Centralizar en una sola app el registro y seguimiento de gastos del viaje de forma simple, privada y usable desde desktop y mobile.

## Documentación de arquitectura
- Decisiones de arquitectura: `docs/architecture-decisions/README.md`
- Plan original de ejecución: `docs/architecture-decisions/ADR-0001-plan-inicial.md`

## Desarrollo local
```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.
