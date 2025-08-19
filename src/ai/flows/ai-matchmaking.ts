
'use server';

/**
 * @fileOverview AI-powered matchmaking flow for brands to find relevant creators.
 *
 * - aiMatchmaking - A function that uses natural language input to recommend matching creators.
 * - AiMatchmakingInput - The input type for the aiMatchmaking function.
 * - AiMatchmakingOutput - The return type for the aiMatchmaking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Sample creator database
const creators = [
  {
      id: "1",
      creatorName: "Alexa Rodriguez",
      profilePicture: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      professionalBio: "Digital storyteller & brand strategist. I help brands build authentic connections with their audience.",
      specialties: ["Brand Strategy", "Content Creation", "Social Media Marketing"],
      primaryPlatformLink: "#",
  },
  {
      id: "2",
      creatorName: "TechExplorer",
      profilePicture: "https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      professionalBio: "Unboxing the future, one gadget at a time. Your daily dose of tech news, reviews, and tutorials.",
      specialties: ["Tech Reviews", "Gadgets", "Unboxing"],
      primaryPlatformLink: "#",
  },
  {
      id: "3",
      creatorName: "FitFreak",
      profilePicture: "https://images.unsplash.com/photo-1541534401786-204b8928468c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      professionalBio: "Helping you achieve your fitness goals with effective workout plans and nutritional advice.",
      specialties: ["Fitness", "Workout", "Nutrition"],
      primaryPlatformLink: "#",
  },
   {
    id: "4",
    creatorName: "Gamer's Galaxy",
    profilePicture: "https://images.unsplash.com/photo-1580327344181-c11ac2a2653e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    professionalBio: "Elite gamer and streamer. Focused on competitive FPS and RPGs. Let's conquer new worlds together.",
    specialties: ["Gaming", "Streaming", "eSports"],
    primaryPlatformLink: "#",
  },
   {
    id: "5",
    creatorName: "Digital Nomad",
    profilePicture: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    professionalBio: "Exploring the world and sharing my adventures. Specializing in travel vlogs and photography.",
    specialties: ["Travel", "Vlogging", "Photography"],
    primaryPlatformLink: "#",
  }
];


const AiMatchmakingInputSchema = z.object({
  projectDescription: z
    .string()
    .describe(
      'A detailed description of the project, including the goals, target audience, and required skills.'
    ),
});
export type AiMatchmakingInput = z.infer<typeof AiMatchmakingInputSchema>;

const AiMatchmakingOutputSchema = z.object({
  matches: z
    .array(
      z.object({
        creatorName: z.string().describe('The public name of the creator.'),
        profilePicture: z
          .string()
          .describe(
            'URL of the creator profile picture, or a data URI if available.'
          ),
        professionalBio: z
          .string()
          .describe('A short professional biography of the creator.'),
        specialties: z
          .array(z.string())
          .describe('List of the creator specialties/niches.'),
        primaryPlatformLink: z
          .string()
          .describe('Link to the creator primary platform.'),
        matchScore: z
          .number()
          .describe(
            'A score (0-1) indicating how well the creator matches the project requirements.'
          ),
      })
    )
    .describe('A list of creators that match the project requirements.'),
});
export type AiMatchmakingOutput = z.infer<typeof AiMatchmakingOutputSchema>;

export async function aiMatchmaking(input: AiMatchmakingInput): Promise<AiMatchmakingOutput> {
  return aiMatchmakingFlow(input);
}

const findCreatorsTool = ai.defineTool(
    {
        name: 'findCreators',
        description: 'Search for creators based on a project description.',
        inputSchema: z.object({
            query: z.string().describe('A query describing the desired creators, based on the project needs.')
        }),
        outputSchema: z.any()
    },
    async (input) => {
        // In a real app, this would query a database. For now, it returns a static list.
        return creators;
    }
)

const prompt = ai.definePrompt({
  name: 'aiMatchmakingPrompt',
  input: {schema: AiMatchmakingInputSchema},
  output: {schema: AiMatchmakingOutputSchema},
  tools: [findCreatorsTool],
  prompt: `You are an AI-powered matchmaking engine that helps brands find the best creators for their projects.

  Given the project description, use the findCreators tool to get a list of available creators. Then, analyze the project requirements and the creator profiles to identify the best matches.

  Project Description: {{{projectDescription}}}

  Return a list of the top 3-5 creators, including their name, profile picture, bio, specialties, and a match score indicating how well they fit the project requirements. The match score should be a number between 0 and 1.
  Do not return any creators that do not exist in the provided tool data.
  `,
});

const aiMatchmakingFlow = ai.defineFlow(
  {
    name: 'aiMatchmakingFlow',
    inputSchema: AiMatchmakingInputSchema,
    outputSchema: AiMatchmakingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
