import { Lightbulb, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TitleAssistant } from './components/title-assistant';
import { DescriptionGenerator } from './components/description-generator';

export default function ListingOptimizerPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Optimizador de Anuncios
        </h1>
        <p className="mt-2 text-muted-foreground">
          Herramientas de IA para crear títulos, descripciones y palabras clave
          que venden.
        </p>
      </div>

      <Tabs defaultValue="title-assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="title-assistant">
            <Lightbulb className="mr-2 h-5 w-5" />
            Asistente de Títulos
          </TabsTrigger>
          <TabsTrigger value="description-generator">
            <FileText className="mr-2 h-5 w-5" />
            Generador de Descripciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="title-assistant">
            <TitleAssistant />
        </TabsContent>
        <TabsContent value="description-generator">
            <DescriptionGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
