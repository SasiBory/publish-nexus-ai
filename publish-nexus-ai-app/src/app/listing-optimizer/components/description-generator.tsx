'use client';

import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  descriptionAssistant,
  type DescriptionAssistantOutput,
} from '@/ai/flows/description-assistant';
import { Badge } from '@/components/ui/badge';

export function DescriptionGenerator() {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [analysis, setAnalysis] = useState<DescriptionAssistantOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (topic.trim().length < 3 || targetAudience.trim().length < 3) {
      toast({
        title: 'Información Requerida',
        description:
          'Por favor, completa el tema y el público objetivo (mín. 3 caracteres cada uno).',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const keywordsArray = keywords.split(',').map(kw => kw.trim()).filter(Boolean);
      const result = await descriptionAssistant({ topic, targetAudience, keywords: keywordsArray });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Generación Fallida',
        description:
          'Ocurrió un error al generar las descripciones. Por favor, inténtalo de nuevo.',
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
          <CardTitle>Generador de Descripciones con IA</CardTitle>
          <CardDescription>
            Crea descripciones de libros persuasivas y optimizadas para SEO que cautiven a los lectores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="topic">Tema / Género del Libro</Label>
                    <Input id="topic" placeholder="Ej: Thriller psicológico, Guía de productividad..." value={topic} onChange={e => setTopic(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audience">Público Objetivo</Label>
                    <Input id="audience" placeholder="Ej: Jóvenes adultos, emprendedores, amantes de la fantasía..." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} disabled={isLoading} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="keywords">Palabras Clave (separadas por comas)</Label>
                <Textarea id="keywords" placeholder="Ej: misterio, suspense, desarrollo personal, hábitos atómicos..." value={keywords} onChange={e => setKeywords(e.target.value)} disabled={isLoading} rows={2} />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Generar Descripciones
            </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            Creando descripciones irresistibles...
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Descripciones Generadas</h2>
            {analysis.suggestions.map((suggestion, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                             <Badge variant="secondary">{suggestion.style}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none text-card-foreground [&_strong]:text-card-foreground [&_em]:text-card-foreground/90"
                            dangerouslySetInnerHTML={{ __html: suggestion.description }}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </>
  );
}