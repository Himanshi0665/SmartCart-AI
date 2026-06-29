import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT_VERSION = "v1.0";

const summarizeSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = summarizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: parsed.data.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return cached summary if it exists and prompt version matches
    if (product.aiSummary) {
      const cached = product.aiSummary as {
        promptVersion?: string;
        pros: string[];
        cons: string[];
        verdict: string;
        score: number;
      };
      if (cached.promptVersion === PROMPT_VERSION) {
        return NextResponse.json(cached);
      }
    }

    // Build context for AI
    const productContext = `
Product Title: ${product.title}
Brand: ${product.brand ?? "Unknown"}
Category: ${product.category ?? "General"}
Current Price: ₹${product.currentPrice}
Rating: ${product.rating ?? "N/A"}/5 (${product.reviewCount ?? 0} reviews)
Availability: ${product.availability ? "In Stock" : "Out of Stock"}
Key Features:
${product.features.map((f, i) => `${i + 1}. ${f}`).join("\n")}
${product.description ? `\nDescription: ${product.description.slice(0, 800)}` : ""}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert product analyst for an AI shopping assistant. 
Analyze the product information and generate a structured review summary.
Be concise, specific, and helpful. Base your analysis on the actual product data provided.
Respond ONLY with valid JSON, no markdown, no explanation outside the JSON.`,
        },
        {
          role: "user",
          content: `Analyze this product and provide a JSON response with exactly this structure:
{
  "pros": ["specific pro 1", "specific pro 2", "specific pro 3"],
  "cons": ["specific con 1", "specific con 2"],
  "verdict": "2-3 sentence summary of whether to buy this product and why",
  "score": <integer 0-100 representing overall buy recommendation>
}

Score guide: 80-100 = Highly Recommended, 60-79 = Good Buy, 40-59 = Decent Option, 20-39 = Think Twice, 0-19 = Avoid

Product data:
${productContext}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0].message.content;
    if (!rawResponse) throw new Error("Empty AI response");

    const aiData = JSON.parse(rawResponse);

    const summary = {
      pros: aiData.pros ?? [],
      cons: aiData.cons ?? [],
      verdict: aiData.verdict ?? "",
      score: aiData.score ?? 50,
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
    };

    // Cache in DB + update verdict score
    await db.product.update({
      where: { id: product.id },
      data: {
        aiSummary: summary,
        aiVerdict: summary.score,
      },
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[/api/ai/summarize] Error:", error);
    return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
  }
}
