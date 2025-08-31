'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Search, BookText, ShoppingCart, User, HelpCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  keywordExpander,
  type KeywordExpanderOutput,
} from '@/ai/flows/keyword-expander';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  seedKeyword: z.string().min(2, 'Por favor, introduce una palabra clave más larga.'),
  marketplace: z.string(),
  language: z.string(),
});

const intentConfig = {
    'Informativa': { icon: BookText, color: 'bg-blue-500/80' },
    'Comercial': { icon: ShoppingCart, color: 'bg-green-500/80' },
    'Marca': { icon: User, color: 'bg-purple-500/80' },
    'Desconocida': { icon: HelpCircle, color: 'bg-gray-500/80' }
};

type Intent = keyof typeof intentConfig;

export function KeywordExpander() {
  const [formData, setFormData] = useState({
    seedKeyword: '',
    marketplace: 'amazon.com',
    language: 'English',
  });
  const [analysis, setAnalysis] = useState<KeywordExpanderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const result = await keywordExpander(formData);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Análisis Fallido',
        description:
          'Ocurrió un error al expandir la palabra clave. Por favor, inténtalo de nuevo.',
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
          <CardTitle>Expansor de Palabras Clave</CardTitle>
          <CardDescription>
            Genera ideas de palabras clave a partir de una semilla, simulando el autocompletado de Amazon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="md:col-span-2">
              <Input
                placeholder="Ej: libros para colorear, novela romántica..."
                value={formData.seedKeyword}
                onChange={(e) => setFormData({ ...formData, seedKeyword: e.target.value })}
                disabled={isLoading}
              />
               {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>
            <Select
              value={formData.marketplace}
              onValueChange={(value) => setFormData({ ...formData, marketplace: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mercado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon.com">amazon.com</SelectItem>
                <SelectItem value="amazon.es">amazon.es</SelectItem>
                <SelectItem value="amazon.co.uk">amazon.co.uk</SelectItem>
                <SelectItem value="amazon.de">amazon.de</SelectItem>
                <SelectItem value="amazon.fr">amazon.fr</SelectItem>
                <SelectItem value="amazon.it">amazon.it</SelectItem>
                <SelectItem value="amazon.com.mx">amazon.com.mx</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Expandir
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Buscando sugerencias...</p>
        </div>
      )}

      {analysis && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Resultados de la Expansión</CardTitle>
                <CardDescription>Se encontraron {analysis.keywords.length} palabras clave relacionadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Palabra Clave</TableHead>
                            <TableHead className="text-right">Intención de Búsqueda</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analysis.keywords.map((kw, index) => {
                           const config = intentConfig[kw.intent as Intent] || intentConfig['Desconocida'];
                           const Icon = config.icon;
                           return (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{kw.keyword}</TableCell>
                                <TableCell className="text-right">
                                     <Badge variant="default" className={cn("text-white", config.color)}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        {kw.intent}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                           )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </>
  );
}

