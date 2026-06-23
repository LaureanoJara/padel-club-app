# 🎾 Padel Club App — Documentación del Proyecto

> Documento vivo: se actualiza en cada sesión de desarrollo.  
> Última actualización: 23 de junio de 2026 — Sesión 3 completada

---

## 📌 Descripción del Proyecto

Aplicación web para la gestión de reservas de canchas de pádel. Los usuarios podrán registrarse, ver la disponibilidad de canchas y realizar reservas desde el club o de forma remota. Incluye red social entre socios, sistema de notificaciones y panel de administración completo.

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
| Email | Resend | — | Notificaciones por email, plan gratuito |
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
│   │   └── nueva/page.tsx              # Crear nueva reserva + equipamiento
│   ├── notificaciones/
│   │   └── page.tsx                    # Centro de notificaciones del usuario
│   ├── perfil/
│   │   └── page.tsx                    # Perfil propio (ver y editar)
│   ├── socios/
│   │   ├── page.tsx                    # Lista de todos los socios
│   │   └── [id]/page.tsx               # Perfil público de un socio
│   └── admin/
│       ├── layout.tsx                  # Protección de ruta (solo admins)
│       ├── page.tsx                    # Dashboard: resumen del día
│       ├── reservas/
│       │   ├── page.tsx                # Todas las reservas con filtros + historial
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
│   ├── admin.ts                        # Funciones del panel admin
│   ├── notificaciones.ts               # Funciones de notificaciones
│   ├── socios.ts                       # Funciones de red social y amistades
│   ├── perfil.ts                       # Funciones de perfil y pareja favorita
│   └── email.ts                        # Envío de emails con Resend
├── types/
│   └── index.ts                        # Tipos TypeScript del proyecto
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
| color | text | 'azul' / 'violeta' / 'roja' |
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
| estado | text | 'pendiente' / 'confirmada' / 'cancelada' / 'vencida' |
| reserva_manual | boolean | true si fue registrada por el admin sin cuenta |
| nombre_visitante | text | Nombre identificador para reservas manuales |
| created_at | timestamp | Fecha de creación |

### Tabla: `equipamiento_solicitudes`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | Clave primaria |
| reserva_id | uuid | FK → reservas.id (on delete cascade) |
| tipo | text | 'equipamiento' / 'buffet' |
| item | text | 'pala' / 'pelotas' / etc. |
| cantidad | integer | Cantidad solicitada |
| nota | text | Aclaraciones opcionales |
| created_at | timestamp | Fecha de creación |

### Tabla: `perfiles`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | FK → auth.users.id |
| nombre | text | Nombre completo |
| telefono | text | Teléfono de contacto |
| rol | text | 'socio' / 'admin' |
| apodo | text | Apodo opcional |
| edad | integer | Edad opcional |
| altura | numeric | Altura en metros (ej: 1.75) |
| posicion | text | 'drive' / 'reves' / 'ambas' |
| pala | text | Descripción de la pala (texto libre) |
| categoria | text | '1era' a '8va' |
| avatar_url | text | URL de foto de perfil en Supabase Storage |
| pareja_id | uuid | FK → auth.users.id (pareja favorita) |
| pareja_estado | text | 'pendiente' / 'aceptada' |
| created_at | timestamp | Fecha de creación |

### Tabla: `notificaciones`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | Clave primaria |
| usuario_id | uuid | FK → auth.users.id (receptor) |
| remitente_id | uuid | FK → auth.users.id (quien genera la notificación) |
| tipo | text | Ver tipos abajo |
| titulo | text | Título de la notificación |
| mensaje | text | Cuerpo del mensaje |
| reserva_id | uuid | FK → reservas.id (opcional) |
| alternativa_cancha_id | uuid | FK → canchas.id (para propuestas) |
| alternativa_hora_inicio | time | Horario alternativo propuesto |
| alternativa_hora_fin | time | Horario alternativo propuesto |
| estado | text | 'pendiente' / 'aceptada' / 'rechazada' |
| leida | boolean | Si fue leída |
| created_at | timestamp | Fecha de creación |

