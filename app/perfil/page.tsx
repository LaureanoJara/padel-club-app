import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPerfil } from "@/lib/perfil";
import PerfilPagina from "./PerfilPagina";

export default async function PerfilPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const perfil = await getPerfil();

  return <PerfilPagina perfil={perfil} email={user.email ?? ""} />;
}
