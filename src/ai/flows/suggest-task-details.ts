// 'use server';

import { z } from 'zod';

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
  console.warn("AI suggestions are disabled for static export (GitHub Pages).");
  return {
    furtherDetails: "AI suggestions not available in static version."
  };
}
