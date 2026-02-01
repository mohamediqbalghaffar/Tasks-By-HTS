
'use server';
/**
 * @fileOverview An AI flow to generate a concise title for a chat conversation.
 *
 * - generateChatTitle - A function that creates a title from the first message.
 * - GenerateChatTitleInput - The input type.
 * - GenerateChatTitleOutput - The return type.
 */

import { ai } from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateChatTitleInputSchema = z.object({
  firstMessage: z.string().describe("The first user message in a conversation."),
  responseLanguage: z.enum(['ku', 'en', 'ar']).describe("The language for the title."),
});
export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;


const GenerateChatTitleOutputSchema = z.object({
  title: z.string().describe("A short, concise title (max 5 words) summarizing the conversation's topic."),
});
export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;


export async function generateChatTitle(input: GenerateChatTitleInput): Promise<GenerateChatTitleOutput> {
    return generateChatTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatTitlePrompt',
  model: 'googleai/gemini-1.0-pro',
  input: { schema: GenerateChatTitleInputSchema },
  output: { schema: GenerateChatTitleOutputSchema },
  prompt: `Based on the following user message, create a very short and concise title for the conversation. The title should be no more than 5 words and must be in the specified language: '{{responseLanguage}}'.

User Message: "{{firstMessage}}"
`,
  config: {
    temperature: 0.2,
  },
});

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a title.");
    }
    return output;
  }
);
