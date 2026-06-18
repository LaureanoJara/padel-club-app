"use client";

import { useActionState } from "react";
import { crearCancha } from "@/lib/admin";

export default function NuevaCanchaForm() {
  const [state, action, pending] = useActionState(crearCancha, undefined);

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
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="descripcion"
            name="descripcion"
            type="text"
            placeholder="Ej: Cancha cubierta con iluminación LED"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
