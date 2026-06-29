import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  productId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { message, productId } = parsed.data;

    // Get product context if provided
    let productContext = "";
    let product = null;
    if (productId) {
      product = await db.product.findUnique({ where: { id: productId } });
      if (product) {
        productContext = `
Current Product Context:
- Title: ${product.title}
- Brand: ${product.brand ?? "Unknown"}
- Price: ₹${product.currentPrice}
- Rating: ${product.rating ?? "N/A"}/5 (${product.reviewCount ?? 0} reviews)
- Category: ${product.category ?? "General"}
- Availability: ${product.availability ? "In Stock" : "Out of Stock"}
- Key Features: ${product.features.slice(0, 5).join("; ")}
        `.trim();
      }
    }

    // Get recent chat history (last 6 messages for context)
    const recentMessages = await db.aiChatMessage.findMany({
      where: { userId, productId: productId ?? null },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const historyMessages = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    // Save user message
    await db.aiChatMessage.create({
      data: {
        userId,
        productId: productId ?? null,
        role: "USER",
        content: message,
      },
    });

    const systemPrompt = `You are SmartCart AI's shopping assistant — an expert at helping people make smart purchasing decisions.
You are direct, helpful, and data-driven. You base your answers on real product data when available.
Keep responses concise (2-4 sentences) and actionable.
${productContext ? `\n${productContext}` : ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    const reply = completion.choices[0].message.content ?? "I couldn't generate a response. Please try again.";

    // Save assistant message
    await db.aiChatMessage.create({
      data: {
        userId,
        productId: productId ?? null,
        role: "ASSISTANT",
        content: reply,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[/api/ai/chat] Error:", error);
    return NextResponse.json({ error: "AI chat failed. Please try again." }, { status: 500 });
  }
}

// GET /api/ai/chat?productId=xxx — get chat history
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const messages = await db.aiChatMessage.findMany({
      where: { userId, productId: productId ?? null },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[/api/ai/chat GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
