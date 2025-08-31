'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import {
  complianceCheck,
  type ComplianceCheckOutput,
} from '@/ai/flows/compliance-check';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Issue = ComplianceCheckOutput['kdpTOS'][0];

const riskVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  Bajo: 'default',
  Medio: 'secondary',
  Alto: 'destructive',
};

const riskColorClass: Record<string, string> = {
  Bajo: 'border-green-500/50 bg-green-500/10',
  Medio: 'border-yellow-500/50 bg-yellow-500/10',
  Alto: 'border-red-500/50 bg-red-500/10',
};

export default function ComplianceCenterPage() {
  const [listingText, setListingText] = useState('');
  const [analysis, setAnalysis] = useState<ComplianceCheckOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!listingText.trim()) {
      toast({
        title: 'Texto Requerido',
        description: 'Por favor, introduce el texto de tu anuncio para analizar.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await complianceCheck({ listingText });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Análisis Fallido',
        description: 'Ocurrió un error al analizar el texto. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <div className={cn("p-4 rounded-md border", riskColorClass[issue.riskLevel])}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{issue.issue}</h4>
        <Badge variant={riskVariant[issue.riskLevel]}>{issue.riskLevel}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{issue.suggestion}</p>
    </div>
  );

  const renderSection = (title: string, issues: Issue[]) => {
    if (issues.length === 0) return null;
    return (
      <AccordionItem value={title.toLowerCase().replace(' ', '-')}>
        <AccordionTrigger>
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {title} ({issues.length})
            </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          {issues.map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  const totalIssues = analysis
  ? analysis.kdpTOS.length + analysis.copyright.length + analysis.trademark.length
  : 0;

  return (
    <div className="container mx-auto max-w-4xl py-8">
       <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Centro de Cumplimiento</h1>
        <p className="mt-2 text-muted-foreground">
          Simplifica las políticas de KDP. Analiza el texto de tu anuncio para detectar riesgos de cumplimiento.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Detector de Riesgos</CardTitle>
          <CardDescription>
            Pega el texto de tu anuncio (descripción, etc.) para buscar posibles problemas con los TOS, derechos de autor y marcas registradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <Textarea
              placeholder="Pega aquí el texto de tu descripción..."
              value={listingText}
              onChange={(e) => setListingText(e.target.value)}
              rows={10}
              disabled={isLoading}
            />
            <Button onClick={handleAnalyze} disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Shield className="mr-2 h-5 w-5" />
              )}
              Analizar Cumplimiento
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Analizando texto...</p>
        </div>
      )}

      {analysis && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {analysis.overallVerdict === 'Aprobado' ? (
                        <CheckCircle className="h-7 w-7 text-green-600" />
                    ) : (
                        <AlertTriangle className="h-7 w-7 text-destructive" />
                    )}
                    Resultado del Análisis: {analysis.overallVerdict}
                </CardTitle>
                 <CardDescription>
                    {totalIssues > 0 ? `Se encontraron ${totalIssues} problema(s) potencial(es).` : '¡Buen trabajo! No se encontraron problemas obvios de cumplimiento.'}
                </CardDescription>
            </CardHeader>
            {totalIssues > 0 && (
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {renderSection('Términos de Servicio KDP', analysis.kdpTOS)}
                        {renderSection('Derechos de Autor', analysis.copyright)}
                        {renderSection('Marcas Registradas', analysis.trademark)}
                    </Accordion>
                </CardContent>
            )}
        </Card>
      )}
    </div>
  );
}
