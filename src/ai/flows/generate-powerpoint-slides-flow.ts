// 'use server';

import { z } from 'zod';

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
  console.warn("PPT Generation disabled for static export.");
  return { slides: [] };
}
