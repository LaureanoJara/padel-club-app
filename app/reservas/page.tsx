import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getMisReservas } from "@/lib/reservas";
import ListaReservas from "./ListaReservas";

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
        <ListaReservas reservas={reservas} />
      )}
    </div>
  );
}
