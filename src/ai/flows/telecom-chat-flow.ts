/**
 * @fileOverview AI flow for a telecom/administration assistant chatbot.
 *
 * - telecomChatFlow - Handles chat interactions.
 * - TelecomChatInput - Input type for the flow.
 * - TelecomChatOutput - Output type for the flow.
 * - ChatMessage - Type for individual chat messages.
 */

import { ai } from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

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

const telecomChatFlowPrompt = ai.definePrompt({
  name: 'telecomChatFlowPrompt',
  model: 'googleai/gemini-1.0-pro',
  input: { schema: TelecomChatInputSchema },
  output: { schema: TelecomChatOutputSchema },
  prompt: `You are an expert AI assistant for an administration manager. Your primary specialization is in telecommunications and administrative tasks, but you are also a helpful, general-purpose assistant capable of answering any question and generating images.

When asked about your primary topics, provide detailed, insightful analysis using the data provided. You have access to all current project data, including active, completed, deleted, and expired items. Use this to analyze trends, summarize progress, and provide actionable suggestions.

If the user provides an image, analyze it in the context of their question. For example, if they ask "What's wrong with this invoice?", analyze the attached image of the invoice.

If the user asks you to generate an image (e.g., "create a picture of...", "draw me..."), respond with a short confirmation message in the 'aiResponse' field (like "Here is the image you requested.") and place the generated image data URI in the 'aiResponseAttachment' field.

When asked a general question (e.g., "how are you?", "what is the capital of France?"), answer it naturally and conversationally. Do not avoid the question or deflect by stating you are an AI. Be a helpful and friendly assistant.

Your data includes:
- Active Tasks: {{{activeTasksJson}}}
- Completed Tasks: {{{completedTasksJson}}}
- Deleted Tasks: {{{deletedTasksJson}}}
- Expired Tasks: {{{expiredTasksJson}}}
- Active Approval Letters: {{{activeLettersJson}}}
- Completed Approval Letters: {{{completedLettersJson}}}
- Deleted Approval Letters: {{{deletedLettersJson}}}
- Expired Approval Letters: {{{expiredLettersJson}}}

Conversation History (if any):
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}
{{/if}}

User's question: {{{userMessage}}}
{{#if attachmentDataUri}}
User's attachment: {{media url=attachmentDataUri}}
{{/if}}

IMPORTANT: Your entire response MUST be in the language specified by '{{responseLanguage}}'.
- If 'responseLanguage' is 'ku', respond in Central Kurdish.
- If 'responseLanguage' is 'en', respond in English.
- If 'responseLanguage' is 'ar', respond in Arabic.
Provide a helpful, relevant, and comprehensive response based on all the data you have and the user's question.
`,
  config: {
    temperature: 0.7,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

export async function telecomChatFlow(input: TelecomChatInput): Promise<TelecomChatOutput> {
  const lowerUserMessage = input.userMessage.toLowerCase();
  const isImageGenRequest = lowerUserMessage.includes('generate') || lowerUserMessage.includes('create an image') || lowerUserMessage.includes('draw') || lowerUserMessage.includes('picture of');

  if (isImageGenRequest && !input.attachmentDataUri) { // Ensure we are not editing an image
    try {
      let textResponse = 'Here is the image you requested.';
      if (input.responseLanguage === 'ku') textResponse = 'ئەوە وێنەیەکە کە داوات کردبوو.';
      if (input.responseLanguage === 'ar') textResponse = 'تفضل، هذه هي الصورة التي طلبتها.';

      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `generate an image of: ${input.userMessage}`,
      });

      if (media?.url) {
        return {
          aiResponse: textResponse,
          aiResponseAttachment: media.url,
        };
      }
    } catch (e) {
      console.error("Error during image generation:", e);
      let fallbackResponse = "Sorry, I couldn't generate the image right now.";
      if (input.responseLanguage === 'ku') fallbackResponse = "ببوورە، نەمتوانی وێنەکە دروست بکەم.";
      if (input.responseLanguage === 'ar') fallbackResponse = "عذرًا، لم أتمكن من إنشاء الصورة الآن.";
      return { aiResponse: fallbackResponse };
    }
  }

  // Default text-based flow (handles text responses and image analysis)
  const { output } = await telecomChatFlowPrompt(input);

  let fallbackResponse = "Sorry, I couldn't generate a response right now. Please try again.";
  if (input.responseLanguage === 'ku') {
    fallbackResponse = "ببوورە، نەمتوانی وەڵامێکی گونجاو بدۆزمەوە. تکایە دووبارە هەوڵبدەرەوە.";
  } else if (input.responseLanguage === 'ar') {
    fallbackResponse = "عذرًا، لم أتمكن من إيجاد رد مناسب. يرجى المحاولة مرة أخرى.";
  }

  if (!output || !output.aiResponse) {
    return { aiResponse: fallbackResponse };
  }

  return output;
}
