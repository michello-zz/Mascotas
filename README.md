# nuevo-sitio

Next.js (App Router) + TypeScript + Prisma + PostgreSQL, pensado para deploy en Vercel.

## Local

```bash
cp .env.example .env      # completar credenciales de la base
npm install
npm run db:push           # o: npm run db:migrate
npm run dev
```

## Deploy en Vercel

1. Subir el repo a GitHub (o `vercel` CLI).
2. Importar el proyecto en vercel.com.
3. Variables de entorno en Vercel: `DATABASE_URL` y `DIRECT_URL`.
4. Build command: `prisma generate && next build` (ya está en `package.json`).

## Notas

- En serverless usar siempre la conexión **pooled** (`DATABASE_URL`) para la app y la **directa** (`DIRECT_URL`) para migraciones.
- `lib/prisma.ts` mantiene un singleton para no agotar el pool con el hot reload.
