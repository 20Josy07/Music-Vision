
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/common/AppLogo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-8 text-center">
      <AppLogo iconSize={64} className="mb-8" showName={false} />
      <h1 className="text-4xl font-bold text-foreground mb-4">Bienvenido a MusicVerse</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Descubre tu próxima canción favorita. Explora un vasto universo de música, crea listas de reproducción y disfruta de una experiencia auditiva fluida.
      </p>
      <Link href="/browse" passHref>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Comenzar a Escuchar
        </Button>
      </Link>
      <p className="mt-12 text-sm text-muted-foreground">
        Impulsado por tecnología de vanguardia y amor por la música.
      </p>
    </div>
  );
}
