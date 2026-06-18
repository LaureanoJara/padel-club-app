cla# 🎾 Padel Club App — Documentación del Proyecto

> Documento vivo: se actualiza en cada sesión de desarrollo.  
> Última actualización: 17 de junio de 2026 — Sesión 1 completada

---

## 📌 Descripción del Proyecto

Aplicación web para la gestión de reservas de canchas de pádel. Los usuarios podrán registrarse, ver la disponibilidad de canchas y realizar reservas desde el club o de forma remota.

---

## 👥 Equipo

| Rol | Nombre |
|---|---|
| Product Owner | Club de Pádel |
| Desarrollador | En construcción |
| Asistente IA | Claude (Anthropic) |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Motivo |
|---|---|---|---|
| Frontend | Next.js | 14 | App Router, SSR, SEO |
| Estilos | Tailwind CSS | 3 | Desarrollo rápido y consistente |
| Lenguaje | TypeScript | 5 | Tipado estático, menos bugs |
| Backend / DB | Supabase | — | PostgreSQL + Auth + API gratis |
| Autenticación | Supabase Auth | — | Email/contraseña (social después) |
| Deploy | Vercel | — | CI/CD automático con GitHub |
| Control de versiones | GitHub | — | Repositorio del proyecto |
| Editor | VS Code | — | Con extensión Claude Code |
| Asistente IA | Claude Code | — | Desarrollo asistido por IA |

---

## 📁 Estructura del Proyecto

```
padel-club-app/
├── app/
│   ├── page.tsx                  # Página principal / canchas disponibles
│   ├── layout.tsx                # Layout global
│   ├── auth/
│   │   ├── login/page.tsx        # Inicio de sesión
│   │   └── register/page.tsx     # Registro de usuario
│   ├── reservas/
│   │   ├── page.tsx              # Ver mis reservas
│   │   └── nueva/page.tsx        # Crear nueva reserva
│   └── admin/                    # Panel de administración (Fase 2)
├── components/
│   ├── ui/                       # Componentes base (botones, inputs, etc.)
│   ├── CanchaCard.tsx            # Tarjeta de cancha disponible
│   ├── CalendarioReservas.tsx    # Selector de fecha y hora
│   └── Navbar.tsx                # Navegación principal
├── lib/
│   └── supabase.ts               # Cliente de Supabase
├── types/
│   └── index.ts                  # Tipos TypeScript del proyecto
├── .env.local                    # Variables de entorno (NO subir a GitHub)
└── README.md
```

---

## 🗄️ Base de Datos — Esquema (Supabase / PostgreSQL)

### Tabla: `canchas`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | Clave primaria |
| nombre | text | Ej: "Cancha 1", "Cancha 2" |
| descripcion | text | Descripción opcional |
| activa | boolean | Si está habilitada para reservar |
| created_at | timestamp | Fecha de creación |

### Tabla: `reservas`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | Clave primaria |
| cancha_id | uuid | FK → canchas.id |
| usuario_id | uuid | FK → auth.users.id |
| fecha | date | Fecha de la reserva |
| hora_inicio | time | Hora de inicio |
| hora_fin | time | Hora de fin |
| estado | text | 'confirmada' / 'cancelada' / 'pendiente' |
| created_at | timestamp | Fecha de creación |

### Tabla: `perfiles`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | FK → auth.users.id |
| nombre | text | Nombre completo |
| telefono | text | Teléfono de contacto |
| rol | text | 'socio' / 'admin' |
| created_at | timestamp | Fecha de creación |

---

## 🗺️ Roadmap por Fases

### ✅ Fase 0 — Setup (COMPLETADA)
- [x] Crear repositorio en GitHub
- [x] Instalar Claude Code (instalador nativo Windows vía PowerShell)
- [x] Inicializar proyecto Next.js con TypeScript y Tailwind
- [x] Crear proyecto en Supabase (región São Paulo)
- [x] Instalar dependencias: @supabase/supabase-js @supabase/ssr
- [x] Configurar variables de entorno (.env.local)
- [x] Crear cliente Supabase en lib/supabase.ts
- [x] Crear tipos TypeScript en types/index.ts
- [x] Crear tablas en Supabase (canchas, reservas, perfiles)
- [x] Cargar datos de prueba (2 canchas)
- [x] Página de inicio funcionando en localhost:3000
- [x] Código subido a GitHub
- [ ] Primer deploy en Vercel

