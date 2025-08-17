
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

type Studio = {
  id: string;
  name: string;
  location: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  tags: string[];
};

export function StudioCard({ studio }: { studio: Studio }) {
  return (
    <Link href={`/studios/${studio.id}`}>
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 w-full">
            <Image
            src={studio.imageUrl}
            alt={studio.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint="studio photography"
            />
        </div>
        <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 mb-2">
                {studio.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
            </div>
            <h3 className="font-bold text-lg truncate">{studio.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {studio.location}
            </p>
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-bold">{studio.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({studio.reviewCount})</span>
                </div>
                <div className="text-lg font-bold text-primary">
                    ${studio.price}<span className="text-sm font-normal text-muted-foreground">/hr</span>
                </div>
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}
