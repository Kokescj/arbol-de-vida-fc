# Árbol de Vida FC — Frontend

PWA en Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui.
Cliente del backend `simonfc-api` para inscripción a partidos de fútbol.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Tailwind CSS v4** (`@tailwindcss/vite`) + **shadcn/ui** (style new-york)
- **react-router-dom v7** — routing SPA con guards por rol
- **TanStack Query 5** — caching y refetch
- **axios** — cliente HTTP con interceptor de refresh JWT automático
- **vite-plugin-pwa** — PWA instalable con service worker auto-update
- **lucide-react** — iconos

## Setup local

```bash
pnpm install
cp .env.example .env       # ajustar VITE_API_URL si tu backend no está en localhost:3000
pnpm dev                   # http://localhost:5173
```

## Scripts

| Script         | Qué hace                                       |
| -------------- | ---------------------------------------------- |
| `pnpm dev`     | Dev server con HMR                             |
| `pnpm build`   | Type-check + build de producción a `dist/`     |
| `pnpm preview` | Sirve `dist/` localmente para probar el build  |
| `pnpm lint`    | ESLint                                         |

## Estructura

```
src/
├── components/
│   ├── auth/          # RequireAuth, RedirectByRole
│   └── ui/            # Componentes shadcn (Button, Input, Card, Label)
├── hooks/
│   └── use-auth.ts    # useLogin, useLogout, useCurrentUser
├── lib/
│   ├── api.ts         # axios + interceptor refresh
│   ├── auth-store.ts  # tokens en localStorage + pub/sub
│   └── utils.ts       # cn() de shadcn
├── routes/
│   ├── login.tsx
│   ├── admin-dashboard.tsx
│   └── partido-activo.tsx
├── types/
│   └── auth.ts
├── App.tsx            # router
├── main.tsx           # providers (QueryClient)
└── index.css          # Tailwind + design tokens
```

## Auth flow

1. `/` → `RedirectByRole` → si no hay sesión va a `/login`.
2. Login OK → guarda `token`, `refreshToken`, `user` en `localStorage` y redirige según rol:
   - `admin` o `supervisor` → `/admin`
   - `usuario` → `/partido-activo`
3. Si el access token expira (401), el interceptor de axios llama `/auth/refresh` automáticamente, persiste el nuevo par y reintenta la request original.
4. Si el refresh falla, limpia sesión y redirige a `/login`.

## PWA

Configurada en `vite.config.ts` con `vite-plugin-pwa` (`registerType: 'autoUpdate'`).
El build genera `sw.js`, `manifest.webmanifest` y precachea los assets con hash.

**Pendiente**: subir los iconos PNG reales al directorio `public/`:
`pwa-192x192.png`, `pwa-512x512.png`, `pwa-512x512-maskable.png`, `apple-touch-icon.png`.
Mientras tanto, el favicon SVG funciona pero los browsers usarán fallback al instalar.

## Deploy a Netlify

El proyecto incluye `netlify.toml` con todo configurado (SPA redirect, cache headers para SW/assets, headers de seguridad).

### Antes de desplegar
1. Tu **backend** (`simonfc-api`) debe estar publicado en algún lado (Railway, Render, Fly.io, etc.).
2. Necesitas saber su URL pública — la usarás como `VITE_API_URL`.
3. Agregar el dominio Netlify (`https://<tu-sitio>.netlify.app`) a la variable `CORS_ALLOWED_ORIGINS` del backend.

### Variable de entorno requerida

| Variable        | Valor                                  |
| --------------- | -------------------------------------- |
| `VITE_API_URL`  | `https://<tu-backend>/api`             |

### Opción A — Drag & drop (más rápido, ideal para probar)

```bash
pnpm build
```
Luego abre <https://app.netlify.com/drop> y arrastra la carpeta `dist/`. Netlify te da una URL inmediatamente.

Después de subir:
- Site settings → Build & deploy → Environment → Environment variables → agregar `VITE_API_URL`
- Deploys → Trigger deploy → Deploy site (para que el build use la variable)

### Opción B — Netlify CLI (recomendado para iterar)

```bash
npm i -g netlify-cli
netlify login
cd /Users/koke/Documents/Arbol-de-vida/arbol-de-vida-fc
netlify init                              # crea el sitio (o lo conecta a uno existente)
netlify env:set VITE_API_URL https://tu-backend.com/api
netlify deploy --build --prod             # build + deploy a producción
```

Para previews:
```bash
netlify deploy --build                    # crea una URL temporal de preview
```

### Opción C — GitHub (recomendado para producción)

1. Sube el repo a GitHub (`git init && git remote add origin … && git push`).
2. En [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → conecta GitHub y selecciona el repo.
3. Netlify autodetecta `netlify.toml` — build command y publish directory ya están definidos.
4. En **Site configuration → Environment variables** agrega `VITE_API_URL`.
5. Cada push a `main` redeploya automáticamente. Cada PR genera un deploy preview con URL propia.

### Verificación post-deploy

Abre tu URL `*.netlify.app` y revisa:
- ✅ `/login` carga (no 404 al refrescar con F5)
- ✅ DevTools → Application → Manifest → muestra "Árbol de Vida FC"
- ✅ DevTools → Application → Service Workers → `sw.js` activo
- ✅ DevTools → Network → `sw.js` con `Cache-Control: max-age=0`
- ✅ DevTools → Network → `assets/*-<hash>.js` con `max-age=31536000`
- ✅ Login real contra tu backend funciona (si falla con CORS, revisa `CORS_ALLOWED_ORIGINS`)
