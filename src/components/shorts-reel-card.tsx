
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shortsData } from "@/lib/shorts-data";
import { ArrowRight, PlayCircle } from "lucide-react";

export function ShortsReelCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Featured Shorts</CardTitle>
        <Button variant="ghost" asChild>
          <Link href="/shorts">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
          {shortsData.slice(0, 5).map((short) => (
            <Link href="/shorts" key={short.id}>
              <div className="group relative h-64 w-40 flex-shrink-0 overflow-hidden rounded-lg">
                <video
                  src={short.videoUrl}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white/80" />
                </div>
                <div className="absolute bottom-0 left-0 p-3 text-white">
                  <p className="font-bold text-sm truncate">{short.user.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
