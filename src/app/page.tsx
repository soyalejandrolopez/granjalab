import Link from 'next/link';
import { Leaf, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Developer Info Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-center font-medium">
            DESARROLLADO POR ALEJANDRO LOPEZ MURILLO - UNAD - UNIVERSIDAD NACIONAL ABIERTA Y A DISTANCIA
            <span className="mx-2">|</span>
            PROTOTIPO PROYECTO DE INGENIERIA 1 ~ NOV 2025
          </p>
        </div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-7 h-7 text-green-600" />
              <span className="text-xl font-bold text-gray-900">ReciclajeApp</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="py-16 sm:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Conectamos residuos orgánicos con{' '}
              <span className="text-green-600">oportunidades sostenibles</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Plataforma digital que une a productores de residuos orgánicos con recicladores,
              gestores y emprendedores para crear un ecosistema circular y sustentable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Comenzar Ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-12 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestión Eficiente
            </h3>
            <p className="text-gray-600 text-sm">
              Registra y administra tus residuos orgánicos de manera simple y efectiva.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conexión Directa
            </h3>
            <p className="text-gray-600 text-sm">
              Conecta productores con recicladores y gestores de forma directa y transparente.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Métricas en Tiempo Real
            </h3>
            <p className="text-gray-600 text-sm">
              Visualiza el impacto de tus acciones con reportes y estadísticas detalladas.
            </p>
          </div>
        </div>

        {/* Roles Section */}
        <div className="py-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            ¿Quién puede usar ReciclajeApp?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Productores</h3>
              <p className="text-sm text-gray-600">
                Plazas de mercado y restaurantes que generan residuos orgánicos.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Recicladores</h3>
              <p className="text-sm text-gray-600">
                Grupos de compostaje y emprendedores que valorizan residuos.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Gestores</h3>
              <p className="text-sm text-gray-600">
                Granjas y organizaciones que procesan y utilizan residuos orgánicos.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">ReciclajeApp</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 ReciclajeApp. Plataforma de gestión de residuos orgánicos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
