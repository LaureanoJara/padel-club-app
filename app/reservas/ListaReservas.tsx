"use client";

import { useState, useTransition } from "react";
import { cancelarReserva } from "@/lib/reservas";
import ModalConfirmacion from "@/components/ModalConfirmacion";
import type { ReservaConCancha } from "@/lib/reservas";

const estadoBadge: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-gray-100 text-gray-500",
};

type ReservaSeleccionada = {
  id: string;
  detalle: string;
};

export default function ListaReservas({
  reservas,
}: {
  reservas: ReservaConCancha[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<ReservaSeleccionada | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function abrirModal(reserva: ReservaConCancha) {
    const horaInicio = reserva.hora_inicio.slice(0, 5);
    const horaFin = reserva.hora_fin.slice(0, 5);
    const fechaFormateada = new Date(
      reserva.fecha + "T00:00:00"
    ).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setSeleccionada({
      id: reserva.id,
      detalle: `${reserva.canchas?.nombre ?? "Cancha"} · ${fechaFormateada} · ${horaInicio} – ${horaFin} hs`,
    });
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setSeleccionada(null);
  }

  function confirmarCancelacion() {
    if (!seleccionada) return;
    startTransition(async () => {
      await cancelarReserva(seleccionada.id, new FormData());
      cerrarModal();
    });
  }

  return (
    <>
      <div className="space-y-4">
        {reservas.map((reserva) => {
          const cancelada = reserva.estado === "cancelada";
          const horaInicio = reserva.hora_inicio.slice(0, 5);
          const horaFin = reserva.hora_fin.slice(0, 5);
          const fechaFormateada = new Date(
            reserva.fecha + "T00:00:00"
          ).toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div
              key={reserva.id}
              className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between gap-4 transition-opacity
                ${cancelada ? "opacity-60 border-gray-200" : "border-blue-100"}`}
            >
              <div className={cancelada ? "line-through text-gray-400" : ""}>
                <p className="font-semibold text-gray-900 text-lg">
                  {reserva.canchas?.nombre ?? "Cancha"}
                </p>
                <p className="text-gray-500 text-sm mt-0.5 capitalize">
                  {fechaFormateada}
                </p>
                <p className="text-blue-700 font-medium text-sm mt-1">
                  {horaInicio} – {horaFin} hs
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
                    ${estadoBadge[reserva.estado] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {reserva.estado}
                </span>

                {!cancelada && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => abrirModal(reserva)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ModalConfirmacion
        isOpen={modalOpen}
        titulo="¿Cancelar reserva?"
        mensaje={seleccionada?.detalle ?? ""}
        onConfirmar={confirmarCancelacion}
        onCancelar={cerrarModal}
      />
    </>
  );
}
