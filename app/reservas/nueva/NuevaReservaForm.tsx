"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { crearReserva, getHorariosOcupados } from "@/lib/reservas";
import CanchaColorBadge from "@/components/CanchaColorBadge";
import type { Cancha } from "@/types";

const HORARIOS = Array.from({ length: 16 }, (_, i) => {
  const hora = 7 + i;
  return {
    inicio: `${String(hora).padStart(2, "0")}:00:00`,
    fin: `${String(hora + 1).padStart(2, "0")}:00:00`,
    label: `${String(hora).padStart(2, "0")}:00 – ${String(hora + 1).padStart(2, "0")}:00`,
  };
});

export default function NuevaReservaForm({ canchas }: { canchas: Cancha[] }) {
  const [state, action, pending] = useActionState(crearReserva, undefined);

  const [fecha, setFecha] = useState("");
  const [canchaId, setCanchaId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{
    inicio: string;
    fin: string;
  } | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [palasChecked, setPalasChecked] = useState(false);
  const [palasCantidad, setPalasCantidad] = useState(1);
  const [pelotasChecked, setPelotasChecked] = useState(false);
  const [pelotasCantidad, setPelotasCantidad] = useState(1);

  const argNow = new Date(Date.now() - 3 * 60 * 60 * 1000); // UTC-3 (Argentina)
  const today = argNow.toISOString().split("T")[0];
  const fechaEsPasada = fecha !== "" && fecha < today;
  const fechaEsHoy = fecha === today;
  const horaActual = fechaEsHoy ? argNow.getUTCHours() : -1;

  useEffect(() => {
    if (!fecha || !canchaId || fecha < today) {
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

  const slotsVisibles = fecha && canchaId && !fechaEsPasada;

  if (state?.success) {
    return (
      <div className="text-center py-8 space-y-5">
        <div className="text-5xl">✅</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">¡Solicitud enviada!</h2>
          <p className="text-gray-500 mt-2">
            El admin confirmará tu reserva a la brevedad.<br />
            Te notificaremos cuando esté lista.
          </p>
        </div>
        <Link
          href="/reservas"
          className="inline-block bg-blue-700 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-800 transition-colors text-sm"
        >
          Ver mis reservas
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-7">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

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
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition
            ${fechaEsPasada
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-500"
            }`}
        />
        {fechaEsPasada && (
          <p className="mt-1.5 text-sm text-red-600">
            La fecha ingresada no es válida.
          </p>
        )}
      </div>

      {/* Cancha */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">Cancha</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {canchas.map((c) => {
            const seleccionada = canchaId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCanchaId(seleccionada ? "" : c.id)}
                className={`text-left px-4 py-4 rounded-xl border-2 transition-colors
                  ${seleccionada
                    ? "border-blue-700 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
              >
                {/* TODO: insertar aquí SVG de cancha de pádel pintada con c.color */}
                <p className="font-semibold text-gray-900 text-base">{c.nombre}</p>
                <div className="mt-1">
                  <CanchaColorBadge color={c.color} />
                </div>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="cancha_id" value={canchaId} />
      </div>

      {/* Horarios */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-3">Horario</p>

        {!slotsVisibles ? (
          <p className="text-sm text-gray-400 italic">
            Elegí una fecha y una cancha para ver los horarios disponibles.
          </p>
        ) : loadingSlots ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="animate-spin h-4 w-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Cargando horarios...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HORARIOS.map((h) => {
              const slotHour = parseInt(h.inicio.slice(0, 2), 10);
              const pasado = fechaEsHoy && slotHour <= horaActual;
              const ocupado = occupiedSlots.some((o) =>
                o.startsWith(h.inicio.slice(0, 5))
              );
              const noDisponible = pasado || ocupado;
              const seleccionado = selectedSlot?.inicio === h.inicio;

              return (
                <button
                  key={h.inicio}
                  type="button"
                  disabled={noDisponible}
                  onClick={() =>
                    setSelectedSlot(seleccionado ? null : { inicio: h.inicio, fin: h.fin })
                  }
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors
                    ${
                      noDisponible
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

        {/* Inputs ocultos para el Server Action */}
        <input type="hidden" name="hora_inicio" value={selectedSlot?.inicio ?? ""} />
        <input type="hidden" name="hora_fin" value={selectedSlot?.fin ?? ""} />
      </div>

      {/* Equipamiento */}
      <div className="border border-blue-100 rounded-xl p-5 bg-blue-50/40 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          ¿Necesitás equipamiento?{" "}
          <span className="font-normal text-gray-500">(opcional)</span>
        </p>

        {/* Palas */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="palas"
            checked={palasChecked}
            onChange={(e) => setPalasChecked(e.target.checked)}
            className="w-4 h-4 accent-blue-700 rounded border-gray-300"
          />
          <label htmlFor="palas" className="text-sm font-medium text-gray-700 flex-1">
            Palas
          </label>
          {palasChecked && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Cantidad:</span>
              <select
                value={palasCantidad}
                onChange={(e) => setPalasCantidad(Number(e.target.value))}
                className="text-sm border border-blue-200 bg-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pelotas */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="pelotas"
            checked={pelotasChecked}
            onChange={(e) => setPelotasChecked(e.target.checked)}
            className="w-4 h-4 accent-blue-700 rounded border-gray-300"
          />
          <label htmlFor="pelotas" className="text-sm font-medium text-gray-700 flex-1">
            Pelotas
          </label>
          {pelotasChecked && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Cantidad:</span>
              <select
                value={pelotasCantidad}
                onChange={(e) => setPelotasCantidad(Number(e.target.value))}
                className="text-sm border border-blue-200 bg-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nota */}
        {(palasChecked || pelotasChecked) && (
          <textarea
            name="equipamiento_nota"
            rows={2}
            placeholder="Alguna aclaración..."
            className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}

        {/* Inputs ocultos para el Server Action */}
        <input type="hidden" name="pala_cantidad" value={palasChecked ? palasCantidad : 0} />
        <input type="hidden" name="pelota_cantidad" value={pelotasChecked ? pelotasCantidad : 0} />
      </div>

      <button
        type="submit"
        disabled={pending || !selectedSlot}
        className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Confirmando reserva..." : "Confirmar reserva"}
      </button>
    </form>
  );
}
