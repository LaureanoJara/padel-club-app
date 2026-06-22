"use client";

import { useActionState, useState } from "react";
import { crearCancha } from "@/lib/admin";
import type { ColorCancha } from "@/types";

const COLORES: { value: ColorCancha; label: string; dot: string }[] = [
  { value: "azul",    label: "Azul",    dot: "bg-blue-500" },
  { value: "violeta", label: "Violeta", dot: "bg-purple-500" },
  { value: "roja",    label: "Roja",    dot: "bg-red-500" },
];

export default function NuevaCanchaForm() {
  const [state, action, pending] = useActionState(crearCancha, undefined);
  const [colorSeleccionado, setColorSeleccionado] = useState<ColorCancha | "">("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">
        Agregar nueva cancha
      </h2>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Ej: Cancha 3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Color</p>
          <div className="flex gap-3">
            {COLORES.map((c) => {
              const seleccionado = colorSeleccionado === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColorSeleccionado(c.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                    ${seleccionado
                      ? "border-gray-800 bg-gray-50"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                >
                  {/* TODO: reemplazar por miniatura SVG de la cancha pintada */}
                  <span className={`w-4 h-4 rounded-full ${c.dot}`} />
                  {c.label}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="color" value={colorSeleccionado} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {pending ? "Creando..." : "Agregar cancha"}
        </button>
      </form>
    </div>
  );
}
