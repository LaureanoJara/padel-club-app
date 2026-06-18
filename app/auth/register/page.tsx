"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎾</div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Crear cuenta
          </h1>
          <p className="text-gray-500 mt-2">
            Registrate para reservar tus canchas
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                autoComplete="name"
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-blue-700 font-semibold hover:underline"
            >
              Iniciá sesión acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
