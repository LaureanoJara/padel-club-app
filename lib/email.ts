import { Resend } from "resend";
import type { TipoNotificacion } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

type DetallesEmail = {
  canchaName: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
  alternativaCancha?: string;
  alternativaHoraInicio?: string;
  alternativaHoraFin?: string;
  mensajeAdmin?: string;
};

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildHtml(tipo: TipoNotificacion, d: DetallesEmail): { subject: string; html: string } {
  const base = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2937">
      <h1 style="font-size:20px;font-weight:700;color:#1d4ed8;margin-bottom:4px">🎾 Pádel Club</h1>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
  `;
  const footer = `
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="font-size:12px;color:#9ca3af">Este es un mensaje automático. Ingresá a la app para gestionar tus reservas.</p>
    </div>
  `;
  const detalle = `
    <p style="margin:4px 0"><strong>Cancha:</strong> ${d.canchaName}</p>
    <p style="margin:4px 0"><strong>Fecha:</strong> ${formatFecha(d.fecha)}</p>
    <p style="margin:4px 0"><strong>Horario:</strong> ${d.horaInicio} – ${d.horaFin} hs</p>
  `;

  if (tipo === "confirmada") {
    return {
      subject: "✅ Tu reserva fue confirmada — Pádel Club",
      html: `${base}
        <h2 style="font-size:18px;color:#15803d">¡Reserva confirmada! ✅</h2>
        <p>Tu solicitud fue aprobada. Te esperamos en la cancha.</p>
        <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0">${detalle}</div>
        ${footer}`,
    };
  }

  if (tipo === "rechazada") {
    return {
      subject: "❌ Tu reserva no pudo ser confirmada — Pádel Club",
      html: `${base}
        <h2 style="font-size:18px;color:#dc2626">Reserva rechazada ❌</h2>
        <p>Lo sentimos, tu solicitud no pudo ser confirmada.</p>
        <div style="background:#fef2f2;border-radius:8px;padding:16px;margin:16px 0">
          ${detalle}
          ${d.motivo ? `<p style="margin:8px 0"><strong>Motivo:</strong> ${d.motivo}</p>` : ""}
        </div>
        <p>Podés solicitar otro horario desde la app.</p>
        ${footer}`,
    };
  }

  // propuesta_alternativa
  return {
    subject: "🔄 Hay una propuesta alternativa para tu reserva — Pádel Club",
    html: `${base}
      <h2 style="font-size:18px;color:#1d4ed8">Propuesta alternativa 🔄</h2>
      <p>Tu reserva original no está disponible, pero el equipo te propone una alternativa.</p>
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:600;color:#6b7280">Reserva original</p>
        ${detalle}
        <hr style="border:none;border-top:1px solid #bfdbfe;margin:12px 0">
        <p style="margin:0 0 8px;font-weight:600;color:#1d4ed8">Alternativa propuesta</p>
        <p style="margin:4px 0"><strong>Cancha:</strong> ${d.alternativaCancha ?? "—"}</p>
        <p style="margin:4px 0"><strong>Horario:</strong> ${d.alternativaHoraInicio} – ${d.alternativaHoraFin} hs</p>
        ${d.mensajeAdmin ? `<p style="margin:8px 0"><strong>Mensaje:</strong> ${d.mensajeAdmin}</p>` : ""}
      </div>
      <p>Ingresá a la app para <strong>aceptar o rechazar</strong> la propuesta.</p>
      ${footer}`,
  };
}

export async function enviarEmailNotificacion(
  email: string,
  tipo: TipoNotificacion,
  detalles: DetallesEmail
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY no configurada, omitiendo envío.");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Pádel Club <onboarding@resend.dev>";
  const { subject, html } = buildHtml(tipo, detalles);

  try {
    await resend.emails.send({ from, to: email, subject, html });
  } catch (err) {
    // El error de email no bloquea la operación principal
    console.error("[email] Error al enviar:", err);
  }
}
