
import { CreatorCard } from "@/components/creator-card";
import { Star } from "lucide-react";

const favoriteCreators = [
    {
        creatorName: "Alexa Rodriguez",
        profilePicture: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        professionalBio: "Digital storyteller & brand strategist. I help brands build authentic connections with their audience.",
        specialties: ["Brand Strategy", "Content Creation", "Social Media Marketing"],
        primaryPlatformLink: "#",
        matchScore: 0.95
    },
    {
        creatorName: "TechExplorer",
        profilePicture: "https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        professionalBio: "Unboxing the future, one gadget at a time. Your daily dose of tech news, reviews, and tutorials.",
        specialties: ["Tech Reviews", "Gadgets", "Unboxing"],
        primaryPlatformLink: "#",
        matchScore: 0.92
    },
    {
        creatorName: "FitFreak",
        profilePicture: "https://images.unsplash.com/photo-1541534401786-204b8928468c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
