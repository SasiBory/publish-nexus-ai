import Link from 'next/link';

const MarketResearchIcon = () => <span>📈</span>;
const ListingOptimizerIcon = () => <span>📝</span>;
const CoverStudioIcon = () => <span>🎨</span>;
const CompilanceCenterIcon = () => <span>⚖️</span>;

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-nexus-bg-light text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-nexus-dark p-6 text-white">
        <h1 className="mb-10 text-2xl font-bold text-nexus-orange">
          <Link href="/">Publish Nexus</Link>
        </h1>
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/market-research" className="flex items-center rounded-lg p-2 hover:bg-gray-700">
                <MarketResearchIcon />
                <span className="ml-3">Análisis de Mercado</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/listing-optimizer" className="flex items-center rounded-lg p-2 hover:bg-gray-700">
                <ListingOptimizerIcon />
                <span className="ml-3">Optimizador de Listing</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/cover-studio" className="flex items-center rounded-lg p-2 hover:bg-gray-700">
                <CoverStudioIcon />
                <span className="ml-3">Estudio de Portadas</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/compilance-center" className="flex items-center rounded-lg p-2 hover:bg-gray-700">
                <CompilanceCenterIcon />
                <span className="ml-3">Centro de Cumplimiento</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold text-nexus-dark">Dashboard Principal</h2>
        <p className="text-gray-600">Bienvenido a tu centro de mando.</p>
        
        <div className="mt-8 p-6 border border-nexus-gray-light rounded-lg bg-white shadow-sm">
          <h3 className="font-bold text-lg text-nexus-dark">Estado Actual</h3>
          <p className="text-gray-700 mt-2">Dashboard en desarrollo...</p>
          <p className="text-gray-500 text-sm mt-4">Selecciona un módulo de la barra lateral para comenzar.</p>
        </div>
      </main>
    </div>
  );
}
