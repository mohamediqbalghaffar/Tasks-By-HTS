
'use server';
/**
 * @fileOverview Provides AI-powered suggestions for task 'Further Details' and 'Result' columns.
 *
 * - suggestTaskDetails - A function that generates suggestions for task details and results.
 * - SuggestTaskDetailsInput - The input type for the suggestTaskDetails function.
 * - SuggestTaskDetailsOutput - The return type for the suggestTaskDetails function.
 */

import {ai} from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const SuggestTaskDetailsInputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  taskDetail: z.string().describe('The detail of the task.'),
  taskHistory: z.string().optional().describe('History of tasks to learn from, including names, details, further details and results.'),
});
export type SuggestTaskDetailsInput = z.infer<typeof SuggestTaskDetailsInputSchema>;

const SuggestTaskDetailsOutputSchema = z.object({
  furtherDetails: z.string().describe('AI-generated suggestions for further details of the task.'),
});
export type SuggestTaskDetailsOutput = z.infer<typeof SuggestTaskDetailsOutputSchema>;

export async function suggestTaskDetails(input: SuggestTaskDetailsInput): Promise<SuggestTaskDetailsOutput> {
  return suggestTaskDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDetailsPrompt',
  model: 'googleai/gemini-1.0-pro',
  input: {
    schema: z.object({
      taskName: z.string().describe('The name of the task.'),
      taskDetail: z.string().describe('The detail of the task.'),
      taskHistory: z.string().optional().describe('History of tasks to learn from, including names, details, further details, and results.'),
    }),
  },
  output: {
    schema: z.object({
      furtherDetails: z.string().describe('AI-generated suggestions for further details of the task.'),
    }),
  },
  prompt: `You are an expert AI assistant for an administration manager in a telecommunications company. Your goal is to help them fill out their task board by providing insightful suggestions for the 'Further Details' column based on the task's name and details.

Analyze the provided history of past tasks to understand common themes, successful outcomes, and potential obstacles. Use this knowledge to refine your suggestions.

Your suggestions should be actionable and relevant to a telecom environment. Consider potential issues, necessary contacts, stakeholders, or regulatory requirements. Frame your suggestions to improve efficiency, cost-effectiveness, and compliance. Be specific and keep the language professional. All responses must be in Central Kurdish.

Task History:
{{{taskHistory}}}

Current Task:
Name: {{{taskName}}}
Detail: {{{taskDetail}}}

Suggested Further Details:`,
});

const suggestTaskDetailsFlow = ai.defineFlow<
  typeof SuggestTaskDetailsInputSchema,
  typeof SuggestTaskDetailsOutputSchema
>(
  {
    name: 'suggestTaskDetailsFlow',
    inputSchema: SuggestTaskDetailsInputSchema,
    outputSchema: SuggestTaskDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
