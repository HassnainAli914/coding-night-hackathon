import { config } from '../config';
import { logger } from '../utils/logger';

export interface TriageResult {
  title: string;
  category: string;
  priority: string;
  description?: string;
  possible_solution: string;
  warning?: string;
  missing_information?: string[];
}

// Priority-ordered list of free OpenRouter models
const FREE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'tencent/hy3:free',
  'poolside/laguna-m.1:free',
  'cohere/north-mini-code:free',
  'nvidia/llama-nemotron-rerank-vl-1b-v2:free',
];

export class AiService {
  /**
   * Triage a complaint using OpenRouter free models with automatic fallback chain.
   * Tries each model in priority order. Falls back to rule-based if all fail.
   */
  async triageComplaint(complaint: string, assetContext?: any): Promise<TriageResult> {
    logger.info(`Triage request: "${complaint.substring(0, 80)}..."`);

    if (!config.openrouter.apiKey) {
      logger.warn('OPENROUTER_API_KEY not set — using rule-based fallback');
      return this.triageRuleBased(complaint);
    }

    // Try each model in order until one succeeds
    for (const model of FREE_MODELS) {
      try {
        logger.info(`Trying model: ${model}`);
        const result = await this.callOpenRouter(model, complaint, assetContext);
        logger.info(`Success with model: ${model}`);
        return result;
      } catch (err: any) {
        logger.warn(`Model ${model} failed: ${err.message} — trying next...`);
      }
    }

    logger.warn('All OpenRouter models failed — using rule-based fallback');
    return this.triageRuleBased(complaint);
  }

  // ─── Single OpenRouter Model Call ───────────────────────────────────────

  private async callOpenRouter(model: string, complaint: string, assetContext?: any): Promise<TriageResult> {
    const assetInfo = assetContext
      ? `Asset: ${assetContext.name || 'Unknown'}, Category: ${assetContext.category || 'Unknown'}, Location: ${assetContext.location || 'Unknown'}.`
      : '';

    const systemPrompt = `You are a facility management AI assistant. Analyze maintenance complaints and return a structured JSON triage report.

Always respond with ONLY valid JSON in this exact format (no markdown, no explanation, no code fences):
{
  "title": "Short descriptive title of the issue (max 10 words)",
  "category": "One of: Electrical, Plumbing, HVAC / Electrical, AV / IT Hardware, Mechanical / Transport, General Maintenance",
  "priority": "One of: Low, Medium, High, Critical",
  "possible_solution": "Actionable steps for the maintenance team. Include any safety warnings here.",
  "missing_information": ["Optional array of clarifying questions if the complaint lacks detail. Empty array if sufficient."]
}`;

    const userPrompt = `${assetInfo ? assetInfo + '\n' : ''}Complaint: ${complaint}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s per model timeout

    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openrouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://assets-backend-nine.vercel.app',
          'X-Title': 'ServiceWala Asset Management',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errBody}`);
    }

    const data = await response.json();

    // Check for OpenRouter-level error (model unavailable, rate limited, etc.)
    if (data?.error) {
      throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const rawContent: string = data?.choices?.[0]?.message?.content ?? '';
    if (!rawContent.trim()) {
      throw new Error('Empty response from model');
    }

    // Strip possible markdown fences the model might add despite instructions
    const jsonStr = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Invalid JSON from model: ${jsonStr.substring(0, 100)}`);
    }

    return {
      title: parsed.title || 'Reported Issue',
      category: parsed.category || 'General Maintenance',
      priority: parsed.priority || 'Medium',
      possible_solution: parsed.possible_solution || 'A technician will inspect the issue.',
      missing_information: Array.isArray(parsed.missing_information) ? parsed.missing_information : [],
    };
  }

  // ─── Rule-Based Fallback ─────────────────────────────────────────────────

  private triageRuleBased(complaint: string): TriageResult {
    const text = complaint.toLowerCase();

    if (text.includes('projector') || text.includes('display') || text.includes('hdmi') || text.includes('flicker')) {
      return {
        title: 'Projector display flickering / HDMI connection fault',
        category: 'AV / IT Hardware',
        priority: 'Medium',
        possible_solution: 'Disconnect and firmly reconnect the HDMI cable; verify projector input source setting; test with an alternate device. Avoid looking directly into the projector lens while on.',
      };
    }

    if (text.includes('ac') || text.includes('cooling') || text.includes('air conditioner') || text.includes('compressor')) {
      const isCritical = text.includes('smoke') || text.includes('fire') || text.includes('spark');
      return {
        title: isCritical ? 'CRITICAL: AC electrical short / smoking unit' : 'Air Conditioner leakage & cooling inefficiency',
        category: 'HVAC / Electrical',
        priority: isCritical ? 'Critical' : 'High',
        possible_solution: isCritical
          ? 'IMMEDIATELY turn off the circuit breaker powering the unit. Keep clear of the area. Danger of electrical shock — do not attempt manual inspection.'
          : 'Power down the AC unit; inspect air filters for dust accumulation; check condensate drain line.',
      };
    }

    if (text.includes('elevator') || text.includes('lift') || text.includes('stuck')) {
      return {
        title: 'Elevator mechanical fault / door sensor failure',
        category: 'Mechanical / Transport',
        priority: 'Critical',
        possible_solution: 'Do not attempt to pry doors open. Press the internal cabin emergency alarm button. A certified technician must resolve this — contact rescue services if persons are trapped.',
      };
    }

    if (text.includes('pipe') || text.includes('water') || text.includes('plumbing') || text.includes('tap') || text.includes('sink') || text.includes('leak')) {
      return {
        title: 'Water pipe leakage / pressure drop',
        category: 'Plumbing / Facilities',
        priority: 'Medium',
        possible_solution: 'Locate and turn off the nearest water isolation valve; place a bucket to contain pooling water; clear nearby valuables.',
      };
    }

    if (text.includes('wire') || text.includes('spark') || text.includes('socket') || text.includes('power') || text.includes('switch') || text.includes('electric')) {
      return {
        title: 'Electrical circuit fault / socket arcing',
        category: 'Electrical',
        priority: 'High',
        possible_solution: 'Unplug all connected devices on the circuit. Do not touch any damp surfaces near the outlet. High voltage risk — do not insert tools into wall receptacles.',
      };
    }

    return {
      title: 'Reported equipment / facility fault',
      category: 'General Maintenance',
      priority: 'Medium',
      possible_solution: 'Safely disconnect power if applicable; post a temporary "Out of Service" sign; keep area clear until a technician inspects the issue.',
    };
  }
}

export const aiService = new AiService();
