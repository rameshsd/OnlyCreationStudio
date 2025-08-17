
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Settings2, Loader2, Award, Building, Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatorCard } from "@/components/creator-card";
import { aiMatchmaking, type AiMatchmakingOutput } from "@/ai/flows/ai-matchmaking";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("all");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<AiMatchmakingOutput['matches']>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    let projectDescription = `Find a creator.`;
    if (searchTerm) {
      projectDescription += ` The creator should have a name, bio, or specialty related to "${searchTerm}".`;
    }
    if (role !== "all") {
      projectDescription += ` They should be a ${role}.`;
    }
    if (specialty) {
      projectDescription += ` Their specialty is in "${specialty}".`;
    }
    if (location) {
      projectDescription += ` They are located in or near "${location}".`;
    }

    try {
      const matchmakingResult = await aiMatchmaking({ projectDescription });
      if (matchmakingResult.matches && matchmakingResult.matches.length > 0) {
        setResults(matchmakingResult.matches);
      } else {
        toast({
          title: "No Matches Found",
          description: "We couldn't find any creators matching your search. Try different keywords.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching for creators. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={role} onValueChange={setRole} disabled={loading}>
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
                <Input 
                  placeholder="Specialty (e.g., 'Gaming')" 
                  className="pl-10"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Location (e.g., 'New York, NY')" 
                  className="pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Search Results</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <CreatorCard key={i} loading />)}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((creator, index) => (
              <CreatorCard key={index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-muted-foreground">
            <Search className="h-12 w-12" />
            <p className="text-center">No creators found. <br /> Try a new search to find your perfect match.</p>
          </div>
        )}
      </div>
    </div>
  );
}
