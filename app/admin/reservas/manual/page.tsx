import Link from "next/link";
import { getCanchas } from "@/lib/reservas";
import ReservaManualForm from "./ReservaManualForm";

export default async function ReservaManualPage() {
  const canchas = await getCanchas();

  return (
    <div className="max-w-2xl">
      <div className="mb-2">
        <Link
          href="/admin/reservas"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Volver a reservas
        </Link>
      </div>
      <div className="mb-8 mt-3">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Reserva manual
        </h1>
        <p className="text-gray-500 mt-1">
          Para reservas recibidas por teléfono, WhatsApp u otro medio.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        {canchas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay canchas disponibles en este momento.
          </p>
        ) : (
          <ReservaManualForm canchas={canchas} />
        )}
      </div>
    </div>
  );
}
