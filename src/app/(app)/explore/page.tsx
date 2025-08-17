
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatorCard } from "@/components/creator-card";
import type { AiMatchmakingOutput } from "@/ai/flows/ai-matchmaking";

const sampleCreators: AiMatchmakingOutput['matches'] = [
  {
    creatorName: "Alex Doe",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "Lifestyle vlogger and travel enthusiast sharing my adventures around the globe. Passionate about sustainable travel and minimalist living.",
    specialties: ["Vlogging", "Travel", "Lifestyle"],
    primaryPlatformLink: "#",
    matchScore: 0.95,
  },
  {
    creatorName: "Jamie Tech",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "Your go-to source for the latest tech reviews, tutorials, and news. Making complex tech simple and accessible for everyone.",
    specialties: ["Tech Reviews", "Tutorials", "Gadgets"],
    primaryPlatformLink: "#",
    matchScore: 0.92,
  },
  {
    creatorName: "Casey Cooks",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "A passionate home cook and recipe developer. I create delicious and easy-to-follow recipes for every occasion.",
    specialties: ["Cooking", "Food Photography", "Recipe Development"],
    primaryPlatformLink: "#",
    matchScore: 0.88,
  },
    {
    creatorName: "Morgan Fitness",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "Certified personal trainer and fitness coach helping you achieve your health goals with effective workout plans and nutrition tips.",
    specialties: ["Fitness", "Nutrition", "Coaching"],
    primaryPlatformLink: "#",
    matchScore: 0.85,
  },
  {
    creatorName: "Taylor Art",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "Digital artist and illustrator creating unique and vibrant artwork. Open for commissions and collaborations.",
    specialties: ["Digital Art", "Illustration", "Character Design"],
    primaryPlatformLink: "#",
    matchScore: 0.82,
  },
  {
    creatorName: "Riley Games",
    profilePicture: "https://placehold.co/128x128.png",
    professionalBio: "Your friendly neighborhood gamer, streaming the latest titles and classic favorites. Join my community for fun and epic plays!",
    specialties: ["Gaming", "Live Streaming", "Esports"],
    primaryPlatformLink: "#",
    matchScore: 0.79,
  },
];


export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("all");
  const [results, setResults] = useState(sampleCreators);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would fetch results from an API
    // For now, we'll just filter the sample data
    const filtered = sampleCreators.filter(creator => 
      creator.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.professionalBio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setResults(filtered);
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Creators</h1>
        <p className="text-muted-foreground">Find the perfect talent for your next project.</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, keyword, or specialty..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="creator">Creator / Influencer</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="provider">Service Provider</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Specialty (e.g., 'Gaming')" className="pl-10" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Location (e.g., 'New York, NY')" className="pl-10" />
              </div>
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Search Results</h2>
          <Button variant="ghost">
            <Settings2 className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
        
        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((creator, index) => (
              <CreatorCard key={index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-muted-foreground">
            <Search className="h-12 w-12" />
            <p className="text-center">No creators found for your search. <br /> Try different keywords or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
