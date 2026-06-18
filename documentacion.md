# 🎾 Padel Club App — Documentación del Proyecto

> Documento vivo: se actualiza en cada sesión de desarrollo.  
> Última actualización: 17 de junio de 2026

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

### ✅ Fase 0 — Setup (EN CURSO)
- [x] Crear repositorio en GitHub
- [x] Instalar Claude Code
- [ ] Inicializar proyecto Next.js
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Primer deploy en Vercel

### 🔲 Fase 1 — MVP de Reservas
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
**Objetivos:** Setup inicial del proyecto  
**Completado:**
- Definición del stack tecnológico
- Creación del repositorio en GitHub
- Instalación de Claude Code en Windows vía PowerShell
- Configuración de Claude Code en VS Code

**Pendiente para próxima sesión:**
- Inicializar proyecto Next.js (`npx create-next-app@latest`)
- Crear proyecto en Supabase
- Configurar variables de entorno
- Estructura base de carpetas y archivos

**Notas:**
- Error inicial: paquete npm incorrecto (`@anthropic/claude-code` → correcto: instalador nativo de Windows)
- Se optó por el instalador nativo de Anthropic para Windows (más estable y con auto-updates)

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
