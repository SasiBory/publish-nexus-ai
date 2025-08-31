import { NicheFinder } from './components/niche-finder';
import { KeywordExpander } from './components/keyword-expander';
import { KeywordClustering } from './components/keyword-clustering';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MarketResearchPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Investigación de Mercado</h1>
        <p className="mt-2 text-muted-foreground">
          Descubre nichos rentables y analiza palabras clave para tomar decisiones basadas en datos.
        </p>
      </div>

      <Tabs defaultValue="niche-finder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="niche-finder">Buscador de Nichos</TabsTrigger>
          <TabsTrigger value="keyword-expander">Expansor de Keywords</TabsTrigger>
          <TabsTrigger value="keyword-clustering">Clusters de Keywords</TabsTrigger>
        </TabsList>
        <TabsContent value="niche-finder">
          <div className="mt-4">
            <NicheFinder />
          </div>
        </TabsContent>
        <TabsContent value="keyword-expander">
           <div className="mt-4">
            <KeywordExpander />
          </div>
        </TabsContent>
        <TabsContent value="keyword-clustering">
           <div className="mt-4">
            <KeywordClustering />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
