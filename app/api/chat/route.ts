import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.LLM_API_KEY });

const SYSTEM_PROMPT = `You are APLE's expert appliance diagnostic assistant. Your goal is to help customers identify their appliance problem and prepare a repair quote.

Rules:
- Ask ONE question at a time — never multiple
- Start by asking what type of appliance they have
- Follow up dynamically based on answers (brand, model, year, symptoms, frequency, error codes)
- Offer 1-2 basic troubleshooting suggestions when relevant
- Assess urgency (safety risk, food spoilage, etc.)
- After 5-8 exchanges when you have enough info, output ONLY this JSON (no markdown, no extra text):
{"appliance_type":"...","year":null,"brand":"...","model":"...","category":"...","symptoms":["..."],"complexity":5,"estimated_parts":150}

complexity is 1-10 (1=simple, 10=complex rebuild).
estimated_parts is USD cost of parts only.
Do NOT output the JSON until you have: appliance type, brand, model/age, and at least 2 symptoms.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 400,
    temperature: 0.4,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
