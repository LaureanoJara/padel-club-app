import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getMisReservas, cancelarReserva } from "@/lib/reservas";

const estadoBadge: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-gray-100 text-gray-500",
};

export default async function ReservasPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const reservas = await getMisReservas();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Reservas</h1>
          <p className="text-gray-500 mt-1">Tus turnos en el Pádel Club</p>
        </div>
        <Link
          href="/reservas/nueva"
          className="bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-blue-800 transition-colors text-sm"
        >
          + Nueva reserva
        </Link>
      </div>

      {reservas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-5xl mb-4">🎾</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No tenés reservas todavía
          </h2>
          <p className="text-gray-500 mb-6">
            Reservá tu primera cancha y empezá a jugar.
          </p>
          <Link
            href="/reservas/nueva"
            className="inline-block bg-blue-700 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-800 transition-colors"
          >
            Hacer una reserva
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => {
            const cancelada = reserva.estado === "cancelada";
            const horaInicio = reserva.hora_inicio.slice(0, 5);
            const horaFin = reserva.hora_fin.slice(0, 5);
            const fechaFormateada = new Date(
              reserva.fecha + "T00:00:00"
            ).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={reserva.id}
                className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between gap-4 transition-opacity
                  ${cancelada ? "opacity-60 border-gray-200" : "border-blue-100"}`}
              >
                <div className={cancelada ? "line-through text-gray-400" : ""}>
                  <p className="font-semibold text-gray-900 text-lg">
                    {reserva.canchas?.nombre ?? "Cancha"}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5 capitalize">
                    {fechaFormateada}
                  </p>
                  <p className="text-blue-700 font-medium text-sm mt-1">
                    {horaInicio} – {horaFin} hs
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
                      ${estadoBadge[reserva.estado] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {reserva.estado}
                  </span>

                  {!cancelada && (
                    <form action={cancelarReserva.bind(null, reserva.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors"
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
