
'use server';
/**
 * @fileOverview AI flow to generate structured content for a PowerPoint presentation
 * based on tasks and notes.
 *
 * - generatePowerpointSlides - A function that handles the PowerPoint content generation.
 * - GeneratePowerpointSlidesInput - The input type.
 * - GeneratePowerpointSlidesOutput - The return type (structured slide data).
 */

import {ai} from '@/ai/ai-instance';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

// Schemas for individual task/note items passed to the AI
const FlowTaskItemSchema = z.object({
  id: z.string(),
  taskNumber: z.number(),
  name: z.string(),
  detail: z.string(),
  furtherDetails: z.string(),
  reminder: z.string().optional().describe("ISO date string or 'N/A'"),
  startTime: z.string().describe("ISO date string"),
  duration: z.string(),
  result: z.string(),
  isDone: z.boolean(),
});

const FlowNoteItemSchema = z.object({
  id: z.string(),
  noteNumber: z.number(),
  name: z.string(),
  detail: z.string(),
  sentTo: z.string().optional(),
  letterType: z.string().optional().describe("The type or category of the approval letter, e.g., 'General Letter', 'Salary Change'."),
  furtherDetails: z.string(),
  reminder: z.string().optional().describe("ISO date string or 'N/A'"),
  startTime: z.string().describe("ISO date string"),
  duration: z.string(),
  result: z.string(),
  isDone: z.boolean(),
});

const GeneratePowerpointSlidesInputSchema = z.object({
  tasks: z.array(FlowTaskItemSchema).describe("List of all tasks. This list might be filtered by a date range before being passed to you."),
  notes: z.array(FlowNoteItemSchema).describe("List of all approval letters (called 'نووسراوەکان' in Kurdish). This list might be filtered by a date range before being passed to you."),
  companyName: z.string().describe("Name of the company for branding"),
  currentDate: z.string().describe("Current date for the report, e.g., dd/MM/yyyy"),
});
export type GeneratePowerpointSlidesInput = z.infer<typeof GeneratePowerpointSlidesInputSchema>;

const SlideSharedSchema = z.object({
  title: z.string().describe("The title for this slide in Central Kurdish."),
});

const TitleSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'title'."),
  subtitle: z.string().optional().describe("Subtitle for the title slide, e.g., date or report type, in Central Kurdish."),
});

const OverviewSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'overview'."),
  points: z.array(z.string()).describe("Key summary points or bullet points for the overview slide, in Central Kurdish. These points should be derived from the provided task and approval letter data."),
});

const TableSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'table'."),
  headers: z.array(z.string()).describe("Column headers for the table, in Central Kurdish."),
  rows: z.array(z.array(z.string())).describe("Table rows, where each inner array represents a row of cells (strings). Populate these rows using the actual data from the 'tasks' or 'notes' lists provided in the input, filtered appropriately for the slide's purpose (e.g., active tasks)."),
});

const ChartDataPointSchema = z.object({
  name: z.string().describe("Label for the data point (e.g., 'تەواوکراو', 'چالاک')."),
  value: z.number().describe("Numeric value for the data point."),
});

const ChartSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'chart'."),
  chartType: z.enum(['pie', 'bar']).describe("Type of chart to generate ('pie' or 'bar')."),
  data: z.array(ChartDataPointSchema).describe("Data points for the chart. These should be calculated based on the provided 'tasks' and 'notes' data (e.g., count of completed vs. active)."),
  dataLabelUnit: z.string().optional().describe("Optional unit for data labels (e.g., '%', 'دانە')."),
});

const TextSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'text'."),
  paragraphs: z.array(z.string()).describe("Paragraphs of text for the slide, in Central Kurdish."),
});

const ConclusionSlideContentSchema = SlideSharedSchema.extend({
  type: z.string().describe("The type of this slide. Should be 'conclusion'."),
  closingRemarks: z.string().optional().describe("Closing remarks or a thank you message, in Central Kurdish."),
});

const SlideContentSchema = z.union([
  TitleSlideContentSchema,
  OverviewSlideContentSchema,
  TableSlideContentSchema,
  ChartSlideContentSchema,
  TextSlideContentSchema,
  ConclusionSlideContentSchema,
]);

const GeneratePowerpointSlidesOutputSchema = z.object({
  slides: z.array(SlideContentSchema).describe("An array of slide content objects, ordered as they should appear in the presentation."),
});
export type GeneratePowerpointSlidesOutput = z.infer<typeof GeneratePowerpointSlidesOutputSchema>;


