'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Upload, Sparkles, Eye, Contrast, Rows3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyzeCover, type AnalyzeCoverOutput } from '@/ai/flows/cover-analysis';

export function CoverAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeCoverOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setAnalysis(null);

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async () => {
      try {
        const coverDataUri = reader.result as string;
        const result = await analyzeCover({ coverDataUri });
        setAnalysis(result);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Análisis Fallido',
          description: 'Ocurrió un error durante el análisis de la portada. Por favor, inténtalo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error('Error al leer el archivo:', error);
        toast({
            title: 'Error al Leer Archivo',
            description: 'No se pudo leer el archivo de imagen seleccionado.',
            variant: 'destructive',
        });
        setIsLoading(false);
    };
  };

  const AnalysisItem = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Análisis de Portada con IA</CardTitle>
        <CardDescription>
          Sube tu portada para obtener comentarios sobre legibilidad, contraste y más.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-6">
          {preview ? (
            <Image
              src={preview}
              alt="Vista previa de la portada"
              width={200}
              height={300}
              className="max-h-[300px] w-auto rounded-md object-contain"
            />
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Arrastra y suelta tu portada aquí, o haz clic para buscar.
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            className="sr-only"
            id="cover-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="cover-upload">
              {preview ? 'Cambiar Imagen' : 'Subir Imagen'}
            </label>
          </Button>
          {preview && (
            <Button onClick={handleAnalyze} disabled={isLoading} className="mt-2 w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analizar Portada
            </Button>
          )}
        </div>
        <div className="space-y-6">
          {isLoading && (
             <div className="flex h-full flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Analizando tu portada...</p>
             </div>
          )}
          {analysis ? (
            <>
              <AnalysisItem icon={<Eye className="h-5 w-5" />} title="Legibilidad" text={analysis.legibility} />
              <AnalysisItem icon={<Contrast className="h-5 w-5" />} title="Contraste" text={analysis.contrast} />
              <AnalysisItem icon={<Rows3 className="h-5 w-5" />} title="Jerarquía Visual" text={analysis.visualHierarchy} />
              <AnalysisItem icon={<Sparkles className="h-5 w-5" />} title="Mapa de Calor de Atención" text={analysis.attentionHeatmap} />
            </>
          ) : !isLoading && (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-muted/50 p-6 text-center">
                <p className="text-muted-foreground">El análisis de tu portada aparecerá aquí.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

