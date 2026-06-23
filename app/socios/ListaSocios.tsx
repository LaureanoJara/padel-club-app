"use client";

import { useState } from "react";
import Link from "next/link";
import {
  enviarSolicitudAmistad,
  aceptarAmistad,
  rechazarAmistad,
} from "@/lib/socios";
import AvatarCirculo from "@/components/AvatarCirculo";
import type { SocioConAmistad } from "@/types";

function AccionAmistad({ socio }: { socio: SocioConAmistad }) {
  switch (socio.estado_amistad) {
    case "amigos":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          ✓ Amigo
        </span>
      );

    case "solicitud_enviada":
      return (
        <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
          Enviada
        </span>
      );

    case "solicitud_recibida":
      return (
        <div className="flex flex-col gap-1">
          <form action={aceptarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="w-full text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full transition-colors"
            >
              Aceptar
            </button>
          </form>
          <form action={rechazarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="w-full text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Rechazar
            </button>
          </form>
        </div>
      );

    default:
      return (
        <form action={enviarSolicitudAmistad.bind(null, socio.id)}>
          <button
            type="submit"
            className="text-xs font-semibold text-blue-700 border border-blue-300 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            + Amigo
          </button>
        </form>
      );
  }
}

export default function ListaSocios({ socios }: { socios: SocioConAmistad[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = socios.filter((s) => {
    const q = busqueda.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(q) ||
      (s.apodo?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o apodo..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
      />

      {filtrados.length === 0 && (
        <p className="text-center text-gray-400 py-10 italic">
          {busqueda ? "No se encontraron socios con ese nombre." : "No hay socios registrados."}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtrados.map((socio) => (
          <div
            key={socio.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <Link href={`/socios/${socio.id}`} className="shrink-0">
              <AvatarCirculo url={socio.avatar_url} nombre={socio.nombre} size="md" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/socios/${socio.id}`}
                className="font-semibold text-gray-900 hover:text-blue-700 transition-colors truncate block"
              >
                {socio.nombre}
              </Link>
            </div>

            <div className="shrink-0">
              <AccionAmistad socio={socio} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
