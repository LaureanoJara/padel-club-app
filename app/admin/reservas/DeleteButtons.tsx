"use client";

export function EliminarCanceladasBtn({
  action,
  count,
}: {
  action: (formData: FormData) => Promise<void>;
  count: number;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `¿Eliminar las ${count} reserva${count !== 1 ? "s" : ""} cancelada${count !== 1 ? "s" : ""}? Esta acción no se puede deshacer.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={count === 0}
        className="shrink-0 bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Eliminar canceladas ({count})
      </button>
    </form>
  );
}

export function EliminarReservaBtn({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "¿Eliminar esta reserva permanentemente? Esta acción no se puede deshacer."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
      >
        Eliminar
      </button>
    </form>
  );
}
