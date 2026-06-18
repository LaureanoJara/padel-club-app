"use client";

type Props = {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ModalConfirmacion({
  isOpen,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancelar}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 z-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{titulo}</h2>
        <p className="text-gray-600 mb-8">{mensaje}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirmar}
            className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            Sí, cancelar reserva
          </button>
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