### 🔄 Fase 1 — MVP de Reservas (PRÓXIMA)
- [ ] Autenticación (registro e inicio de sesión)
- [ ] Ver canchas disponibles por fecha y hora
- [ ] Crear una reserva
- [ ] Ver mis reservas
- [ ] Cancelar una reserva

### 🔲 Fase 2 — Panel de Administración
- [ ] Panel admin para gestionar canchas
- [ ] Ver todas las reservas del día
- [ ] Bloquear horarios / días
- [ ] Gestión de socios

### 🔲 Fase 3 — Mejoras UX
- [ ] Notificaciones por email (confirmación de reserva)
- [ ] Recordatorios automáticos
- [ ] Reservas recurrentes
- [ ] Sistema de pagos

### 🔲 Fase 4 — Funcionalidades Avanzadas
- [ ] App móvil (React Native / PWA)
- [ ] Ranking de jugadores
- [ ] Torneos y eventos
- [ ] Búsqueda de compañeros de juego

---

## ⚙️ Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto (NUNCA subir a GitHub):

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Estas claves se obtienen desde: Supabase → Settings → API

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar Claude Code en el proyecto
claude

# Subir cambios a GitHub
git add .
git commit -m "descripción del cambio"
git push origin main
```

---

## 📋 Registro de Sesiones de Desarrollo

### Sesión 1 — 17 de junio de 2026
**Objetivos:** Setup completo del proyecto (Fase 0)

**Completado:**
- Definición del stack tecnológico completo
- Creación del repositorio en GitHub
- Instalación de Claude Code en Windows vía PowerShell (instalador nativo)
- Configuración de Claude Code en VS Code
- Proyecto Next.js 14 inicializado con TypeScript y Tailwind CSS
- Proyecto Supabase creado (región São Paulo, más cercana a Argentina)
- Dependencias instaladas: `@supabase/supabase-js` y `@supabase/ssr`
- Cliente Supabase configurado en `lib/supabase.ts`
- Tipos TypeScript creados en `types/index.ts` (Cancha, Reserva, Perfil)
- Navbar básico en `app/layout.tsx`
- Página de inicio con diseño azul, hero section y cards de features
- Tablas creadas en Supabase via SQL Editor: `canchas`, `reservas`, `perfiles`
- 2 canchas de prueba cargadas en la base de datos
- Git configurado y código subido a GitHub

**Pendiente para próxima sesión:**
- Deploy en Vercel (opcional, puede hacerse después)
- Autenticación: registro e inicio de sesión de usuarios
- Página de canchas disponibles con selector de fecha/hora
- Flujo completo de reserva

**Notas y decisiones tomadas:**
- Error inicial de instalación: paquete `@anthropic/claude-code` no existe → solución: instalador nativo de Windows (`irm https://claude.ai/install.ps1 | iex`)
- Se eligió Supabase sobre backend propio para arrancar rápido. Si un cliente exige servidores propios en el futuro, se puede migrar a Supabase self-hosted o PostgreSQL propio sin cambiar el frontend
- URL de Supabase va SIN `/rest/v1/` al final en el `.env.local`
- El paste en terminal de VS Code se hace con clic derecho → Paste (no Ctrl+V)

---

## 🔗 Links Importantes

| Recurso | URL |
|---|---|
| Repositorio GitHub | https://github.com/TU_USUARIO/padel-club-app |
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Next.js Docs | https://nextjs.org/docs |
| Supabase Docs | https://supabase.com/docs |
| Claude Code Docs | https://docs.anthropic.com/claude-code |

---

*Documento generado y mantenido con asistencia de Claude (Anthropic)*
