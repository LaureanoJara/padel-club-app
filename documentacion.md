# 🎾 Padel Club App — Documentación del Proyecto

> Documento vivo: se actualiza en cada sesión de desarrollo.  
> Última actualización: 18 de junio de 2026 — Sesión 2 completada

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
│   ├── page.tsx                        # Página principal / bienvenida
│   ├── layout.tsx                      # Layout global con Navbar dinámico
│   ├── auth/
│   │   ├── login/page.tsx              # Inicio de sesión
│   │   └── register/page.tsx           # Registro de usuario
│   ├── reservas/
│   │   ├── page.tsx                    # Ver mis reservas + cancelar
│   │   └── nueva/page.tsx              # Crear nueva reserva
│   └── admin/
│       ├── layout.tsx                  # Protección de ruta (solo admins)
│       ├── page.tsx                    # Dashboard: resumen del día
│       ├── reservas/
│       │   ├── page.tsx                # Todas las reservas con filtros
│       │   └── manual/page.tsx         # Registrar reserva manual
│       ├── canchas/page.tsx            # Gestionar canchas
│       └── socios/page.tsx             # Gestionar socios y roles
├── components/
│   └── ModalConfirmacion.tsx           # Modal reutilizable de confirmación
├── lib/
│   ├── supabase.ts                     # Cliente Supabase (browser)
│   ├── supabase-server.ts              # Cliente Supabase (servidor/SSR)
│   ├── supabase-admin.ts               # Cliente Supabase (service role)
│   ├── auth.ts                         # Server Actions de autenticación
│   ├── reservas.ts                     # Funciones de reservas (socio)
│   └── admin.ts                        # Funciones del panel admin
├── types/
│   └── index.ts                        # Tipos TypeScript (Cancha, Reserva, Perfil)
├── proxy.ts                            # Refresca token Supabase en cada request
├── .env.local                          # Variables de entorno (NO subir a GitHub)
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
| usuario_id | uuid | FK → auth.users.id (nullable para reservas manuales) |
| fecha | date | Fecha de la reserva |
| hora_inicio | time | Hora de inicio |
| hora_fin | time | Hora de fin |
| estado | text | 'confirmada' / 'cancelada' / 'pendiente' |
| reserva_manual | boolean | true si fue registrada por el admin sin cuenta |
| nombre_visitante | text | Nombre identificador para reservas manuales |
| created_at | timestamp | Fecha de creación |

### Tabla: `perfiles`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | FK → auth.users.id |
| nombre | text | Nombre completo |
| telefono | text | Teléfono de contacto |
| rol | text | 'socio' / 'admin' |
| created_at | timestamp | Fecha de creación |

### Políticas RLS activas
| Tabla | Política | Descripción |
|---|---|---|
| canchas | Visibles para todos | SELECT sin restricción |
| reservas | Solo las propias | SELECT/INSERT/UPDATE por usuario_id |
| reservas | Admin puede todo | Operaciones con service role key |
| perfiles | Solo el propio | SELECT/INSERT por id |

---

## 🗺️ Roadmap por Fases

### ✅ Fase 0 — Setup (COMPLETADA)
- [x] Crear repositorio en GitHub
- [x] Instalar Claude Code (instalador nativo Windows vía PowerShell)
- [x] Inicializar proyecto Next.js con TypeScript y Tailwind
- [x] Crear proyecto en Supabase (región São Paulo)
- [x] Instalar dependencias: @supabase/supabase-js @supabase/ssr
- [x] Configurar variables de entorno (.env.local)
- [x] Crear clientes Supabase (browser, server, admin)
- [x] Crear tipos TypeScript en types/index.ts
- [x] Crear tablas en Supabase (canchas, reservas, perfiles)
- [x] Cargar datos de prueba (2 canchas)
- [x] Página de inicio funcionando en localhost:3000
- [x] Código subido a GitHub

### ✅ Fase 1 — MVP de Reservas (COMPLETADA)
- [x] Autenticación completa (registro, login, logout)
- [x] Navbar dinámico (muestra nombre si hay sesión)
- [x] Perfil creado automáticamente al registrarse
- [x] Ver canchas disponibles por fecha y horario
- [x] Crear una reserva (franjas de 1 hora, 07:00 a 23:00)
- [x] Horarios ocupados deshabilitados visualmente
- [x] Ver mis reservas
- [x] Cancelar una reserva con modal de confirmación

