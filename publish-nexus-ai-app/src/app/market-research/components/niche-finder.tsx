'use client';

import { useState, type FormEvent } from 'react';
import { BarChart, Compass, Gauge, Loader2, Search, Zap } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  nicheAnalysis,
  type NicheAnalysisOutput,
} from '@/ai/flows/niche-analysis';

const formSchema = z.object({
  nicheKeyword: z.string().min(3, 'Por favor, introduce una palabra clave más larga.'),
});

const ResultCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export function NicheFinder() {
  const [keyword, setKeyword] = useState('');
  const [analysis, setAnalysis] = useState<NicheAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const validation = formSchema.safeParse({ nicheKeyword: keyword });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const result = await nicheAnalysis({ nicheKeyword: keyword });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Análisis Fallido',
        description:
          'Ocurrió un error al analizar el nicho. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Buscador de Nichos</CardTitle>
          <CardDescription>
            Introduce una palabra clave para evaluar el potencial de un nicho.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-start gap-4">
            <div className="flex-1">
              <Input
                id="niche"
                placeholder="Ej: libros de colorear de dinosaurios, novela de ciencia ficción..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-32">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Analizar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Investigando el nicho...</p>
        </div>
      )}

      {analysis && (
        <div className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ResultCard icon={<Compass className="h-4 w-4 text-muted-foreground" />} title="Tamaño del Nicho" value={analysis.nicheSize} />
                <ResultCard icon={<Gauge className="h-4 w-4 text-muted-foreground" />} title="Competencia" value={analysis.competitionLevel} />
                <ResultCard icon={<BarChart className="h-4 w-4 text-muted-foreground" />} title="BSR Promedio" value={analysis.averageBSR} />
                <ResultCard icon={<Zap className="h-4 w-4 text-muted-foreground" />} title="Estacionalidad" value={analysis.seasonality} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recomendación de la IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{analysis.recommendation}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}

