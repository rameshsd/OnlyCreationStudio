"use client";

import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer } from "@/components/story-viewer";
import { type UserProfileWithStories, type CurrentUser } from "@/lib/get-feed-data";

interface StoryReelProps {
    stories: UserProfileWithStories[];
    currentUser: CurrentUser | null;
}

export function StoryReel({ stories, currentUser }: StoryReelProps) {
    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyViewerStartIndex, setStoryViewerStartIndex] = useState(0);
    const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

    const handleStoryClick = (index: number) => {
        const clickedStory = stories[index];
        if (clickedStory.isSelf && (!clickedStory.stories || clickedStory.stories.length === 0)) {
            // A simple event bus to open the dialog from a sibling component
             window.dispatchEvent(new CustomEvent('open-add-story-dialog'));
        } else {
            setStoryViewerStartIndex(index);
            setStoryViewerOpen(true);
        }
    };
    
    const handleStoryViewed = useCallback((userId: string) => {
        setSeenStories(prev => new Set(prev).add(userId));
    }, []);

    if (!currentUser) {
        // Render skeleton or nothing if there's no user context
        return (
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {storyViewerOpen && (
                <StoryViewer
                    stories={stories}
                    startIndex={storyViewerStartIndex}
                    onClose={() => setStoryViewerOpen(false)}
                    onStoryViewed={handleStoryViewed}
                />
            )}
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                {stories.map((story, index) => {
                    const hasUnseenStories = story.stories && story.stories.length > 0 && !seenStories.has(story.id);
                    const isMyEmptyStory = story.isSelf && (!story.stories || story.stories.length === 0);

                    return (
                        <button
                            key={story.id}
                            className="flex flex-col items-center gap-2 flex-shrink-0 w-20"
                            onClick={() => handleStoryClick(index)}
                        >
                            <div className={cn("h-20 w-20 rounded-full p-1",
                                hasUnseenStories ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" : "bg-gray-300 dark:bg-gray-600"
                            )}>
                                <div className="bg-background rounded-full p-1 w-full h-full">
                                    <Avatar className="h-full w-full relative">
                                        {story.avatarUrl && <AvatarImage src={story.avatarUrl} alt={story.username} data-ai-hint="user avatar" />}
                                        <AvatarFallback className="text-xs">{story.username?.substring(0,2)}</AvatarFallback>
                                        {isMyEmptyStory && (
                                            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </Avatar>
                                </div>
                            </div>
                            <span className="text-xs font-medium truncate w-full text-center">{story.username}</span>
                        </button>
                    );
                })}
            </div>
        </>
    )
}
