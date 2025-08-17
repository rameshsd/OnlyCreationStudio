"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiMatchmaking, type AiMatchmakingOutput } from "@/ai/flows/ai-matchmaking";
import { CreatorCard } from "@/components/creator-card";

export function MatchmakerForm() {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<AiMatchmakingOutput['matches']>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your project or campaign.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setMatches([]);
    try {
      const result = await aiMatchmaking({ projectDescription: input });
      if (result.matches && result.matches.length > 0) {
        setMatches(result.matches);
      } else {
        toast({
          title: "No matches found",
          description: "We couldn't find any creators matching your description. Try being more specific.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
            <CardDescription>
              Detail your project goals, target audience, and the type of creator you're looking for. The more detail, the better the match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="project-description-input">Your Project</Label>
                <Textarea
                  id="project-description-input"
                  placeholder="e.g., 'Looking for a US-based female gaming influencer (20-30 age range) who streams on Twitch and creates YouTube content. We want to promote our new line of ergonomic gaming chairs to an engaged audience...'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find Creators
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {loading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <CreatorCard key={i} loading />
          ))}
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Top Matches</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, index) => (
              <CreatorCard key={index} creator={match} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
