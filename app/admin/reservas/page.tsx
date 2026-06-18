import {
  getTodasLasReservas,
  cancelarReservaAdmin,
  eliminarReserva,
  eliminarReservasCanceladas,
} from "@/lib/admin";
import { getCanchas } from "@/lib/reservas";
import { EliminarCanceladasBtn, EliminarReservaBtn } from "./DeleteButtons";

const estadoBadge: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-gray-100 text-gray-500",
};

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; cancha_id?: string }>;
}) {
  const { fecha, cancha_id } = await searchParams;

  const [reservas, canchas] = await Promise.all([
    getTodasLasReservas(fecha, cancha_id),
    getCanchas(),
  ]);

  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Todas las reservas
          </h1>
          <p className="text-gray-500 mt-1">
            {reservas.length} resultado{reservas.length !== 1 ? "s" : ""}
            {fecha ? ` para el ${fecha}` : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <EliminarCanceladasBtn
            action={eliminarReservasCanceladas}
            count={canceladas.length}
          />
          <a
            href="/admin/reservas/manual"
            className="bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-blue-800 transition-colors"
          >
            + Reserva manual
          </a>
        </div>
      </div>

      {/* Filtros — form GET nativo, sin JS */}
      <form
        method="GET"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div className="flex-1 min-w-[160px]">
          <label
            htmlFor="fecha"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={fecha ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label
            htmlFor="cancha_id"
            className="block text-xs font-medium text-gray-600 mb-1"
          >
            Cancha
          </label>
          <select
            id="cancha_id"
            name="cancha_id"
            defaultValue={cancha_id ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las canchas</option>
            {canchas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            Filtrar
          </button>
          <a
            href="/admin/reservas"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </a>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {reservas.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">
            No hay reservas con esos filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Socio</th>
                  <th className="px-5 py-3">Cancha</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Horario</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {r.reserva_manual
                            ? (r.nombre_visitante ?? "Sin nombre")
                            : r.perfil_nombre}
                        </p>
                        {r.reserva_manual && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">
                            Manual
                          </span>
                        )}
                      </div>
                      {!r.reserva_manual && (
                        <p className="text-gray-400 text-xs">{r.usuario_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {r.canchas?.nombre ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {new Date(r.fecha + "T00:00:00").toLocaleDateString(
                        "es-AR",
                        { day: "2-digit", month: "2-digit", year: "numeric" }
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)} hs
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${estadoBadge[r.estado] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.estado === "cancelada" ? (
                        <EliminarReservaBtn
                          action={eliminarReserva.bind(null, r.id)}
                        />
                      ) : (
                        <form action={cancelarReservaAdmin.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                          >
                            Cancelar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