**Tipos de notificación:**
- `confirmada` — Admin confirmó la reserva
- `rechazada` — Admin rechazó la reserva
- `propuesta_alternativa` — Admin propone otro horario/cancha
- `solicitud_amistad` — Otro usuario envió solicitud de amistad
- `amistad_aceptada` — Aceptaron tu solicitud de amistad
- `amistad_rechazada` — Rechazaron tu solicitud de amistad
- `solicitud_pareja` — Otro usuario te eligió como pareja favorita
- `pareja_aceptada` — Aceptaron ser tu pareja favorita
- `pareja_rechazada` — Rechazaron tu solicitud de pareja
- `pareja_eliminada` — Tu pareja favorita te eliminó

### Tabla: `amistades`
| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | Clave primaria |
| solicitante_id | uuid | FK → auth.users.id |
| receptor_id | uuid | FK → auth.users.id |
| estado | text | 'pendiente' / 'aceptada' / 'rechazada' |
| created_at | timestamp | Fecha de creación |

### Políticas RLS activas
| Tabla | Política | Descripción |
|---|---|---|
| canchas | Visibles para todos | SELECT sin restricción |
| reservas | Solo las propias | SELECT/INSERT/UPDATE por usuario_id |
| reservas | Admin puede todo | Operaciones con service role key |
| perfiles | Solo el propio (escritura) | INSERT/UPDATE por id |
| perfiles | Todos pueden ver (lectura) | SELECT para usuarios autenticados |
| notificaciones | Solo las propias | SELECT/UPDATE por usuario_id |
| amistades | Solo las propias | SELECT/INSERT/UPDATE por solicitante o receptor |
| equipamiento_solicitudes | Solo las propias | SELECT/INSERT por reserva propia |

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

### ✅ Fase 3 — Mejoras y Funcionalidades Sociales (COMPLETADA)
- [x] Equipamiento en reservas (palas y pelotas con cantidad)
- [x] Colores de canchas (azul, violeta, roja) con badge visual
- [x] Confirmación de reservas por admin (estado pendiente → confirmada)
- [x] Admin puede rechazar reservas o proponer alternativa de horario/cancha
- [x] Sistema de notificaciones en la app (campana con contador)
- [x] Notificaciones por email con Resend
- [x] Archivado automático de reservas vencidas (pg_cron a medianoche)
- [x] Historial de reservas en panel admin (toggle ver/ocultar vencidas)
- [x] Validación de fechas y horarios pasados (frontend + backend + DB)
- [x] Perfil editable (apodo, edad, altura, posición de juego, pala, categoría)
- [x] Foto de perfil con Supabase Storage
- [x] Vista pública de socios (/socios)
- [x] Perfil público de cada socio (/socios/[id])
- [x] Sistema de amistades (enviar, aceptar, rechazar, eliminar)
- [x] Notificaciones de amistad (solicitud, aceptación, rechazo)
- [x] Pareja favorita (solicitud, aceptación, rechazo, eliminación mutua)
- [x] Notificaciones de pareja favorita completas
- [x] Nombres clickeables en notificaciones → perfil del socio
- [x] Categoría de jugador (1era a 8va) en perfil

