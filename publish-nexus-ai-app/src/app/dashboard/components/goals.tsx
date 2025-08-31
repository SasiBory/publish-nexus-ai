import { CheckCircle2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function Goals() {
  const goals = [
    { title: 'Publicar 1 libro nuevo este trimestre', progress: 33 },
    { title: 'Alcanzar $500 en regalías mensuales', progress: 84 },
    { title: 'Obtener 10 nuevas reseñas para "La Última Batalla"', progress: 70 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas Semanales</CardTitle>
        <CardDescription>
          Tus metas SMART para mantenerte en el camino correcto.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-start gap-3">
            <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{goal.title}</p>
              <Progress value={goal.progress} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.progress}% completado
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
          <div className="flex-1">
              <p className="text-sm font-medium line-through text-muted-foreground">Lanzar 1 campaña de promoción</p>
              <p className="text-xs text-muted-foreground">Completado el 12 de junio</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Establecer Nueva Meta</Button>
      </CardFooter>
    </Card>
  );
}
