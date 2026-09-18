# nuevo-sitio

Starter **Next.js 16 (App Router) + TypeScript + Prisma 7 + PostgreSQL + Better Auth**, pensado para deploy en **Vercel**.

## Stack

| Pieza | Versión | Nota |
|---|---|---|
| Next.js | 16.3.5 | App Router, Turbopack |
| React | 19.3 | |
| Prisma | 7.10.0 | cliente sin engine binario → usa driver adapter |
| @prisma/adapter-pg | 7.10.0 | conexión a Postgres vía `pg` |
| Better Auth | 1.7.5 | email+password y OAuth opcional |

## Puesta en marcha

```bash
cp .env.example .env        # completar DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET
npm install
npm run db:push             # crea las tablas (o: npm run db:migrate)
npm run dev
```

Generar el secreto de auth:

```bash
openssl rand -base64 32
```

## Deploy en Vercel

1. Push del repo a GitHub e importar el proyecto en vercel.com.
2. Variables de entorno en Vercel:
   - `DATABASE_URL` → conexión **con pooler** (puerto 6543 en Neon)
   - `DIRECT_URL` → conexión **directa** (puerto 5432), la usan las migraciones
   - `BETTER_AUTH_SECRET` → el mismo valor generado
   - `BETTER_AUTH_URL` → `https://tu-proyecto.vercel.app`
3. Build command: `prisma generate && next build` (ya está en `package.json`).

> En serverless la app **debe** usar la conexión con pooler; las migraciones la directa.
> Es la causa #1 de errores "too many connections" en Vercel.

## Estructura

```
app/
  api/auth/[...all]/route.ts   # handler de Better Auth (GET/POST)
  api/health/route.ts          # healthcheck: SELECT 1 contra la DB
  dashboard/page.tsx           # página protegida (redirige a /login)
  login/page.tsx               # formulario de ingreso / registro
lib/
  auth.ts                      # config de Better Auth + Prisma adapter
  auth-client.ts               # cliente React (useSession, signIn, ...)
  prisma.ts                    # singleton de PrismaClient + driver adapter
prisma/schema.prisma           # modelos (User, Session, Account, Verification)
prisma7.config.ts              # config de Prisma 7 (schema, migraciones, datasource)
generated/prisma/              # cliente generado (no se versiona)
```

## Diferencias importantes de Prisma 7

- El cliente **ya no lleva engine binario**: hay que pasar un driver adapter (`PrismaPg`) a `PrismaClient`.
- La conexión se configura en `prisma7.config.ts`, **no** en el `datasource` del schema.
- El generator es `prisma-client` y escribe a `generated/prisma` → se importa desde ahí, no de `@prisma/client`.
- `prisma db push` ya **no** acepta `--skip-generate`.
- El flag `--to-schema-datamodel` de `migrate diff` ahora es `--to-schema`.

## Pendiente

- Definir el dominio del sitio y los modelos reales de negocio.
- Configurar Tailwind (opcional) para el diseño.
- OAuth (Google/GitHub) si se quieren logins sociales: cargar `GOOGLE_CLIENT_ID`/`SECRET` o `GITHUB_CLIENT_ID`/`SECRET` y ya queda activo.
