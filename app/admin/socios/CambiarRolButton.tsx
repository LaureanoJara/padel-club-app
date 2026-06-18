"use client";

export function CambiarRolButton({
  action,
  rolActual,
  esYoMismo,
}: {
  action: (formData: FormData) => Promise<void>;
  rolActual: "socio" | "admin";
  esYoMismo: boolean;
}) {
  if (esYoMismo) {
    return <span className="text-xs text-gray-400 italic">Tu cuenta</span>;
  }

  const mensaje =
    rolActual === "socio"
      ? "¿Estás seguro que querés hacer admin a este usuario?"
      : "¿Estás seguro que querés quitarle el rol admin?";

  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(mensaje)) e.preventDefault();
        }}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
          ${
            rolActual === "socio"
              ? "border-blue-300 text-blue-600 hover:bg-blue-50"
              : "border-orange-300 text-orange-600 hover:bg-orange-50"
          }`}
      >
        {rolActual === "socio" ? "Hacer admin" : "Quitar admin"}
      </button>
    </form>
  );
}
