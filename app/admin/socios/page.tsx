import { getTodosLosSocios, cambiarRolUsuario } from "@/lib/admin";
import { getSession } from "@/lib/auth";
import { CambiarRolButton } from "./CambiarRolButton";

const rolBadge: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  socio: "bg-gray-100 text-gray-600",
};

export default async function AdminSociosPage() {
  const [socios, currentUser] = await Promise.all([
    getTodosLosSocios(),
    getSession(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Socios</h1>
        <p className="text-gray-500 mt-1">
          {socios.length} usuario{socios.length !== 1 ? "s" : ""} registrado
          {socios.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {socios.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">
            No hay usuarios registrados todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Registrado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {socios.map((s) => {
                  const esYoMismo = s.id === currentUser?.id;
                  const nuevoRol = s.rol === "admin" ? "socio" : "admin";
                  const accion = cambiarRolUsuario.bind(null, s.id, nuevoRol);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {s.nombre || <span className="text-gray-400 italic">Sin nombre</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{s.email}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {s.telefono || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${rolBadge[s.rol] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {s.rol}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(s.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <CambiarRolButton
                          action={accion}
                          rolActual={s.rol}
                          esYoMismo={esYoMismo}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
