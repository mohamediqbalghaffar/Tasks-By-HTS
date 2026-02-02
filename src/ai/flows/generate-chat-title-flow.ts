// 'use server';

import { z } from 'zod';

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
  console.warn("AI Chat Title generation is disabled for static export (GitHub Pages).");
  let title = "Conversation";
  if (input.responseLanguage === 'ku') title = "گفتوگۆ";
  if (input.responseLanguage === 'ar') title = "محادثة";
  return { title };
}
