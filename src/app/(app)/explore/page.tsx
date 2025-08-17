
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from 'next/image';

const filterTabs = ["Person", "Short Video", "Tags"];

const exploreItems = [
    { name: "Danielle", age: "17 y.o", image: "https://placehold.co/400x600.png", hint: "portrait female" },
    { name: "Jiwoo", age: "22 y.o", image: "https://placehold.co/400x600.png", hint: "portrait female" },
    { name: "Jihyo", age: null, image: "https://placehold.co/400x600.png", hint: "portrait female" },
    { name: "Haewon", age: null, image: "https://placehold.co/400x600.png", hint: "portrait female" },
    { name: "Sana", age: "25 y.o", image: "https://placehold.co/400x600.png", hint: "portrait female" },
    { name: "Mina", age: "24 y.o", image: "https://placehold.co/400x600.png", hint: "portrait female" },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("Person");

  return (
    <div className="flex flex-col gap-6 text-foreground">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search photo, video or friend" 
                className="bg-secondary border-none rounded-full pl-12 h-12"
            />
        </div>

        <div className="flex items-center gap-2">
            {filterTabs.map(tab => (
                <Button 
                    key={tab} 
                    variant={activeTab === tab ? "default" : "secondary"}
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full"
                >
                    {tab}
                </Button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
            {exploreItems.map((item, index) => (
                <div key={index} className="relative aspect-[2/3] rounded-2xl overflow-hidden group">
                    <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.hint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                        <p className="font-bold">{item.name}</p>
                        {item.age && <p className="text-xs">{item.age}</p>}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
