import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTodosLosSocios } from "@/lib/socios";
import ListaSocios from "./ListaSocios";

export default async function SociosPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const socios = await getTodosLosSocios();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Socios</h1>
        <p className="text-gray-500 mt-1">
          {socios.length} socio{socios.length !== 1 ? "s" : ""} en el club
        </p>
      </div>
      <ListaSocios socios={socios} />
    </div>
  );
}
