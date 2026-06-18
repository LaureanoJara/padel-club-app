import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCanchas } from "@/lib/reservas";
import NuevaReservaForm from "./NuevaReservaForm";

export default async function NuevaReservaPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const canchas = await getCanchas();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-2">
        <Link
          href="/reservas"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Mis reservas
        </Link>
      </div>
      <div className="mb-8 mt-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Nueva reserva</h1>
        <p className="text-gray-500 mt-1">
          Elegí la cancha y el horario que más te conviene.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        {canchas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay canchas disponibles en este momento.
          </p>
        ) : (
          <NuevaReservaForm canchas={canchas} />
        )}
      </div>
    </div>
  );
}
