'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusCircle, MoreHorizontal, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';


interface WatchlistItem {
    id: string;
    title: string;
    asin: string;
    coverUrl: string;
    hint: string;
    bsr: number;
    bsrChange?: number; // Made optional as it might not come from the extension initially
    price: number;
    reviews: number;
    rating: number;
}

// Datos de ejemplo para simular la captura
const sampleData: WatchlistItem[] = [
    {
        id: '1609618955',
        asin: '1609618955',
        title: 'Mindfulness: An Eight-Week Plan for Finding Peace in a Frantic World',
        coverUrl: 'https://placehold.co/64x96.png',
        hint: 'mindfulness book',
        bsr: 12345,
        price: 9.00,
        reviews: 0,
        rating: 0,
        bsrChange: -150
    }
];


export default function CompetitiveIntelligencePage() {
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>(sampleData);
    const [newAsin, setNewAsin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'watchlist'), (snapshot) => {
            const items: WatchlistItem[] = [];
            let hasSampleData = false;
            snapshot.forEach((doc) => {
                const data = doc.data() as WatchlistItem;
                if (data.asin === sampleData[0].asin) {
                    hasSampleData = true;
                }
                items.push({ id: doc.id, ...data });
            });

            // Si la base de datos está vacía, mostramos los datos de ejemplo.
            // Si tiene datos, pero no el de ejemplo, lo añadimos.
            if (items.length === 0) {
                 setWatchlistItems(sampleData);
            } else if (!hasSampleData) {
                 setWatchlistItems([...sampleData, ...items]);
            } else {
                 setWatchlistItems(items);
            }

            setIsFetchingData(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


    const handleAddAsin = async () => {
        const asinToAdd = newAsin.trim().toUpperCase();
        if (asinToAdd.length !== 10) {
            toast({
                title: 'ASIN Inválido',
                description: 'Por favor, introduce un ASIN válido de 10 caracteres.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            // This simulates adding a book manually.
            // The extension would provide more accurate data.
            const newItem = {
                asin: asinToAdd,
                title: `Libro ${asinToAdd}`,
                coverUrl: 'https://placehold.co/64x96.png',
                hint: 'book cover',
                bsr: 0,
                price: 0,
                reviews: 0,
                rating: 0,
            };
            
            await setDoc(doc(db, 'watchlist', asinToAdd), newItem);

            setNewAsin('');
            toast({
                title: 'ASIN Añadido',
                description: `${asinToAdd} ha sido añadido a tu watchlist. La extensión actualizará los datos.`,
            });
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                title: 'Error al Añadir ASIN',
                description: 'No se pudo guardar el ASIN en la base de datos.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = async (asinToRemove: string) => {
        // Prevent deleting sample data if it's the only one and we are not connected to firebase
        if (watchlistItems.length === 1 && watchlistItems[0].id === sampleData[0].id) {
            setWatchlistItems([]);
            return;
        }

        try {
            await deleteDoc(doc(db, 'watchlist', asinToRemove));
            toast({
                title: 'ASIN Eliminado',
                description: `El ASIN ${asinToRemove} ha sido eliminado de tu watchlist.`,
            });
        } catch (error) {
            console.error("Error removing document: ", error);
            toast({
                title: 'Error al Eliminar',
                description: 'No se pudo eliminar el ASIN de la base de datos.',
                variant: 'destructive',
            });
        }
    };

  const handleViewDetails = (asin: string) => {
    router.push(`/reverse-asin?asin=${asin}`);
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inteligencia Competitiva</h1>
            <p className="mt-2 text-muted-foreground">
                Monitorea a tus competidores para descubrir oportunidades y amenazas.
            </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
            <CardTitle>Añadir a la Watchlist</CardTitle>
            <CardDescription>Introduce un ASIN para empezar a monitorearlo manually o usa la extensión de Chrome.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-start gap-4">
                <Input
                    placeholder="Introduce un ASIN de 10 caracteres..."
                    value={newAsin}
                    onChange={(e) => setNewAsin(e.target.value.toUpperCase())}
                    maxLength={10}
                    disabled={isLoading}
                />
                <Button onClick={handleAddAsin} disabled={isLoading} className="w-48">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <PlusCircle className="mr-2 h-5 w-5" />
                    )}
                    Añadir ASIN
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Watchlist de ASINs</CardTitle>
            <CardDescription>
                Los datos se actualizan en tiempo real desde tu extensión de Chrome. Sigue de cerca el BSR, precio y reseñas de los libros más importantes de tu nicho.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">Portada</TableHead>
                        <TableHead>Título y ASIN</TableHead>
                        <TableHead className="text-center">BSR (Cambio 24h)</TableHead>
                        <TableHead className="text-center">Precio</TableHead>
                        <TableHead className="text-center">Reseñas (Rating)</TableHead>
                        <TableHead>
                            <span className="sr-only">Acciones</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isFetchingData ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                <p className="mt-2 text-muted-foreground">Cargando datos desde Firebase...</p>
                            </TableCell>
                        </TableRow>
                    ) : watchlistItems.length === 0 ? (
                         <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                Tu watchlist está vacía. Añade un ASIN para empezar.
                            </TableCell>
                        </TableRow>
                    ) : (
                        watchlistItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                        alt={`Portada de ${item.title}`}
                                        className="aspect-[2/3] rounded-md object-cover"
                                        height="96"
                                        src={item.coverUrl || 'https://placehold.co/64x96.png'}
                                        width="64"
                                        data-ai-hint={item.hint || 'book cover'}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="font-semibold">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">{item.asin}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {item.bsr ? item.bsr.toLocaleString() : 'N/A'}
                                        {item.bsrChange != null && (
                                            item.bsrChange >= 0 ? 
                                            <span className="flex items-center text-xs text-red-500"><TrendingDown className="h-3 w-3 mr-1"/> {item.bsrChange}</span> :
                                            <span className="flex items-center text-xs text-green-500"><TrendingUp className="h-3 w-3 mr-1"/> {Math.abs(item.bsrChange)}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{item.price > 0 ? `$${item.price.toFixed(2)}` : 'N/A'}</TableCell>
                                <TableCell className="text-center">
                                    <div>{item.reviews ? item.reviews.toLocaleString() : 'N/A'}</div>
                                    {item.rating > 0 && <Badge variant="secondary" className="mt-1">{item.rating.toFixed(1)} ⭐</Badge>}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Alternar menú</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleViewDetails(item.asin)}>Ver análisis detallado</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRemoveItem(item.id)}>Eliminar de la watchlist</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}