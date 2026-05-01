import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that analyzes customer requests for a support team.
Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "one sentence: what the client wants",
  "priority": "low" or "medium" or "high",
  "next_step": "one clear recommended action for the team"
}
Be concise. Do not add any text outside the JSON.`,
        },
        {
          role: "user",
          content: `Analyze this customer request:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const raw = completion.choices[0].message.content ?? "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
