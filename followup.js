export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();
  const { question, answer } = body;

  if (!question || !answer) {
    return new Response(JSON.stringify({ error: "missing question or answer" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY. Set it in Netlify site settings." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const prompt = `An 18-year-old named Jack just answered this journaling prompt:

Q: ${question}
A: ${answer}

Write ONE natural follow-up question that digs a little deeper into what he specifically just said — not a generic follow-up, one that clearly reacts to his actual answer. Keep it short, warm, and conversational, like a curious friend saying "wait, what happened next?" or "how'd that feel in the moment?"

Important: only ask about things he actually mentioned. Don't assume or name a specific person, place, or detail he didn't state — if you want to reference something from his answer, use his own words for it rather than guessing a name or specific he didn't give.

Respond with ONLY the question itself, nothing else.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const json = await resp.json();

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: json.error?.message || "Anthropic API error" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const text = (json.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return new Response(JSON.stringify({ question: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to reach Anthropic API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/.netlify/functions/followup" };
