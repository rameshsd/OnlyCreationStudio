
import { StudioCard } from "@/components/studio-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const studios = [
  {
    id: "1",
    name: "Visionary Vibes Studio",
    location: "Brooklyn, NY",
    price: 75,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 4.9,
    reviewCount: 128,
    tags: ["Photography", "Video", "Podcast"],
  },
  {
    id: "2",
    name: "Golden Hour Loft",
    location: "Los Angeles, CA",
    price: 120,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 5.0,
    reviewCount: 92,
    tags: ["Natural Light", "Lifestyle", "Video"],
  },
  {
    id: "3",
    name: "The Sound Stage",
    location: "Nashville, TN",
    price: 90,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 4.8,
    reviewCount: 210,
    tags: ["Podcast", "Music", "Audio Recording"],
  },
  {
    id: "4",
    name: "Urban Exposure",
    location: "Chicago, IL",
    price: 80,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 4.7,
    reviewCount: 78,
    tags: ["Photography", "Urban", "Fashion"],
  },
   {
    id: "5",
    name: "The Green Screen Room",
    location: "Austin, TX",
    price: 150,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 4.9,
    reviewCount: 55,
    tags: ["Video", "VFX", "Green Screen"],
  },
  {
    id: "6",
    name: "Creator's Corner",
    location: "Miami, FL",
    price: 65,
    imageUrl: "https://placehold.co/600x400.png",
    rating: 4.6,
    reviewCount: 150,
    tags: ["Podcast", "YouTube", "Streaming"],
  },
];

export default function StudiosPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Studio</h1>
        <p className="text-muted-foreground">Discover and book creative spaces near you.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by name or location..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
        <Button>Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studios.map(studio => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </div>
    </div>
  );
}
