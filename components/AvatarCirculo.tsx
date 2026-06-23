type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, { wrap: string; text: string; border: string }> = {
  sm: { wrap: "w-8 h-8",  text: "text-sm",  border: "border-2" },
  md: { wrap: "w-12 h-12", text: "text-base", border: "border-2" },
  lg: { wrap: "w-24 h-24", text: "text-3xl",  border: "border-4" },
};

export default function AvatarCirculo({
  url,
  nombre,
  size = "md",
}: {
  url?: string | null;
  nombre?: string | null;
  size?: Size;
}) {
  const { wrap, text, border } = sizeClasses[size];

  if (url) {
    return (
      <img
        src={url}
        alt="Foto de perfil"
        className={`${wrap} ${border} rounded-full object-cover border-white shadow shrink-0`}
      />
    );
  }

  const inicial = (nombre ?? "U").charAt(0).toUpperCase();
  return (
    <div
      className={`${wrap} ${text} ${border} rounded-full bg-blue-700 flex items-center justify-center text-white font-bold shadow border-white shrink-0`}
    >
      {inicial}
    </div>
  );
}
