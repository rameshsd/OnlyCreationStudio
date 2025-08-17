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

const prompt = ai.definePrompt({
  name: 'aiMatchmakingPrompt',
  input: {schema: AiMatchmakingInputSchema},
  output: {schema: AiMatchmakingOutputSchema},
  prompt: `You are an AI-powered matchmaking engine that helps brands find the best creators for their projects.

  Given the project description, analyze the requirements and identify creators who possess the relevant skills, experience, and audience.

  Project Description: {{{projectDescription}}}

  Return a list of creators, including their name, profile picture, bio, specialties, and a match score indicating how well they fit the project requirements. The match score should be a number between 0 and 1.
  Do not return any values that do not exist.

  Here's the output:
  {{output}}`,
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
