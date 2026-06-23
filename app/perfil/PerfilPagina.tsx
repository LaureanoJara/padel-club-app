"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import {
  actualizarPerfil,
  enviarSolicitudPareja,
  cancelarSolicitudPareja,
  eliminarPareja,
} from "@/lib/perfil";
import AvatarCirculo from "@/components/AvatarCirculo";
import type { Perfil, SocioPublico } from "@/types";

const POSICIONES = [
  { value: "drive", label: "Drive" },
  { value: "reves", label: "Revés" },
  { value: "ambas", label: "Ambas" },
] as const;

const POSICION_LABELS: Record<string, string> = {
  drive: "Drive",
  reves: "Revés",
  ambas: "Ambas",
};

const CATEGORIAS = ["1era", "2da", "3era", "4ta", "5ta", "6ta", "7ma", "8va"] as const;

type ParejaInfo = { id: string; nombre: string; avatar_url: string | null } | null;

export default function PerfilPagina({
  perfil: initialPerfil,
  email,
  amigos,
  parejaInfo: initialParejaInfo,
}: {
  perfil: Perfil | null;
  email: string;
  amigos: SocioPublico[];
  parejaInfo: ParejaInfo;
}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [perfilLocal, setPerfilLocal] = useState(initialPerfil);
  const [posicion, setPosicion] = useState(initialPerfil?.posicion ?? "");
  const [categoria, setCategoria] = useState(initialPerfil?.categoria ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPerfil?.avatar_url ?? null
  );
  const [parejaSeleccionadaId, setParejaSeleccionadaId] = useState("");

  const [state, action, pending] = useActionState(actualizarPerfil, undefined);
  const [stateEnviar, actionEnviarPareja, pendingEnviar] = useActionState(
    enviarSolicitudPareja,
    undefined
  );
  const [stateCancelar, actionCancelar, pendingCancelar] = useActionState(
    cancelarSolicitudPareja,
    undefined
  );
  const [stateEliminar, actionEliminar, pendingEliminar] = useActionState(
    eliminarPareja,
    undefined
  );

  useEffect(() => {
    if (state?.success && state.perfil) {
      setPerfilLocal(state.perfil);
      setPosicion(state.perfil.posicion ?? "");
      setCategoria(state.perfil.categoria ?? "");
      setPreviewUrl(state.perfil.avatar_url ?? null);
      setModoEdicion(false);
    }
  }, [state?.success]);

  useEffect(() => {
    for (const s of [stateEnviar, stateCancelar, stateEliminar]) {
      if (s?.success && s.perfil) {
        setPerfilLocal(s.perfil);
        setParejaSeleccionadaId("");
        break;
      }
    }
  }, [stateEnviar, stateCancelar, stateEliminar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelar = () => {
    setPreviewUrl(perfilLocal?.avatar_url ?? null);
    setPosicion(perfilLocal?.posicion ?? "");
    setCategoria(perfilLocal?.categoria ?? "");
    setModoEdicion(false);
  };

  const tieneDataOpcional =
    perfilLocal?.apodo ||
    perfilLocal?.edad ||
    perfilLocal?.altura ||
    perfilLocal?.posicion ||
    perfilLocal?.pala ||
    perfilLocal?.categoria;

  const parejaInfoActual: ParejaInfo =
    amigos.find((a) => a.id === perfilLocal?.pareja_id) ??
    (perfilLocal?.pareja_id === initialPerfil?.pareja_id ? initialParejaInfo : null);

  // ── MODO VISTA ──
  if (!modoEdicion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4 text-center">
          <AvatarCirculo
            url={perfilLocal?.avatar_url}
            nombre={perfilLocal?.nombre}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {perfilLocal?.nombre}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{email}</p>
          </div>
          <button
            onClick={() => setModoEdicion(true)}
            className="mt-1 px-6 py-2 bg-blue-700 text-white text-sm font-semibold rounded-full hover:bg-blue-800 transition-colors"
          >
            Editar perfil
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
            Información personal
          </h2>
          {tieneDataOpcional ? (
            <dl className="space-y-3">
              {perfilLocal?.apodo && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Apodo</dt>
                  <dd className="text-gray-900 font-medium">{perfilLocal.apodo}</dd>
                </div>
              )}
              {perfilLocal?.categoria && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Categoría</dt>
                  <dd className="text-gray-900 font-medium">🏆 {perfilLocal.categoria}</dd>
                </div>
              )}
              {perfilLocal?.edad && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Edad</dt>
                  <dd className="text-gray-900 font-medium">{perfilLocal.edad} años</dd>
                </div>
              )}
              {perfilLocal?.altura && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Altura</dt>
                  <dd className="text-gray-900 font-medium">{perfilLocal.altura} m</dd>
                </div>
              )}
              {perfilLocal?.posicion && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Posición de juego</dt>
                  <dd className="text-gray-900 font-medium">
                    {POSICION_LABELS[perfilLocal.posicion]}
                  </dd>
                </div>
              )}
              {perfilLocal?.pala && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Pala</dt>
                  <dd className="text-gray-900 font-medium">{perfilLocal.pala}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Completá tu perfil para que otros socios te conozcan.
            </p>
          )}
        </div>

        {perfilLocal?.pareja_estado === "aceptada" && parejaInfoActual && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
              Pareja favorita
            </h2>
            <Link
              href={`/socios/${parejaInfoActual.id}`}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
            >
              <AvatarCirculo
                url={parejaInfoActual.avatar_url}
                nombre={parejaInfoActual.nombre}
                size="md"
              />
              <p className="font-semibold text-gray-900 text-sm">
                🎾 {parejaInfoActual.nombre}
              </p>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── MODO EDICIÓN ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Editar perfil</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
            {state.error}
          </div>
        )}

        <form action={action} encType="multipart/form-data" className="space-y-5">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center gap-3 pb-5 border-b border-gray-100">
            <AvatarCirculo url={previewUrl} nombre={perfilLocal?.nombre} size="lg" />
            <label className="cursor-pointer text-sm text-blue-700 font-semibold hover:underline">
              {previewUrl ? "Cambiar foto" : "Agregar foto"}
              <input
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Apodo */}
          <div>
            <label htmlFor="apodo" className="block text-sm font-medium text-gray-700 mb-1">
              Apodo{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="apodo"
              name="apodo"
              type="text"
              defaultValue={perfilLocal?.apodo ?? ""}
              placeholder="Ej: El Rayo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Categoría */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Categoría{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIAS.map((cat) => {
                const seleccionada = categoria === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoria(seleccionada ? "" : cat)}
                    className={`py-2.5 px-2 rounded-lg border-2 text-sm font-medium transition-colors
                      ${
                        seleccionada
                          ? "border-blue-700 bg-blue-50 text-blue-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="categoria" value={categoria} />
          </div>

          {/* Edad y Altura */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                id="edad"
                name="edad"
                type="number"
                min={5}
                max={99}
                defaultValue={perfilLocal?.edad ?? ""}
                placeholder="Ej: 28"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div>
              <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-1">
                Altura (m)
              </label>
              <input
                id="altura"
                name="altura"
                type="number"
                step="0.01"
                min={1}
                max={2.5}
                defaultValue={perfilLocal?.altura ?? ""}
                placeholder="Ej: 1.75"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>
          </div>

          {/* Posición */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Posición de juego
            </p>
            <div className="flex gap-2">
              {POSICIONES.map((p) => {
                const seleccionada = posicion === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPosicion(seleccionada ? "" : p.value)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-colors
                      ${
                        seleccionada
                          ? "border-blue-700 bg-blue-50 text-blue-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="posicion" value={posicion} />
          </div>

          {/* Pala */}
          <div>
            <label htmlFor="pala" className="block text-sm font-medium text-gray-700 mb-1">
              Pala
            </label>
            <input
              id="pala"
              name="pala"
              type="text"
              defaultValue={perfilLocal?.pala ?? ""}
              placeholder="Ej: Babolat Viper"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              disabled={pending}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Sección pareja favorita */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
          Pareja favorita
        </h2>

        {(stateEnviar?.error || stateCancelar?.error || stateEliminar?.error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {stateEnviar?.error ?? stateCancelar?.error ?? stateEliminar?.error}
          </div>
        )}

        {!perfilLocal?.pareja_id && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Elegí un amigo del club como tu pareja favorita de pádel.
            </p>
            {amigos.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Necesitás tener amigos para elegir una pareja.
              </p>
            ) : (
              <form action={actionEnviarPareja} className="flex gap-2">
                <select
                  value={parejaSeleccionadaId}
                  onChange={(e) => setParejaSeleccionadaId(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Elegí un amigo...</option>
                  {amigos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="receptorId" value={parejaSeleccionadaId} />
                <button
                  type="submit"
                  disabled={!parejaSeleccionadaId || pendingEnviar}
                  className="px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {pendingEnviar ? "Enviando..." : "Enviar solicitud"}
                </button>
              </form>
            )}
          </div>
        )}

        {perfilLocal?.pareja_id && perfilLocal.pareja_estado === "pendiente" && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {parejaInfoActual && (
                <AvatarCirculo
                  url={parejaInfoActual.avatar_url}
                  nombre={parejaInfoActual.nombre}
                  size="sm"
                />
              )}
              <p className="text-sm text-gray-600">
                <span className="mr-1">⏳</span>
                Solicitud enviada a{" "}
                <span className="font-semibold text-gray-900">
                  {parejaInfoActual?.nombre ?? "…"}
                </span>
              </p>
            </div>
            <form action={actionCancelar}>
              <button
                type="submit"
                disabled={pendingCancelar}
                className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {pendingCancelar ? "Cancelando..." : "Cancelar solicitud"}
              </button>
            </form>
          </div>
        )}

        {perfilLocal?.pareja_id && perfilLocal.pareja_estado === "aceptada" && (
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/socios/${perfilLocal.pareja_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {parejaInfoActual && (
                <AvatarCirculo
                  url={parejaInfoActual.avatar_url}
                  nombre={parejaInfoActual.nombre}
                  size="sm"
                />
              )}
              <p className="font-semibold text-gray-900 text-sm">
                🎾 {parejaInfoActual?.nombre ?? "…"}
              </p>
            </Link>
            <form action={actionEliminar}>
              <button
                type="submit"
                disabled={pendingEliminar}
                className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {pendingEliminar ? "Eliminando..." : "Eliminar pareja"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
