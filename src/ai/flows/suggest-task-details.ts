import { ai } from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const SuggestTaskDetailsInputSchema = z.object({
  taskName: z.string().describe("The name of the task."),
  responseLanguage: z.enum(['ku', 'en', 'ar']).describe("The language for the details (ku: Central Kurdish, en: English, ar: Arabic)."),
});
export type SuggestTaskDetailsInput = z.infer<typeof SuggestTaskDetailsInputSchema>;

const SuggestTaskDetailsOutputSchema = z.object({
  suggestedDetail: z.string().describe("A suggested short description or detail for the task."),
});
export type SuggestTaskDetailsOutput = z.infer<typeof SuggestTaskDetailsOutputSchema>;

export async function suggestTaskDetails(input: SuggestTaskDetailsInput): Promise<SuggestTaskDetailsOutput> {
  return suggestTaskDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDetailsPrompt',
  model: 'googleai/gemini-1.0-pro',
  input: { schema: SuggestTaskDetailsInputSchema },
  output: { schema: SuggestTaskDetailsOutputSchema },
  prompt: `Generate a short, concise, and helpful detail/description for a task named "{{taskName}}".
The detail should be in the language specified by '{{responseLanguage}}'.
If 'responseLanguage' is 'ku', respond in Central Kurdish.
`,
  config: {
    temperature: 0.3,
  },
});

const suggestTaskDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTaskDetailsFlow',
    inputSchema: SuggestTaskDetailsInputSchema,
    outputSchema: SuggestTaskDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate task details.");
    }
    return output;
  }
);
