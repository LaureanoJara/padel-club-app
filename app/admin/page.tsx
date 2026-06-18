import Link from "next/link";
import { getResumenHoy } from "@/lib/admin";

const estadoBadge: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-gray-100 text-gray-500",
};

export default async function AdminPage() {
  const { totalReservasHoy, canchasOcupadas, canchasLibres, reservasHoy } =
    await getResumenHoy();

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Reservas hoy</p>
          <p className="text-4xl font-extrabold text-blue-700 mt-1">
            {totalReservasHoy}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Canchas ocupadas</p>
          <p className="text-4xl font-extrabold text-orange-500 mt-1">
            {canchasOcupadas}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Canchas libres</p>
          <p className="text-4xl font-extrabold text-green-600 mt-1">
            {canchasLibres}
          </p>
        </div>
      </div>

      {/* Reservas de hoy */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Reservas de hoy
          </h2>
          <Link
            href="/admin/reservas"
            className="text-sm text-blue-700 hover:underline font-medium"
          >
            Ver todas →
          </Link>
        </div>

        {reservasHoy.length === 0 ? (
          <p className="px-6 py-10 text-center text-gray-400">
            No hay reservas confirmadas para hoy.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {reservasHoy.map((r) => (
              <div
                key={r.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{r.perfil_nombre}</p>
                  <p className="text-sm text-gray-500">
                    {(r.canchas as { nombre: string } | null)?.nombre ?? "—"} ·{" "}
                    {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)} hs
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${estadoBadge[r.estado] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {r.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/reservas"
          className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-6 transition-colors group"
        >
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold text-blue-800 group-hover:underline">
            Gestionar reservas
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Ver, filtrar y cancelar reservas de socios.
          </p>
        </Link>
        <Link
          href="/admin/reservas/manual"
          className="bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-2xl p-6 transition-colors group"
        >
          <p className="text-2xl mb-2">📞</p>
          <p className="font-semibold text-purple-800 group-hover:underline">
            Reserva manual
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Registrar reservas por teléfono o WhatsApp.
          </p>
        </Link>
        <Link
          href="/admin/canchas"
          className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-6 transition-colors group"
        >
          <p className="text-2xl mb-2">🏟️</p>
          <p className="font-semibold text-blue-800 group-hover:underline">
            Gestionar canchas
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Agregar, activar, desactivar o eliminar canchas.
          </p>
        </Link>
      </div>
    </div>
  );
}
