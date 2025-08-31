import { StatCard } from './components/stat-card';
import { SalesChart } from './components/sales-chart';
import { Goals } from './components/goals';
import {
  DollarSign,
  BookOpen,
  TrendingUp,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Regalías Totales (30d)"
          value="$4,203.45"
          change="+15.2% desde el mes pasado"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Unidades Vendidas (30d)"
          value="842"
          change="+22.1% desde el mes pasado"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Ranking Prom. de Ventas"
          value="#1,234"
          change="-50 desde el mes pasado"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Calificación Prom."
          value="4.8"
          change="+0.1 desde el mes pasado"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <Goals />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Libros con Mejor Rendimiento</CardTitle>
            <CardDescription>
              Tus libros más populares en los últimos 30 días.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Portada</span>
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead className="hidden md:table-cell">
                    BSR
                  </TableHead>
                  <TableHead className="text-right">Regalías (30d)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Imagen del producto"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src="https://placehold.co/64x64.png"
                      width="64"
                      data-ai-hint="book cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    La Última Batalla
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">eBook</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    #523
                  </TableCell>
                  <TableCell className="text-right">$1,250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Imagen del producto"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src="https://placehold.co/64x64.png"
                      width="64"
                      data-ai-hint="book cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    Ecos del Mañana
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Tapa blanda</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    #1,102
                  </TableCell>
                  <TableCell className="text-right">$980.50</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
