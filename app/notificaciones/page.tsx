import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getNotificaciones,
  marcarTodasLeidas,
  aceptarAlternativa,
  rechazarAlternativa,
} from "@/lib/notificaciones";
import CanchaColorBadge from "@/components/CanchaColorBadge";
import type { Notificacion } from "@/types";

const iconoPorTipo: Record<Notificacion["tipo"], string> = {
  confirmada:            "✅",
  rechazada:             "❌",
  propuesta_alternativa: "🔄",
};

export default async function NotificacionesPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  // Primero fetch para mostrar estado pre-leída, luego marcar
  const notificaciones = await getNotificaciones();
  await marcarTodasLeidas();

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
          {notificaciones.length === 0
            ? "Sin notificaciones"
            : `${notificaciones.length} notificación${notificaciones.length !== 1 ? "es" : ""}`}
        </p>
      </div>

      {notificaciones.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500">No tenés notificaciones todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notificaciones.map((notif) => {
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
                    <p className="text-gray-600 text-sm mt-1">{notif.mensaje}</p>
                    <p className="text-gray-400 text-xs mt-2 capitalize">{fecha}</p>

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
