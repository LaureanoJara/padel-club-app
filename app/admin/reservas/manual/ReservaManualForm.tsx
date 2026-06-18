"use client";

import { useActionState, useState, useEffect } from "react";
import { crearReservaManual } from "@/lib/admin";
import { getHorariosOcupados } from "@/lib/reservas";
import type { Cancha } from "@/types";

const HORARIOS = Array.from({ length: 16 }, (_, i) => {
  const hora = 7 + i;
  return {
    inicio: `${String(hora).padStart(2, "0")}:00:00`,
    fin: `${String(hora + 1).padStart(2, "0")}:00:00`,
    label: `${String(hora).padStart(2, "0")}:00 – ${String(hora + 1).padStart(2, "0")}:00`,
  };
});

export default function ReservaManualForm({ canchas }: { canchas: Cancha[] }) {
  const [state, action, pending] = useActionState(crearReservaManual, undefined);

  const [fecha, setFecha] = useState("");
  const [canchaId, setCanchaId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{
    inicio: string;
    fin: string;
  } | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!fecha || !canchaId) {
      setOccupiedSlots([]);
      setSelectedSlot(null);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    getHorariosOcupados(canchaId, fecha).then((occupied) => {
      setOccupiedSlots(occupied);
      setLoadingSlots(false);
    });
  }, [fecha, canchaId]);

  const today = new Date().toISOString().split("T")[0];
  const slotsVisibles = fecha && canchaId;

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* Nombre del visitante */}
      <div>
        <label
          htmlFor="nombre_visitante"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre del visitante
        </label>
        <input
          id="nombre_visitante"
          name="nombre_visitante"
          type="text"
          required
          placeholder='Ej: "Juan García por WhatsApp"'
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          Usá un nombre descriptivo para identificar la reserva.
        </p>
      </div>

      {/* Cancha */}
      <div>
        <label
          htmlFor="cancha_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Cancha
        </label>
        <select
          id="cancha_id"
          name="cancha_id"
          required
          value={canchaId}
          onChange={(e) => setCanchaId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
        >
          <option value="">Elegí una cancha</option>
          {canchas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha */}
      <div>
        <label
          htmlFor="fecha"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fecha
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          required
          min={today}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Horarios */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">Horario</p>

        {!slotsVisibles ? (
          <p className="text-sm text-gray-400 italic">
            Elegí una cancha y una fecha para ver los horarios disponibles.
          </p>
        ) : loadingSlots ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando horarios...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HORARIOS.map((h) => {
              const ocupado = occupiedSlots.some((o) =>
                o.startsWith(h.inicio.slice(0, 5))
              );
              const seleccionado = selectedSlot?.inicio === h.inicio;

              return (
                <button
                  key={h.inicio}
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    setSelectedSlot(
                      seleccionado ? null : { inicio: h.inicio, fin: h.fin }
                    )
                  }
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors
                    ${
                      ocupado
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                        : seleccionado
                        ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700"
                    }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        )}

        <input type="hidden" name="hora_inicio" value={selectedSlot?.inicio ?? ""} />
        <input type="hidden" name="hora_fin" value={selectedSlot?.fin ?? ""} />
      </div>

      <button
        type="submit"
        disabled={pending || !selectedSlot}
        className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Registrando reserva..." : "Confirmar reserva manual"}
      </button>
    </form>
  );
}