### ✅ Fase 2 — Panel de Administración (COMPLETADA)
- [x] Protección de rutas /admin (solo rol 'admin')
- [x] Dashboard con resumen del día
- [x] Ver todas las reservas con filtros por fecha y cancha
- [x] Cancelar cualquier reserva desde el panel
- [x] Eliminar reservas canceladas (individual o masivo)
- [x] Gestión de canchas (crear, activar/desactivar, eliminar)
- [x] Gestión de socios (ver todos, cambiar rol socio/admin)
- [x] Reservas manuales (sin cuenta, con nombre identificador)
- [x] Badge visual para distinguir reservas manuales
- [x] Nombre del socio visible en lista de reservas

### 🔲 Fase 3 — Mejoras UX
- [ ] Notificaciones por email (confirmación de reserva)
- [ ] Recordatorios automáticos
- [ ] Reservas recurrentes
- [ ] Sistema de pagos

### 🔲 Fase 4 — Funcionalidades Avanzadas
- [ ] Deploy en Vercel
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
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Estas claves se obtienen desde: Supabase → Settings → API

> ⚠️ La SERVICE_ROLE_KEY tiene permisos totales sobre la base de datos. 
> Nunca exponerla en el frontend ni subirla a GitHub.

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

## 🧪 Plan de Testing Manual

Antes de mostrar la app a un club, recorrer este checklist completo.

### Bloque 1 — Autenticación

| # | Acción | Resultado esperado |
|---|---|---|
| 1.1 | Ir a `/auth/register` y registrarse con email y contraseña | Redirige a inicio, Navbar muestra "Hola, [nombre]" |
| 1.2 | Cerrar sesión desde el Navbar | Redirige a inicio, Navbar muestra botones de login/registro |
| 1.3 | Ir a `/auth/login` e iniciar sesión | Redirige a inicio con sesión activa |
| 1.4 | Intentar ir a `/reservas` sin sesión | Redirige a `/auth/login` |
| 1.5 | Intentar ir a `/admin` sin sesión | Redirige a inicio |
| 1.6 | Intentar ir a `/admin` con un usuario socio | Redirige a inicio |
| 1.7 | Registrarse con un email ya existente | Muestra error inline, no rompe la app |
| 1.8 | Iniciar sesión con contraseña incorrecta | Muestra error inline |

### Bloque 2 — Reservas (como socio)

| # | Acción | Resultado esperado |
|---|---|---|
| 2.1 | Ir a `/reservas/nueva`, elegir fecha y cancha | Se muestran los horarios disponibles |
| 2.2 | Hacer una reserva en un horario libre | Redirige a `/reservas`, aparece la reserva en la lista |
| 2.3 | Volver a `/reservas/nueva` y elegir la misma fecha y cancha | El horario reservado aparece deshabilitado |
| 2.4 | Hacer otra reserva en el mismo horario desde otra cuenta | No debería poder (horario deshabilitado) |
| 2.5 | Cancelar una reserva → clic en "Cancelar" | Aparece modal de confirmación con detalles |
| 2.6 | Confirmar la cancelación en el modal | La reserva aparece como cancelada en la lista |
| 2.7 | Cerrar el modal sin confirmar | La reserva sigue confirmada, no cambia nada |
| 2.8 | Intentar reservar sin elegir cancha o fecha | No permite confirmar (campos requeridos) |

### Bloque 3 — Panel Admin

| # | Acción | Resultado esperado |
|---|---|---|
| 3.1 | Ir a `/admin` con usuario admin | Muestra dashboard con resumen del día |
| 3.2 | Ver lista de reservas en `/admin/reservas` | Muestra nombre del socio o nombre_visitante según corresponda |
| 3.3 | Filtrar reservas por fecha | Solo muestra reservas de esa fecha |
| 3.4 | Filtrar reservas por cancha | Solo muestra reservas de esa cancha |
| 3.5 | Cancelar una reserva desde el panel admin | La reserva cambia a estado cancelada |
| 3.6 | Eliminar una reserva cancelada individualmente | Desaparece de la lista |
| 3.7 | Eliminar todas las reservas canceladas | Desaparecen todas las canceladas |
| 3.8 | Crear una nueva cancha en `/admin/canchas` | Aparece en la lista y en el selector de reservas |
| 3.9 | Desactivar una cancha | No aparece disponible al hacer una reserva |
| 3.10 | En `/admin/socios` cambiar rol de socio a admin | El usuario pasa a tener acceso al panel admin |
| 3.11 | Intentar quitarse el rol admin a uno mismo | Debe mostrar error o estar deshabilitado |

