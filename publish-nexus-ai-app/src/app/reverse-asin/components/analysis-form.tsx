'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type ReverseAsinAnalysisOutput } from '@/ai/flows/reverse-asin-analysis';
import { AnalysisResults } from './analysis-results';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  asin: z.string().min(10, "Por favor, introduce un ASIN válido.").max(10, "Por favor, introduce un ASIN válido."),
});

export function AnalysisForm() {
  const [asin, setAsin] = useState('');
  const [analysis, setAnalysis] = useState<ReverseAsinAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const handleAnalysis = useCallback(async (asinToAnalyze: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const validation = formSchema.safeParse({ asin: asinToAnalyze });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/get-asin-analysis?asin=${asinToAnalyze}`);
      const data = await response.json();

      if (response.ok) {
        if (data.aiAnalysis) {
          setAnalysis(data.aiAnalysis);
          toast({
            title: 'Análisis Encontrado',
            description: 'Se ha cargado el análisis existente para este ASIN.',
          });
        } else {
          // This case should ideally not happen if response.ok and data.aiAnalysis is checked
          setError('No se encontró un análisis completo para este ASIN.');
          toast({
            title: 'Análisis No Encontrado',
            description: 'No se encontró un análisis completo para este ASIN. Asegúrate de que haya sido capturado y procesado.',
            variant: 'info',
          });
        }
      } else {
        // Handle errors from the API, e.g., 404 for no analysis found
        if (response.status === 404) {
          setError('No se encontró un análisis para este ASIN. Por favor, asegúrate de que haya sido capturado y procesado.');
          toast({
            title: 'Análisis No Encontrado',
            description: 'No se encontró un análisis para este ASIN. Por favor, asegúrate de que haya sido capturado y procesado.',
            variant: 'info',
          });
        } else {
          setError(data.message || 'Ocurrió un error al buscar el análisis.');
          toast({
            title: 'Error al Buscar Análisis',
            description: data.message || 'Ocurrió un error inesperado al buscar el análisis del ASIN.',
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Por favor, verifica tu red.');
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo conectar con el servidor para buscar el análisis del ASIN.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const asinFromUrl = searchParams.get('asin');
    if (asinFromUrl) {
      setAsin(asinFromUrl);
      // Automatically trigger analysis if ASIN from URL is valid
      handleAnalysis(asinFromUrl);
    }
  }, [searchParams, handleAnalysis]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAnalysis(asin);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex items-start gap-4">
            <div className="flex-1">
              <Input
                id="asin"
                placeholder="Introduce el ASIN del libro (ej., B09X5PJD2B)"
                value={asin}
                onChange={(e) => setAsin(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
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
          <p className="mt-2 text-muted-foreground">Analizando... Esto puede tardar un momento.</p>
        </div>
      )}

      {analysis && <AnalysisResults analysis={analysis} />}
    </>
  );
}