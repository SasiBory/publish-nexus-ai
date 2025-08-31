'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
  titleAssistant,
  type TitleAssistantOutput,
} from '@/ai/flows/title-assistant';

export function TitleAssistant() {
  const [topic, setTopic] = useState('');
  const [analysis, setAnalysis] = useState<TitleAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (topic.trim().length < 3) {
      toast({
        title: 'Tema Requerido',
        description:
          'Por favor, introduce un tema o palabra clave de al menos 3 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await titleAssistant({ topic });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Generación Fallida',
        description:
          'Ocurrió un error al generar las sugerencias. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            Asistente de Título y Subtítulo
          </CardTitle>
          <CardDescription>
            Introduce el tema de tu libro para generar sugerencias de títulos y
            subtítulos optimizados para KDP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Input
              placeholder="Ej: Novela de misterio, libro de recetas veganas..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze() }}
            />
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-48">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Generar Ideas
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            Buscando inspiración...
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Sugerencias Generadas</h2>
            {analysis.suggestions.map((suggestion, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                        <CardDescription>{suggestion.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground italic">
                            <span className="font-semibold not-italic">💡 Justificación:</span> {suggestion.reasoning}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </>
  );
}
