import { AnalysisForm } from './components/analysis-form';

export default function ReverseAsinPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Análisis de ASIN Inverso</h1>
        <p className="mt-2 text-muted-foreground">
          Introduce un ASIN para obtener una vista 360° del producto, incluyendo métricas de conversión, comparables y palabras clave.
        </p>
      </div>

      <div className="mt-8">
        <AnalysisForm />
      </div>
    </div>
  );
}