"use client";

import { useActionState, useState } from "react";
import { actualizarPerfil } from "@/lib/perfil";
import type { Perfil } from "@/types";

const POSICIONES = [
  { value: "drive", label: "Drive" },
  { value: "reves", label: "Revés" },
  { value: "ambas", label: "Ambas" },
] as const;

export default function PerfilForm({ perfil }: { perfil: Perfil | null }) {
  const [state, action, pending] = useActionState(actualizarPerfil, undefined);
  const [posicion, setPosicion] = useState<string>(perfil?.posicion ?? "");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-6">
        Personalización
      </h2>

      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-5">
          ✓ Cambios guardados correctamente.
        </div>
      )}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
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
            defaultValue={perfil?.apodo ?? ""}
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
              defaultValue={perfil?.edad ?? ""}
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
              defaultValue={perfil?.altura ?? ""}
              placeholder="Ej: 1.75"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        {/* Posición de juego */}
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
                  onClick={() =>
                    setPosicion(seleccionada ? "" : p.value)
                  }
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
            defaultValue={perfil?.pala ?? ""}
            placeholder="Ej: Babolat Viper"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
