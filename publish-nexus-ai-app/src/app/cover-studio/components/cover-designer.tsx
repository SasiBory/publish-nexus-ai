import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function CoverDesigner() {
  const fonts = ['Merriweather', 'Lato', 'Playfair Display', 'Oswald'];
  const colors = ['#8E44AD', '#2C3E50', '#E74C3C', '#1ABC9C', '#F1C40F'];
  const templates = [
    { title: 'Thriller Moderno', src: 'https://placehold.co/300x450.png', hint: 'book cover' },
    { title: 'Romance Clásico', src: 'https://placehold.co/300x450.png', hint: 'book cover' },
    { title: 'Aventura Sci-Fi', src: 'https://placehold.co/300x450.png', hint: 'book cover' },
    { title: 'No Ficción Minimalista', src: 'https://placehold.co/300x450.png', hint: 'book cover' },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Diseñador de Portadas</CardTitle>
        <CardDescription>
          Obtén sugerencias de diseño específicas para tu nicho y plantillas listas para imprimir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold">Fuentes Sugeridas</h3>
          <p className="text-sm text-muted-foreground mb-4">Basado en el nicho &quot;Thriller&quot;.</p>
          <div className="flex flex-wrap gap-4">
            {fonts.map((font) => (
              <div key={font} className="p-4 border rounded-md bg-background">
                <span className="text-2xl" style={{ fontFamily: font }}>{font}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold">Paletas de Colores</h3>
           <p className="text-sm text-muted-foreground mb-4">Paletas populares para portadas de &quot;Thriller&quot;.</p>
          <div className="flex flex-wrap gap-4">
            {colors.map((color) => (
              <div key={color} style={{ backgroundColor: color }} className="h-16 w-16 rounded-md shadow-md" />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold">Plantillas Listas para Imprimir</h3>
          <p className="text-sm text-muted-foreground mb-4">Comienza con una plantilla profesional y personalizable.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.title} className="group relative overflow-hidden rounded-lg">
                <Image
                  src={template.src}
                  alt={template.title}
                  width={300}
                  height={450}
                  data-ai-hint={template.hint}
                  className="transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-white text-center font-bold">{template.title}</h4>
                  <Button size="sm" className="mt-2">Usar Plantilla</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}