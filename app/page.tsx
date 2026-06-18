import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Bienvenido al Pádel Club
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Reservá tu cancha de pádel de forma rápida y sencilla. Elegí el horario que más te conviene y disfrutá del juego.
          </p>
          <Link
            href="/reservas/nueva"
            className="inline-block bg-white text-blue-700 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
          >
            Reservar una cancha
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue-50">
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Canchas de primera</h3>
              <p className="text-gray-600">Contamos con canchas en excelente estado para que disfrutes al máximo.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue-50">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Reservas online</h3>
              <p className="text-gray-600">Reservá en segundos desde cualquier dispositivo, las 24 horas del día.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-blue-50">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Confirmación inmediata</h3>
              <p className="text-gray-600">Recibí la confirmación de tu turno al instante, sin esperas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para jugar?</h2>
        <p className="text-blue-200 mb-8 text-lg">Encontrá el horario perfecto y asegurá tu cancha hoy.</p>
        <Link
          href="/reservas/nueva"
          className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-colors"
        >
          Ver disponibilidad
        </Link>
      </section>
    </div>
  );
}
