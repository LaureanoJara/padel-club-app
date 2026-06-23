import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getNotificaciones,
  marcarTodasLeidas,
  aceptarAlternativa,
  rechazarAlternativa,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  aceptarSolicitudPareja,
  rechazarSolicitudPareja,
} from "@/lib/notificaciones";
import CanchaColorBadge from "@/components/CanchaColorBadge";
import AvatarCirculo from "@/components/AvatarCirculo";
import type { Notificacion } from "@/types";

const iconoPorTipo: Record<Notificacion["tipo"], string> = {
  confirmada:            "✅",
  rechazada:             "❌",
  propuesta_alternativa: "🔄",
  solicitud_amistad:     "🤝",
  amistad_aceptada:      "👥",
  amistad_rechazada:     "😔",
  solicitud_pareja:      "🎾",
  pareja_aceptada:       "🎾",
  pareja_eliminada:      "💔",
  pareja_rechazada:      "💔",
};

export default async function NotificacionesPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  // Primero fetch para mostrar estado pre-leída, luego marcar
  const notificaciones = await getNotificaciones();
  await marcarTodasLeidas();

  // Deduplicar solicitudes de amistad: solo la más reciente por remitente
  // (la lista ya viene ordenada DESC por created_at)
  const vistosRemitentes = new Set<string>();
  const notificacionesMostradas = notificaciones.filter((n) => {
    if (n.tipo === "solicitud_amistad" && n.remitente_id) {
      if (vistosRemitentes.has(n.remitente_id)) return false;
      vistosRemitentes.add(n.remitente_id);
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/reservas" className="text-sm text-blue-700 hover:underline">
            ← Mis reservas
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
          Notificaciones
        </h1>
        <p className="text-gray-500 mt-1">
          {notificacionesMostradas.length === 0
            ? "Sin notificaciones"
            : `${notificacionesMostradas.length} notificación${notificacionesMostradas.length !== 1 ? "es" : ""}`}
        </p>
      </div>

      {notificacionesMostradas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500">No tenés notificaciones todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notificacionesMostradas.map((notif) => {
            const noLeida = !notif.leida;
            const fecha = new Date(notif.created_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-sm border p-6 transition-all
                  ${noLeida ? "border-blue-200 shadow-blue-50" : "border-gray-100"}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-0.5">
                    {iconoPorTipo[notif.tipo]}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{notif.titulo}</p>
                      {noLeida && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          Nueva
                        </span>
                      )}
                    </div>
                    {notif.remitente &&
                    (notif.tipo === "solicitud_amistad" ||
                      notif.tipo === "amistad_aceptada" ||
                      notif.tipo === "amistad_rechazada" ||
                      notif.tipo === "solicitud_pareja" ||
                      notif.tipo === "pareja_aceptada" ||
                      notif.tipo === "pareja_eliminada" ||
                      notif.tipo === "pareja_rechazada") ? (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Link href={`/socios/${notif.remitente.id}`}>
                          <AvatarCirculo
                            url={notif.remitente.avatar_url}
                            nombre={notif.remitente.nombre}
                            size="sm"
                          />
                        </Link>
                        <p className="text-gray-600 text-sm">
                          <Link
                            href={`/socios/${notif.remitente.id}`}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {notif.remitente.nombre}
                          </Link>
                          {notif.mensaje.slice(notif.remitente.nombre.length)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mt-1">{notif.mensaje}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2 capitalize">{fecha}</p>

                    {/* Solicitud de amistad: botones o badge según estado */}
                    {notif.tipo === "solicitud_amistad" && (
                      <div className="mt-3">
                        {notif.estado === "pendiente" ? (
                          <div className="flex gap-2 pt-1">
                            <form action={aceptarSolicitudAmistad.bind(null, notif.id)}>
                              <button
                                type="submit"
                                className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
                              >
                                ✓ Aceptar
                              </button>
                            </form>
                            <form action={rechazarSolicitudAmistad.bind(null, notif.id)}>
                              <button
                                type="submit"
                                className="bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                Rechazar
                              </button>
                            </form>
                          </div>
                        ) : notif.estado === "aceptada" ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            ✓ Solicitud aceptada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Solicitud rechazada
                          </span>
                        )}
                      </div>
                    )}

                    {/* Solicitud de pareja: botones o badge */}
                    {notif.tipo === "solicitud_pareja" && notif.remitente_id && (
                      <div className="mt-3">
                        {notif.estado === "pendiente" ? (
                          <div className="flex gap-2 pt-1">
                            <form
                              action={aceptarSolicitudPareja.bind(
                                null,
                                notif.id,
                                notif.remitente_id
                              )}
                            >
                              <button
                                type="submit"
                                className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
                              >
                                ✓ Aceptar
                              </button>
                            </form>
                            <form
                              action={rechazarSolicitudPareja.bind(
                                null,
                                notif.id,
                                notif.remitente_id
                              )}
                            >
                              <button
                                type="submit"
                                className="bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                Rechazar
                              </button>
                            </form>
                          </div>
                        ) : notif.estado === "aceptada" ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            ✓ Solicitud aceptada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Solicitud rechazada
                          </span>
                        )}
                      </div>
                    )}

                    {/* Propuesta alternativa: detalles y botones/badge */}
                    {notif.tipo === "propuesta_alternativa" &&
                      notif.alternativa_cancha_id && (
                        <div className="mt-4 border border-blue-100 rounded-xl bg-blue-50/50 p-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-700">
                            Alternativa propuesta
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-700">
                            {notif.alternativa_cancha && (
                              <>
                                <span className="font-medium">
                                  {notif.alternativa_cancha.nombre}
                                </span>
                                <CanchaColorBadge
                                  color={notif.alternativa_cancha.color}
                                />
                              </>
                            )}
                            {notif.alternativa_hora_inicio && notif.alternativa_hora_fin && (
                              <span className="text-blue-700 font-medium">
                                {notif.alternativa_hora_inicio.slice(0, 5)} –{" "}
                                {notif.alternativa_hora_fin.slice(0, 5)} hs
                              </span>
                            )}
                          </div>

                          {notif.estado === "pendiente" ? (
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              <form action={aceptarAlternativa.bind(null, notif.id)}>
                                <button
                                  type="submit"
                                  className="w-full sm:w-auto bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
                                >
                                  ✓ Aceptar alternativa
                                </button>
                              </form>
                              <form action={rechazarAlternativa.bind(null, notif.id)}>
                                <button
                                  type="submit"
                                  className="w-full sm:w-auto bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                  ✗ Rechazar y cancelar reserva
                                </button>
                              </form>
                            </div>
                          ) : notif.estado === "aceptada" ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              ✓ Alternativa aceptada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                              ✗ Alternativa rechazada
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
