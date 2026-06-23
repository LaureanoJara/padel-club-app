"use client";

import { useActionState, useState, useEffect } from "react";
import { actualizarPerfil } from "@/lib/perfil";
import type { Perfil } from "@/types";

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

function AvatarCirculo({
  url,
  nombre,
  size = "lg",
}: {
  url?: string | null;
  nombre?: string | null;
  size?: "sm" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-24 h-24 text-3xl border-4"
      : "w-8 h-8 text-sm border-2";

  if (url) {
    return (
      <img
        src={url}
        alt="Foto de perfil"
        className={`${dim} rounded-full object-cover border-white shadow`}
      />
    );
  }

  const inicial = (nombre ?? "U").charAt(0).toUpperCase();
  return (
    <div
      className={`${dim} rounded-full bg-blue-700 flex items-center justify-center text-white font-bold shadow border-white shrink-0`}
    >
      {inicial}
    </div>
  );
}

export default function PerfilPagina({
  perfil: initialPerfil,
  email,
}: {
  perfil: Perfil | null;
  email: string;
}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [perfilLocal, setPerfilLocal] = useState(initialPerfil);
  const [posicion, setPosicion] = useState(initialPerfil?.posicion ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPerfil?.avatar_url ?? null
  );
  const [state, action, pending] = useActionState(actualizarPerfil, undefined);

  useEffect(() => {
    if (state?.success && state.perfil) {
      setPerfilLocal(state.perfil);
      setPosicion(state.perfil.posicion ?? "");
      setPreviewUrl(state.perfil.avatar_url ?? null);
      setModoEdicion(false);
    }
  }, [state?.success]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelar = () => {
    setPreviewUrl(perfilLocal?.avatar_url ?? null);
    setPosicion(perfilLocal?.posicion ?? "");
    setModoEdicion(false);
  };

  const tieneDataOpcional =
    perfilLocal?.apodo ||
    perfilLocal?.edad ||
    perfilLocal?.altura ||
    perfilLocal?.posicion ||
    perfilLocal?.pala;

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
                  <dt className="text-gray-500">Posición</dt>
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
      </div>
    );
  }

  // ── MODO EDICIÓN ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
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
          {/* Foto de perfil
              La imagen se sube a Supabase Storage en el bucket 'avatares',
              ruta: {userId}/avatar (upsert). */}
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
            <label
              htmlFor="apodo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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

          {/* Edad y Altura */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edad"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="altura"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
            <label
              htmlFor="pala"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pala
            </label>
            {/* TODO: aquí se agregará la foto/imagen de la pala cuando esté disponible */}
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
    </div>
  );
}
