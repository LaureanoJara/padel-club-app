import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getSocio,
  getParejaInfo,
  enviarSolicitudAmistad,
  aceptarAmistad,
  rechazarAmistad,
  eliminarAmistad,
} from "@/lib/socios";
import AvatarCirculo from "@/components/AvatarCirculo";
import type { SocioConAmistad } from "@/types";

const POSICION_LABELS: Record<string, string> = {
  drive: "Drive",
  reves: "Revés",
  ambas: "Ambas",
};

function AccionAmistad({ socio }: { socio: SocioConAmistad }) {
  switch (socio.estado_amistad) {
    case "amigos":
      return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-full">
            ✓ Amigos
          </span>
          <form action={eliminarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              Eliminar amistad
            </button>
          </form>
        </div>
      );

    case "solicitud_enviada":
      return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="inline-flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            Solicitud enviada
          </span>
          <form action={eliminarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              Cancelar solicitud
            </button>
          </form>
        </div>
      );

    case "solicitud_recibida":
      return (
        <div className="flex gap-2">
          <form action={aceptarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
            >
              ✓ Aceptar solicitud
            </button>
          </form>
          <form action={rechazarAmistad.bind(null, socio.amistad_id!)}>
            <button
              type="submit"
              className="bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
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
            className="bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-800 transition-colors"
          >
            + Agregar amigo
          </button>
        </form>
      );
  }
}

export default async function PerfilSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const socio = await getSocio(id);
  if (!socio) notFound();

  const tieneDatos = socio.posicion || socio.pala || socio.edad || socio.altura || socio.categoria;

  let parejaInfo: { id: string; nombre: string; avatar_url: string | null } | null = null;
  if (socio.pareja_id && socio.pareja_estado === "aceptada") {
    parejaInfo = await getParejaInfo(socio.pareja_id);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <Link href="/socios" className="text-sm text-blue-700 hover:underline">
        ← Socios
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-5 text-center">
        <AvatarCirculo url={socio.avatar_url} nombre={socio.nombre} size="lg" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{socio.nombre}</h1>
          {socio.apodo && (
            <p className="text-gray-500 text-sm mt-0.5">{socio.apodo}</p>
          )}
        </div>
        <AccionAmistad socio={socio} />
      </div>

      {/* Datos del perfil */}
      {tieneDatos && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Información
          </h2>
          <dl className="space-y-3">
            {socio.categoria && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Categoría</dt>
                <dd className="text-gray-900 font-medium">🏆 {socio.categoria}</dd>
              </div>
            )}
            {socio.posicion && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Posición de juego</dt>
                <dd className="text-gray-900 font-medium">
                  {POSICION_LABELS[socio.posicion]}
                </dd>
              </div>
            )}
            {socio.pala && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Pala</dt>
                <dd className="text-gray-900 font-medium">{socio.pala}</dd>
              </div>
            )}
            {socio.edad && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Edad</dt>
                <dd className="text-gray-900 font-medium">{socio.edad} años</dd>
              </div>
            )}
            {socio.altura && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Altura</dt>
                <dd className="text-gray-900 font-medium">{socio.altura} m</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Pareja favorita */}
      {parejaInfo && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Pareja favorita
          </h2>
          <Link
            href={parejaInfo.id === user.id ? "/perfil" : `/socios/${parejaInfo.id}`}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
          >
            <AvatarCirculo url={parejaInfo.avatar_url} nombre={parejaInfo.nombre} size="md" />
            <p className="font-semibold text-gray-900 text-sm">🎾 {parejaInfo.nombre}</p>
          </Link>
        </div>
      )}

      {/* Contenido exclusivo para amigos — se implementará en el futuro */}
      {/*
      {socio.estado_amistad === "amigos" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Solo para amigos
          </h2>
          TODO: estadísticas de partidos, historial compartido, etc.
        </div>
      )}
      */}
    </div>
  );
}
