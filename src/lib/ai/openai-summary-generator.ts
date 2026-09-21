import OpenAI from 'openai';
import type { Task } from '@/types/task';
import type { WeeklySummary } from '@/types/summary';
import { serverEnv } from '@/lib/env';
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from '@/lib/ai/prompt';
import type { SummaryGenerator } from '@/lib/ai/summary-generator';
import { parseSummaryResponse } from '@/lib/ai/summary-parser';

export class OpenAISummaryGenerator implements SummaryGenerator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(client?: OpenAI, model?: string) {
    this.client = client ?? new OpenAI({ apiKey: serverEnv.openaiApiKey });
    this.model = model ?? serverEnv.openaiModel;
  }

  async generate(
    tasks: readonly Task[],
    reference: Date,
  ): Promise<Omit<WeeklySummary, 'generated_at'>> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: buildSummaryUserPrompt(tasks, reference) },
      ],
    });

    return parseSummaryResponse(completion.choices[0]?.message?.content, tasks, reference);
  }
}
