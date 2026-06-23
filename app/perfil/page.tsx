import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPerfil } from "@/lib/perfil";
import { getAmigosAceptados, getParejaInfo } from "@/lib/socios";
import PerfilPagina from "./PerfilPagina";

export default async function PerfilPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const [perfil, amigos] = await Promise.all([getPerfil(), getAmigosAceptados()]);

  let parejaInfo: { id: string; nombre: string; avatar_url: string | null } | null = null;
  if (perfil?.pareja_id) {
    parejaInfo = await getParejaInfo(perfil.pareja_id);
  }

  return (
    <PerfilPagina
      perfil={perfil}
      email={user.email ?? ""}
      amigos={amigos}
      parejaInfo={parejaInfo}
    />
  );
}