### 🔲 Fase 4 — Funcionalidades Avanzadas
- [ ] Deploy en Vercel
- [ ] Estadísticas en panel admin (canchas más usadas, horarios pico)
- [ ] Reservas recurrentes
- [ ] Sistema de pagos
- [ ] Imagen de cancha según color (SVG/ilustración)
- [ ] Foto de la pala en el perfil
- [ ] Módulo de buffet (bebidas, comidas) en reservas
- [ ] Lista de palas conocidas para elegir en perfil
- [ ] Contenido exclusivo para amigos en perfil
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
RESEND_API_KEY=tu_resend_api_key
```

Estas claves se obtienen desde:
- Supabase → Settings → API
- Resend → API Keys

> ⚠️ La SERVICE_ROLE_KEY tiene permisos totales sobre la base de datos.
> Nunca exponerla en el frontend ni subirla a GitHub.

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor de desarrollo (usar --webpack en Windows)
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

> ⚠️ En Windows: cambiar el script `dev` en `package.json` a `next dev --webpack`
> para evitar el error de binarios nativos bloqueados por Windows.

---

## 🧪 Plan de Testing Manual

Antes de mostrar la app a un club, recorrer este checklist completo.
Tildar cada ítem a medida que se va probando.

### Bloque 1 — Autenticación

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 1.1 | [ ] | Ir a `/auth/register` y registrarse | Redirige a inicio, Navbar muestra "Hola, [nombre]" |
| 1.2 | [ ] | Cerrar sesión desde el Navbar | Redirige a inicio, muestra botones login/registro |
| 1.3 | [ ] | Ir a `/auth/login` e iniciar sesión | Redirige a inicio con sesión activa |
| 1.4 | [ ] | Intentar ir a `/reservas` sin sesión | Redirige a `/auth/login` |
| 1.5 | [ ] | Intentar ir a `/admin` sin sesión | Redirige a inicio |
| 1.6 | [ ] | Intentar ir a `/admin` con usuario socio | Redirige a inicio |
| 1.7 | [ ] | Registrarse con email ya existente | Muestra error inline, no rompe la app |
| 1.8 | [ ] | Iniciar sesión con contraseña incorrecta | Muestra error inline |

### Bloque 2 — Reservas (como socio)

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 2.1 | [ ] | Ir a `/reservas/nueva`, elegir fecha y cancha | Se muestran los horarios disponibles |
| 2.2 | [ ] | Hacer una reserva en un horario libre | Aparece con estado "Pendiente" en `/reservas` |
| 2.3 | [ ] | Volver a `/reservas/nueva`, misma fecha y cancha | El horario aparece deshabilitado |
| 2.4 | [ ] | Intentar reservar mismo horario desde otra cuenta | No puede (horario deshabilitado) |
| 2.5 | [ ] | Cancelar una reserva → clic en "Cancelar" | Aparece modal de confirmación con detalles |
| 2.6 | [ ] | Confirmar la cancelación en el modal | La reserva aparece como cancelada |
| 2.7 | [ ] | Cerrar el modal sin confirmar | La reserva sigue confirmada |
| 2.8 | [ ] | Intentar reservar sin elegir cancha o fecha | No permite confirmar |
| 2.9 | [ ] | Escribir manualmente una fecha pasada | Muestra error, no permite continuar |
| 2.10 | [ ] | Intentar reservar un horario pasado de hoy | El horario aparece deshabilitado |
| 2.11 | [ ] | Seleccionar equipamiento (palas x2, pelotas x1) | Se guarda con la reserva y aparece en mis reservas |
| 2.12 | [ ] | Confirmar reserva sin seleccionar equipamiento | La reserva se crea igual sin equipamiento |

### Bloque 3 — Confirmación de reservas (admin)

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 3.1 | [ ] | Socio hace reserva → ir a `/admin/reservas` | La reserva aparece destacada en amarillo como "Pendiente" |
| 3.2 | [ ] | Admin confirma la reserva | Socio recibe notificación y email de confirmación |
| 3.3 | [ ] | Admin rechaza la reserva con motivo | Socio recibe notificación y email con el motivo |
| 3.4 | [ ] | Admin propone alternativa (otra cancha u horario) | Socio recibe notificación con detalles de la alternativa |
| 3.5 | [ ] | Socio acepta la alternativa desde `/notificaciones` | Se crea nueva reserva con los datos alternativos |
| 3.6 | [ ] | Socio rechaza la alternativa | La reserva original se cancela |
| 3.7 | [ ] | Verificar badge contador de pendientes en Navbar admin | Muestra el número de reservas pendientes |

### Bloque 4 — Panel Admin

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 4.1 | [ ] | Ir a `/admin` con usuario admin | Muestra dashboard con resumen del día |
| 4.2 | [ ] | Ver lista de reservas en `/admin/reservas` | Muestra solo reservas futuras por defecto |
| 4.3 | [ ] | Activar toggle "Ver historial" | Muestra también reservas vencidas en gris |
| 4.4 | [ ] | Filtrar reservas por fecha | Solo muestra reservas de esa fecha |
| 4.5 | [ ] | Filtrar reservas por cancha | Solo muestra reservas de esa cancha |
| 4.6 | [ ] | Ver equipamiento solicitado en una reserva | Muestra palas y pelotas con cantidad |
| 4.7 | [ ] | Eliminar una reserva cancelada individualmente | Desaparece de la lista |
| 4.8 | [ ] | Eliminar todas las reservas canceladas | Desaparecen todas las canceladas |
| 4.9 | [ ] | Crear nueva cancha con color "roja" | Aparece con badge rojo en la lista y en reservas |
| 4.10 | [ ] | Desactivar una cancha | No aparece en el selector al hacer reserva |
| 4.11 | [ ] | Cambiar rol de socio a admin | El usuario pasa a tener acceso al panel admin |
| 4.12 | [ ] | Intentar quitarse el rol admin a uno mismo | Muestra error o está deshabilitado |

### Bloque 5 — Reservas Manuales

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 5.1 | [ ] | Ir a `/admin/reservas/manual` | Muestra formulario con nombre, cancha, fecha y horario |
| 5.2 | [ ] | Registrar reserva manual con nombre "Juan WhatsApp" | Aparece con badge "Manual" y el nombre |
| 5.3 | [ ] | Verificar que el horario queda bloqueado | Horario deshabilitado al intentar reservar como socio |
| 5.4 | [ ] | Intentar registrar reserva manual sin completar campos | No permite confirmar |

### Bloque 6 — Perfil de usuario

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 6.1 | [ ] | Ir a `/perfil` | Muestra nombre y mensaje para completar perfil |
| 6.2 | [ ] | Hacer clic en "Editar perfil" | Aparece formulario con todos los campos |
| 6.3 | [ ] | Completar apodo, edad, altura, posición y pala | Se guardan y aparecen en modo vista |
| 6.4 | [ ] | Seleccionar categoría "3era" | Aparece 🏆 Categoría: 3era en el perfil |
| 6.5 | [ ] | Subir foto de perfil | Aparece en el avatar del perfil y en el Navbar |
| 6.6 | [ ] | Cancelar la edición | Vuelve al modo vista sin cambios |

### Bloque 7 — Socios y red social

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 7.1 | [ ] | Ir a `/socios` | Lista de todos los usuarios con nombre y avatar |
| 7.2 | [ ] | Buscar un socio por nombre | Filtra la lista correctamente |
| 7.3 | [ ] | Hacer clic en un socio | Lleva a `/socios/[id]` con su perfil completo |
| 7.4 | [ ] | Enviar solicitud de amistad | El receptor recibe notificación con botones Aceptar/Rechazar |
| 7.5 | [ ] | Receptor acepta la amistad desde notificaciones | Ambos aparecen como amigos en sus perfiles |
| 7.6 | [ ] | Receptor acepta la amistad desde el perfil | La notificación se actualiza correctamente |
| 7.7 | [ ] | Receptor rechaza la amistad | Solicitante recibe notificación de rechazo |
| 7.8 | [ ] | Eliminar amistad | Desaparece de ambos perfiles y se limpian las notificaciones |
| 7.9 | [ ] | Reenviar solicitud tras eliminar amistad | Solo aparece una notificación (sin duplicados) |
| 7.10 | [ ] | Ver propio nombre como pareja en perfil ajeno | Lleva a `/perfil` y no a `/socios/[mi-id]` |

### Bloque 8 — Pareja favorita

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 8.1 | [ ] | Editar perfil → sección pareja favorita | Muestra selector con lista de amigos |
| 8.2 | [ ] | Enviar solicitud de pareja a un amigo | El receptor recibe notificación con Aceptar/Rechazar |
| 8.3 | [ ] | Receptor acepta la solicitud | Ambos perfiles muestran al otro como pareja favorita |
| 8.4 | [ ] | Receptor rechaza la solicitud | Solicitante recibe notificación de rechazo |
| 8.5 | [ ] | Eliminar pareja favorita | Se elimina de ambos perfiles y llega notificación al otro |
| 8.6 | [ ] | Usuario con pareja recibe nueva solicitud y acepta | La pareja anterior es eliminada automáticamente y recibe notificación |
| 8.7 | [ ] | Cancelar solicitud de pareja pendiente | La notificación del receptor se elimina |

### Bloque 9 — Notificaciones

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 9.1 | [ ] | Recibir notificación nueva | El ícono 🔔 en el Navbar muestra un contador |
| 9.2 | [ ] | Entrar a `/notificaciones` | El contador desaparece (marcadas como leídas) |
| 9.3 | [ ] | Nombres en notificaciones son clickeables | Lleva al perfil del socio correspondiente |
| 9.4 | [ ] | Notificación de propuesta alternativa | Muestra botones Aceptar y Rechazar |
| 9.5 | [ ] | Aceptar/rechazar propuesta alternativa | Los botones desaparecen y muestra el estado |

### Bloque 10 — Casos borde

| # | ✅ | Acción | Resultado esperado |
|---|---|---|---|
| 10.1 | [ ] | Ver mis reservas sin haber hecho ninguna | Muestra mensaje amigable |
| 10.2 | [ ] | Desactivar todas las canchas e intentar reservar | No hay canchas disponibles para elegir |
| 10.3 | [ ] | Esperar a medianoche (o simular) | Las reservas del día anterior cambian a 'vencida' |
| 10.4 | [ ] | Hacer build de producción (`npm run build`) | Compila sin errores |
| 10.5 | [ ] | Admin ve su propio perfil en `/socios` | Aparece en la lista como cualquier otro usuario |

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

---

### Sesión 3 — 23 de junio de 2026
**Objetivos:** Mejoras de reservas, red social, notificaciones y perfiles

**Completado:**
- Equipamiento en reservas (palas y pelotas con cantidad y nota)
- Tabla `equipamiento_solicitudes` creada en Supabase
- Colores de canchas: campo `descripcion` reemplazado por `color` (azul/violeta/roja)
- Badge visual de color en canchas en toda la app
- Sistema de confirmación de reservas por admin (estado `pendiente`)
- Admin puede confirmar, rechazar o proponer alternativa de horario/cancha
- Sistema de notificaciones en la app con campana y contador en Navbar
- Notificaciones por email con Resend (confirmación, rechazo, alternativa)
- Archivado automático de reservas vencidas con pg_cron (todos los días 00:05)
- Toggle "Ver historial" en panel admin para ver reservas vencidas
- Validación de fechas y horarios pasados en frontend, backend y DB
- Perfil editable con apodo, edad, altura, posición de juego, pala y categoría
- Foto de perfil subida a Supabase Storage (bucket 'avatares')
- Página `/socios` con lista de todos los usuarios
- Perfil público `/socios/[id]` de cada usuario
- Sistema de amistades completo (enviar, aceptar, rechazar, eliminar, reenviar)
- Notificaciones de amistad: solicitud, aceptación, rechazo
- Pareja favorita: solicitud, aceptación, rechazo, eliminación mutua automática
- Notificaciones de pareja favorita: todos los estados cubiertos
- Nombres clickeables en notificaciones → perfil del socio
- Categoría de jugador (1era a 8va) en perfil
- Admins participan en la red social como usuarios normales
- Commits subidos a GitHub

**Notas y decisiones:**
- En Windows: cambiar script `dev` en `package.json` a `next dev --webpack` para evitar error de binarios nativos
- Resend en plan gratuito solo envía emails al propio email registrado hasta verificar dominio propio
- pg_cron debe estar habilitado en Supabase (Extensions → pg_cron)
- La pareja favorita es única (1 por usuario) y se elimina de ambos perfiles si alguno la quita
- Al aceptar nueva solicitud de pareja, la pareja anterior se elimina automáticamente y recibe notificación
- Los admins actúan como socios normales en toda la parte social de la app

**Pendiente para próxima sesión:**
- Deploy en Vercel
- Estadísticas en panel admin
- Módulo de buffet en reservas
- Imagen SVG de canchas según color

---

## 🔗 Links Importantes

| Recurso | URL |
|---|---|
| Repositorio GitHub | https://github.com/TU_USUARIO/padel-club-app |
| Supabase Dashboard | https://app.supabase.com |
| Resend Dashboard | https://resend.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| Next.js Docs | https://nextjs.org/docs |
| Supabase Docs | https://supabase.com/docs |
| Resend Docs | https://resend.com/docs |
| Claude Code Docs | https://docs.anthropic.com/claude-code |

---

*Documento generado y mantenido con asistencia de Claude (Anthropic)*
