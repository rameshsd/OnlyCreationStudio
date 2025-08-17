
import { CreatorCard } from "@/components/creator-card";
import { Star } from "lucide-react";

const favoriteCreators = [
    {
        creatorName: "Alexa Rodriguez",
        profilePicture: "https://placehold.co/150x150.png",
        professionalBio: "Digital storyteller & brand strategist. I help brands build authentic connections with their audience.",
        specialties: ["Brand Strategy", "Content Creation", "Social Media Marketing"],
        primaryPlatformLink: "#",
        matchScore: 0.95
    },
    {
        creatorName: "TechExplorer",
        profilePicture: "https://placehold.co/100x100.png?text=TE",
        professionalBio: "Unboxing the future, one gadget at a time. Your daily dose of tech news, reviews, and tutorials.",
        specialties: ["Tech Reviews", "Gadgets", "Unboxing"],
        primaryPlatformLink: "#",
        matchScore: 0.92
    },
    {
        creatorName: "FitFreak",
        profilePicture: "https://placehold.co/100x100.png?text=FF",
        professionalBio: "Helping you achieve your fitness goals with effective workout plans and nutritional advice.",
        specialties: ["Fitness", "Workout", "Nutrition"],
        primaryPlatformLink: "#",
        matchScore: 0.88
    },
];


export default function FavouritesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorite Creators</h1>
        <p className="text-muted-foreground">Your curated list of top-tier talent.</p>
      </div>

       {favoriteCreators.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteCreators.map((creator, index) => (
              <CreatorCard key={index} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed text-muted-foreground">
            <Star className="h-12 w-12" />
            <p className="text-center">You haven't added any creators to your favorites yet.</p>
          </div>
        )}
    </div>
  );
}
