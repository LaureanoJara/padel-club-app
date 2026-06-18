import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionWithRol, signOut } from "@/lib/auth";

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
                  {rol === "admin" && (
                    <Link
                      href="/admin"
                      className="hover:text-blue-200 transition-colors"
                    >
                      Panel Admin
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