export async function generatePowerpointSlides(input: GeneratePowerpointSlidesInput): Promise<GeneratePowerpointSlidesOutput> {
  const result = await generatePowerpointSlidesFlow(input);
  // Basic validation, can be expanded
  if (!result || !Array.isArray(result.slides) || result.slides.length === 0) {
    throw new Error("AI failed to generate valid slide structure.");
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'generatePowerpointSlidesPrompt',
  model: 'googleai/gemini-1.0-pro',
  input: {schema: GeneratePowerpointSlidesInputSchema},
  output: {schema: GeneratePowerpointSlidesOutputSchema},
  prompt: `تۆ پسپۆڕێکی دیزاینی پێشکەشکردنی پاوەرپۆینتیت. ئەرکی تۆ ئەوەیە کە داتای ئەرک و نووسراوەکان وەربگریت و پێکهاتەیەکی لۆژیکی و سەرنجڕاکێش بۆ پێشکەشکردنێک دروست بکەیت. تکایە هەموو ناوەڕۆکەکان بە زمانی کوردیی ناوەندی بن. گرنگە کە داتای ڕاستەقینەی ئەرک و نووسراوەکان بەکاربهێنیت بۆ پڕکردنەوەی ناوەڕۆکی سلایدەکان، نەک تەنها نموونەی گشتی. بۆ سلایدە دەقییەکان و پوختەکان، تکایە کورت و ڕاستەوخۆ بن، زیاتر پشت بە داتای پوختەکراو ببەستن نەک دروستکردنی دەقی نوێی درێژ.

پێشکەشکردنەکە پێویستە ئەم سلایدانەی خوارەوە لەخۆبگرێت، بەم ڕیزبەندییە:
1.  **سلایدی ناونیشان (type: 'title')**: ناونیشانی سەرەکی پێشکەشکردنەکە و ژێرنووسێک (بۆ نموونە، ناوی کۆمپانیا {{{companyName}}} و ڕێکەوتی ڕاپۆرت {{{currentDate}}}).
2.  **سلایدی پوختەی گشتی (type: 'overview')**: خاڵە سەرەکییەکانی داتاکان، وەک کۆی گشتی ئەرکەکان و نووسراوەکان، ڕێژەی تەواوبوون، هتد. بۆ ئەم سلایدە، پوختەیەک لە داتای گشتی ئەرک و نووسراوەکان دروست بکە لەسەر بنەمای لیستەکانی 'داتای ئەرکەکان' و 'داتای نووسراوەکان' کە لە خوارەوە پێشکەش کراون.
3.  **سلایدی ئەرکە چالاکەکان (type: 'table')**: خشتەیەک کە ئەرکە چالاکەکان (isDone=false) پیشان بدات. ستوونە پێشنیارکراوەکان: ژمارە، ناو، وردەکاری، وردەکاری زیاتر، یادخستنەوە (ئەگەر هەبوو)، کاتی دەستپێک، ماوە. بۆ ئەم سلایدە، داتا لە لیستی ئەرکەکان وەربگرە وەک لە بەشی 'داتای ئەرکەکان' ئاماژەی پێکراوە. تەنها ئەرکە چالاکەکان (isDone=false) لەخۆبگرە و لە خشتەیەکدا ڕێکیانبخە.
4.  **سلایدی ئەرکە تەواوکراوەکان (type: 'table')**: خشتەیەک کە ئەرکە تەواوکراوەکان (isDone=true) پیشان بدات. ستوونە پێشنیارکراوەکان: ژمارە، ناو، وردەکاری، ئەنجام، کاتی دەستپێک، ماوە. بۆ ئەم سلایدە، داتا لە لیستی ئەرکەکان وەربگرە وەک لە بەشی 'داتای ئەرکەکان' ئاماژەی پێکراوە. تەنها ئەرکە تەواوکراوەکان (isDone=true) لەخۆبگرە و لە خشتەیەکدا ڕێکیانبخە.
5.  **سلایدی نووسراوە چالاکەکان (type: 'table')**: خشتەیەک کە نووسراوە چالاکەکان (isDone=false) پیشان بدات. ستوونە پێشنیارکراوەکان: ژمارە، ناو، جۆری نووسراو، وردەکاری، نێردراوە بۆ، وردەکاری زیاتر، یادخستنەوە (ئەگەر هەبوو)، کاتی دەستپێک، ماوە. بۆ ئەم سلایدە، داتا لە لیستی نووسراوەکان وەربگرە وەک لە بەشی 'داتای نووسراوەکان' ئاماژەی پێکراوە. تەنها نووسراوە چالاکەکان (isDone=false) لەخۆبگرە و لە خشتەیەکدا ڕێکیانبخە.
6.  **سلایدی نووسراوە تەواوکراوەکان (type: 'table')**: خشتەیەک کە نووسراوە تەواوکراوەکان (isDone=true) پیشان بدات. ستوونە پێشنیارکراوەکان: ژمارە، ناو، جۆری نووسراو، وردەکاری، نێردراوە بۆ، ئەنجام، کاتی دەستپێک، ماوە. بۆ ئەم سلایدە، داتا لە لیستی نووسراوەکان وەربگرە وەک لە بەشی 'داتای نووسراوەکان' ئاماژەی پێکراوە. تەنها نووسراوە تەواوکراوەکان (isDone=true) لەخۆبگرە و لە خشتەیەکدا ڕێکیانبخە.
7.  **سلایدی شیکاری ئەرکەکان (type: 'chart', chartType: 'pie')**: چارتی پای کە ڕێژەی ئەرکە تەواوکراوەکان و چالاکەکان پیشان بدات. داتای ئەم چارتە لەسەر بنەمای ژمارەی ئەرکەکان لە لیستی 'داتای ئەرکەکان' حیساب بکە.
8.  **سلایدی شیکاری نووسراوەکان (type: 'chart', chartType: 'pie')**: چارتی پای کە ڕێژەی نووسراوە تەواوکراوەکان و چالاکەکان پیشان بدات. داتای ئەم چارتە لەسەر بنەمای ژمارەی نووسراوەکان لە لیستی 'داتای نووسراوەکان' حیساب بکە.
9.  **سلایدی کۆتایی (type: 'conclusion')**: پەیامێکی سوپاسگوزاری یان کۆتایی.

بۆ هەر سلایدێک، ناونیشانێکی گونجاو دابین بکە. بۆ سلایدەکانی خشتە، سەردێڕی ستوونەکان و داتای ڕیزەکان دابین بکە بە بەکارهێنانی داتای ڕاستەقینە. بۆ سلایدەکانی چارت، جۆری چارت (pie) و داتاکانی (ناوەکان و بەهاکان) دابین بکە بە حیسابکردن لەسەر داتای ڕاستەقینە.
دڵنیابە کە هەموو دەقەکان بە کوردیی ناوەندی ڕەوان و پیشەیی بن.

داتای ئەرکەکان:
{{#each tasks}}
- ئەرکی ژمارە {{taskNumber}}: {{name}} (چالاک: {{#if isDone}}بەڵێ{{else}}نەخێر{{/if}}, وردەکاری: {{detail}}, کاتی دەستپێک: {{startTime}}, ماوە: {{duration}}, ئەنجام: {{result}})
{{/each}}

داتای نووسراوەکان:
{{#each notes}}
- نووسراوی ژمارە {{noteNumber}}: {{name}} (جۆری نووسراو: {{letterType}}, چالاک: {{#if isDone}}بەڵێ{{else}}نەخێر{{/if}}, وردەکاری: {{detail}}, نێردراوە بۆ: {{sentTo}}, کاتی دەستپێک: {{startTime}}, ماوە: {{duration}}, ئەنجام: {{result}})
{{/each}}

تکایە پێکهاتەی JSON بەپێی سکیمای دەرچووی پێناسەکراو بگەڕێنەوە. دڵنیابە کە هەموو 'type'ـەکان بە دروستی دانراون بۆ هەر سلایدێک و ناوەڕۆکی سلایدەکان لەسەر بنەمای داتای پێدراو پڕکراونەتەوە.
`,
  config: {
    temperature: 0.2, // Lower temperature for more deterministic structuring
     safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const generatePowerpointSlidesFlow = ai.defineFlow(
  {
    name: 'generatePowerpointSlidesFlow',
    inputSchema: GeneratePowerpointSlidesInputSchema,
    outputSchema: GeneratePowerpointSlidesOutputSchema,
  },
  async (input) => {
    // Ensure reminder and sentTo are strings or undefined, not null
    const sanitizedTasks = input.tasks.map(task => ({
      ...task,
      reminder: task.reminder ?? undefined, // Ensure undefined instead of null for Handlebars
    }));
    const sanitizedNotes = input.notes.map(note => ({
      ...note,
      reminder: note.reminder ?? undefined, // Ensure undefined instead of null
      sentTo: note.sentTo ?? undefined,     // Ensure undefined instead of null
      letterType: note.letterType ?? undefined, // Ensure undefined instead of null
    }));

    const { output } = await prompt({ ...input, tasks: sanitizedTasks, notes: sanitizedNotes });
    if (!output) {
      throw new Error("AI failed to generate PowerPoint content structure.");
    }
    return output;
  }
);
