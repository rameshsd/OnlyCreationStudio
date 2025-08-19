
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Link as LinkIcon } from "lucide-react";
import type { AiMatchmakingOutput } from "@/ai/flows/ai-matchmaking";
import { Skeleton } from "./ui/skeleton";
import React, { useState } from 'react';

type Creator = AiMatchmakingOutput['matches'][0];

export function CreatorCard({ creator, loading }: { creator?: Creator, loading?: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex-row items-start gap-4 space-y-0">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-4 flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </CardFooter>
      </Card>
    )
  }

  if (!creator) return null;

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={creator.profilePicture} alt={creator.creatorName} data-ai-hint="creator avatar" />
          <AvatarFallback>{creator.creatorName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl">{creator.creatorName}</CardTitle>
          {creator.matchScore && (
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <Star className="h-4 w-4 fill-primary" />
              <span>{(creator.matchScore * 100).toFixed(0)}% Match</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{creator.professionalBio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {creator.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary">{specialty}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1">View Profile</Button>
        <Button variant="outline" size="icon" asChild>
          <a href={creator.primaryPlatformLink} target="_blank" rel="noopener noreferrer" aria-label="Primary Platform">
            <LinkIcon className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Re-using Avatar for better fallbacks
const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt, ...props }: React.ComponentProps<typeof Image> & { "data-ai-hint": string; }) => {
  const [error, setError] = useState(false);
  if (error || !src) return <AvatarFallback>{alt.substring(0, 2).toUpperCase()}</AvatarFallback>;
  
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="aspect-square h-full w-full"
      onError={() => setError(true)}
      {...props}
    />
  );
};


const AvatarFallback = ({ children, ...props }: { children: React.ReactNode }) => (
  <span className="avatar-fallback flex h-full w-full items-center justify-center rounded-full bg-muted font-bold" {...props}>
    {children}
  </span>
);
