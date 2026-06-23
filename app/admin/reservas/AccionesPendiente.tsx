"use client";

import { useState, useTransition } from "react";
import { confirmarReserva, rechazarReserva, proponerAlternativa } from "@/lib/admin";
import type { Cancha } from "@/types";

const HORARIOS = Array.from({ length: 16 }, (_, i) => {
  const hora = 7 + i;
  return {
    value: `${String(hora).padStart(2, "0")}:00:00`,
    label: `${String(hora).padStart(2, "0")}:00 – ${String(hora + 1).padStart(2, "0")}:00`,
  };
});

type Modo = "rechazar" | "alternativa" | null;

export default function AccionesPendiente({
  reservaId,
  canchas,
}: {
  reservaId: string;
  canchas: Cancha[];
}) {
  const [modo, setModo] = useState<Modo>(null);
  const [isPending, startTransition] = useTransition();

  function handleProponerSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await proponerAlternativa(reservaId, formData);
      setModo(null);
    });
  }

  // ── Vista: rechazar ────────────────────────────────────────────────────────
  if (modo === "rechazar") {
    return (
      <form action={rechazarReserva.bind(null, reservaId)} className="space-y-2 w-44">
        <textarea
          name="motivo"
          required
          rows={2}
          placeholder="Motivo del rechazo…"
          className="w-full text-xs border border-red-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
        />
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 text-xs bg-red-600 text-white font-semibold px-2 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={() => setModo(null)}
            className="flex-1 text-xs bg-gray-100 text-gray-700 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-200"
          >
            Volver
          </button>
        </div>
      </form>
    );
  }

  // ── Vista: modal proponer alternativa ─────────────────────────────────────
  if (modo === "alternativa") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setModo(null)}
        />
        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 z-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Proponer alternativa
          </h3>

          <form onSubmit={handleProponerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancha alternativa
              </label>
              <select
                name="alternativa_cancha_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Elegí una cancha</option>
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario alternativo
              </label>
              <select
                name="alternativa_hora_inicio"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Elegí un horario</option>
                {HORARIOS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje{" "}
                <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                name="mensaje"
                rows={2}
                placeholder="Ej: La cancha 1 está en mantenimiento ese día."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setModo(null)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                {isPending ? "Enviando…" : "Enviar propuesta"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Vista: botones principales ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5">
      <form action={confirmarReserva.bind(null, reservaId)}>
        <button
          type="submit"
          disabled={isPending}
          className="w-full text-left text-xs text-green-700 hover:text-green-900 font-semibold hover:underline disabled:opacity-50"
        >
          ✓ Confirmar
        </button>
      </form>
      <button
        onClick={() => setModo("rechazar")}
        className="text-left text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
      >
        ✗ Rechazar
      </button>
      <button
        onClick={() => setModo("alternativa")}
        className="text-left text-xs text-blue-500 hover:text-blue-700 font-medium hover:underline"
      >
        ↔ Proponer alternativa
      </button>
    </div>
  );
}
