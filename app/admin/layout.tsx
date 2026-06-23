import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getConteoReservasPendientes } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/");

  const pendientes = await getConteoReservasPendientes();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/reservas", label: "Reservas", badge: pendientes },
    { href: "/admin/canchas", label: "Canchas" },
    { href: "/admin/socios", label: "Socios" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Subnav del panel */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
          Panel de Administración
        </p>
        <div className="flex gap-1 border-b border-gray-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-t-lg transition-colors inline-flex items-center gap-1.5"
            >
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
