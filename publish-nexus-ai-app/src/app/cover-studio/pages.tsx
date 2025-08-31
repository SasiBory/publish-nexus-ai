import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoverAnalyzer } from "./components/cover-analyzer"
import { CoverDesigner } from "./components/cover-designer"

export default function CoverStudioPage() {
  return (
    <div className="container mx-auto max-w-6xl py-8">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Estudio de Portadas</h1>
        <p className="mt-2 text-muted-foreground">
          Analiza la efectividad de la portada de tu libro y obtén sugerencias de diseño.
        </p>
      </div>

      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Analizador IA</TabsTrigger>
          <TabsTrigger value="designer">Diseñador</TabsTrigger>
        </TabsList>
        <TabsContent value="analyzer">
          <CoverAnalyzer />
        </TabsContent>
        <TabsContent value="designer">
          <CoverDesigner />
        </TabsContent>
      </Tabs>
    </div>
  )
}