### Bloque 4 — Reservas Manuales

| # | Acción | Resultado esperado |
|---|---|---|
| 4.1 | Ir a `/admin/reservas/manual` | Muestra formulario con nombre, cancha, fecha y horario |
| 4.2 | Registrar una reserva manual con nombre "Juan WhatsApp" | Aparece en la lista con badge "Manual" y el nombre |
| 4.3 | Verificar que el horario queda bloqueado | Al intentar reservar ese horario como socio, aparece deshabilitado |
| 4.4 | Intentar registrar reserva manual sin completar todos los campos | No permite confirmar |

### Bloque 5 — Casos borde

| # | Acción | Resultado esperado |
|---|---|---|
| 5.1 | Intentar reservar en una fecha pasada | El selector no permite fechas anteriores a hoy |
| 5.2 | Ver mis reservas sin haber hecho ninguna | Muestra mensaje amigable "No tenés reservas" |
| 5.3 | Desactivar todas las canchas e intentar reservar | No hay canchas disponibles para elegir |
| 5.4 | Hacer build de producción (`npm run build`) | Debe compilar sin errores |

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
- Proyecto Supabase creado (región São Paulo)
- Dependencias instaladas: `@supabase/supabase-js` y `@supabase/ssr`
- Clientes Supabase configurados (browser, server, admin)
- Tipos TypeScript creados en `types/index.ts`
- Navbar básico en `app/layout.tsx`
- Página de inicio con diseño azul, hero section y cards de features
- Tablas creadas en Supabase: `canchas`, `reservas`, `perfiles`
- 2 canchas de prueba cargadas en la base de datos
- Git configurado y código subido a GitHub

**Notas y decisiones:**
- Error inicial: paquete `@anthropic/claude-code` no existe → solución: instalador nativo de Windows (`irm https://claude.ai/install.ps1 | iex`)
- Se eligió Supabase sobre backend propio para arrancar rápido. Migración posible a futuro si un cliente lo exige
- URL de Supabase va SIN `/rest/v1/` al final en el `.env.local`
- El paste en terminal de VS Code se hace con clic derecho → Paste (no Ctrl+V)

---

### Sesión 2 — 18 de junio de 2026
**Objetivos:** Fase 1 completa (reservas) + Fase 2 completa (panel admin)

**Completado:**
- Autenticación completa: registro, login, logout con Supabase Auth
- Confirmación de email desactivada en desarrollo (Supabase → Auth → Settings)
- Service role key agregada al `.env.local` para operaciones admin
- Políticas RLS configuradas en todas las tablas
- Flujo completo de reservas: crear, ver y cancelar
- Modal de confirmación reutilizable (`ModalConfirmacion.tsx`)
- Panel admin completo con dashboard, reservas, canchas y socios
- Reservas manuales (sin cuenta, con nombre identificador)
- Nombre del socio visible en lista de reservas del admin
- Eliminación de reservas canceladas (individual y masiva)
- Gestión de roles desde el panel (socio ↔ admin)
- Commits subidos a GitHub

**Notas y decisiones:**
- `usuario_id` en tabla `reservas` cambió a nullable para soportar reservas manuales
- Se agregaron columnas `reserva_manual` (boolean) y `nombre_visitante` (text) a la tabla `reservas`
- El primer usuario admin se asigna manualmente desde Supabase → Authentication → Users (copiar UUID) y ejecutar `UPDATE perfiles SET rol = 'admin' WHERE id = 'uuid'`
- Confirmar email desactivado en Supabase durante desarrollo → reactivar antes de producción

**Pendiente para próxima sesión:**
- Deploy en Vercel
- Notificaciones por email al confirmar reserva
- Mejoras de UX y diseño

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
