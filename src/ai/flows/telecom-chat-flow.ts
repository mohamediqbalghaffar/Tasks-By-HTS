// 'use server';

import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  attachment: z.string().optional().describe("A media attachment, as a data URI."),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const TelecomChatInputSchema = z.object({
  userMessage: z.string().describe('The current message from the user.'),
  attachmentDataUri: z.string().optional().describe("An optional media attachment from the user, as a data URI."),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The history of the conversation so far.'),
  activeTasksJson: z.string().optional().describe("A JSON string of active tasks."),
  completedTasksJson: z.string().optional().describe("A JSON string of completed tasks."),
  deletedTasksJson: z.string().optional().describe("A JSON string of deleted tasks."),
  expiredTasksJson: z.string().optional().describe("A JSON string of expired tasks."),
  activeLettersJson: z.string().optional().describe("A JSON string of active approval letters."),
  completedLettersJson: z.string().optional().describe("A JSON string of completed approval letters."),
  deletedLettersJson: z.string().optional().describe("A JSON string of deleted approval letters."),
  expiredLettersJson: z.string().optional().describe("A JSON string of expired approval letters."),
  responseLanguage: z.enum(['ku', 'en', 'ar']).describe('The language in which the AI should respond (ku: Central Kurdish, en: English, ar: Arabic).'),
});
export type TelecomChatInput = z.infer<typeof TelecomChatInputSchema>;


const TelecomChatOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant\'s response to the user.'),
  aiResponseAttachment: z.string().optional().describe("An optional media attachment from the AI, as a data URI."),
});
export type TelecomChatOutput = z.infer<typeof TelecomChatOutputSchema>;

export async function telecomChatFlow(input: TelecomChatInput): Promise<TelecomChatOutput> {
  console.warn("AI Chat features are disabled for static export (GitHub Pages).");
  return {
    aiResponse: "⚠️ AI features are not available in this static version of the application."
  };
}
