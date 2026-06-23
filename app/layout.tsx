import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionWithRol, signOut } from "@/lib/auth";
import { getConteoNoLeidas } from "@/lib/notificaciones";
import { getConteoReservasPendientes } from "@/lib/admin";
import { getAvatarUrl } from "@/lib/perfil";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pádel Club",
  description: "Reservá tu cancha de pádel online",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, rol } = await getSessionWithRol();
  const nombre =
    user?.user_metadata?.nombre ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const [conteoNotif, conteoPendientes, avatarUrl] = user
    ? await Promise.all([
        getConteoNoLeidas(),
        rol === "admin" ? getConteoReservasPendientes() : Promise.resolve(0),
        getAvatarUrl(),
      ])
    : [0, 0, null];

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="bg-blue-700 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight hover:text-blue-200 transition-colors"
            >
              🎾 Pádel Club
            </Link>

            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-blue-200 transition-colors">
                Inicio
              </Link>

              {user ? (
                <>
                  <Link
                    href="/reservas"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Mis Reservas
                  </Link>

                  <Link
                    href="/perfil"
                    className="hover:opacity-80 transition-opacity"
                    title="Mi Perfil"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Mi perfil"
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
                      />
                    ) : (
                      <span className="hover:text-blue-200 transition-colors">
                        Mi Perfil
                      </span>
                    )}
                  </Link>

                  {/* Campana de notificaciones */}
                  <Link
                    href="/notificaciones"
                    className="relative hover:text-blue-200 transition-colors"
                    title="Notificaciones"
                  >
                    🔔
                    {conteoNotif > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 text-white rounded-full leading-none">
                        {conteoNotif > 9 ? "9+" : conteoNotif}
                      </span>
                    )}
                  </Link>

                  {rol === "admin" && (
                    <Link
                      href="/admin"
                      className="relative hover:text-blue-200 transition-colors inline-flex items-center gap-1"
                    >
                      Panel Admin
                      {conteoPendientes > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                          {conteoPendientes}
                        </span>
                      )}
                    </Link>
                  )}
                  <span className="text-blue-200 hidden sm:inline">
                    Hola, {nombre}
                  </span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
