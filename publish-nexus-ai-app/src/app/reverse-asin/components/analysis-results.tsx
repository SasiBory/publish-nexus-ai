import type { ReverseAsinAnalysisOutput } from '@/ai/flows/reverse-asin-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type AnalysisResultsProps = {
  analysis: ReverseAsinAnalysisOutput;
};

const competitionVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  Baja: 'default',
  Media: 'secondary',
  Alta: 'destructive',
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.productOverview}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.conversionMetrics}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Comparables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.comparableProducts}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Palabras Clave</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Palabra Clave</TableHead>
                <TableHead className="text-center">Volumen de Búsqueda</TableHead>
                <TableHead className="text-right">Competencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.derivedKeywords.map((kw, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell className="text-center">{kw.searchVolume}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={competitionVariant[kw.competition] || 'default'}
                      className={cn(
                        kw.competition === 'Baja' && 'bg-green-500/80 text-white',
                        kw.competition === 'Media' && 'bg-yellow-500/80 text-white',
                        kw.competition === 'Alta' && 'bg-red-500/80 text-white'
                      )}
                    >
                      {kw.competition}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
