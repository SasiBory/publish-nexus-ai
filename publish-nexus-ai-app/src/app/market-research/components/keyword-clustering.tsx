'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Group } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  keywordClustering,
  type KeywordClusteringOutput,
} from '@/ai/flows/keyword-clustering';
import { Badge } from '@/components/ui/badge';

export function KeywordClustering() {
  const [keywordsText, setKeywordsText] = useState('');
  const [analysis, setAnalysis] = useState<KeywordClusteringOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysis(null);

    const keywords = keywordsText
      .split('\n')
      .map((kw) => kw.trim())
      .filter(Boolean);

    if (keywords.length < 5) {
      toast({
        title: 'Insuficientes Palabras Clave',
        description: 'Por favor, introduce al menos 5 palabras clave para agrupar.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await keywordClustering({ keywords });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Análisis Fallido',
        description:
          'Ocurrió un error al agrupar las palabras clave. Por favor, inténtalo de nuevo.',
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
          <CardTitle>Análisis de Clusters de Keywords</CardTitle>
          <CardDescription>
            Pega tu lista de palabras clave (una por línea) para agruparlas por
            tema e intención.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid w-full gap-4">
            <Textarea
              placeholder="Pega aquí tu lista de palabras clave..."
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              rows={10}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Group className="mr-2 h-5 w-5" />
                  Agrupar Palabras Clave
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            Agrupando keywords... Esto puede tardar un momento.
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Clusters Encontrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.clusters.map((cluster, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{cluster.clusterName}</CardTitle>
                        <CardDescription>{cluster.keywords.length} keywords</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {cluster.keywords.map((kw, kwIndex) => (
                            <Badge key={kwIndex} variant="secondary">{kw}</Badge>
                        ))}
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>
      )}
    </>
  );
}

