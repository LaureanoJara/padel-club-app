import { getCanchasAdmin, toggleCanchaActiva, eliminarCancha } from "@/lib/admin";
import NuevaCanchaForm from "./NuevaCanchaForm";

export default async function AdminCanchasPage() {
  const canchas = await getCanchasAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Canchas</h1>
        <p className="text-gray-500 mt-1">
          {canchas.length} cancha{canchas.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de canchas */}
        <div className="lg:col-span-2 space-y-3">
          {canchas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
              No hay canchas registradas.
            </div>
          ) : (
            canchas.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between gap-4
                  ${c.activa ? "border-gray-100" : "border-gray-200 opacity-70"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {c.nombre}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                        ${c.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {c.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  {c.descripcion && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {c.descripcion}
                    </p>
                  )}
                  {c.reservas_futuras > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {c.reservas_futuras} reserva
                      {c.reservas_futuras !== 1 ? "s" : ""} futura
                      {c.reservas_futuras !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle activa/inactiva */}
                  <form
                    action={toggleCanchaActiva.bind(null, c.id, c.activa)}
                  >
                    <button
                      type="submit"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
                        ${
                          c.activa
                            ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        }`}
                    >
                      {c.activa ? "Desactivar" : "Activar"}
                    </button>
                  </form>

                  {/* Eliminar — solo si no tiene reservas futuras */}
                  {c.reservas_futuras === 0 && (
                    <form action={eliminarCancha.bind(null, c.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
                      >
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulario nueva cancha */}
        <div className="lg:col-span-1">
          <NuevaCanchaForm />
        </div>
      </div>
    </div>
  );
}
