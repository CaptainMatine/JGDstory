export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();
  const { qa, chapterNumber, totalChapters } = body;

  if (!qa || !chapterNumber || !totalChapters) {
    return new Response(JSON.stringify({ error: "missing chapter data" }), {
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

  const positionNote =
    chapterNumber === 1
      ? "This is the opening chapter — start the memoir naturally, no need for a big dramatic intro."
      : chapterNumber === totalChapters
        ? "This is the final chapter — it's fine to let it feel like a natural close, but don't force a neat bow if the material doesn't call for one."
        : "This is a middle chapter — write it so it flows as a continuation, not a self-contained essay.";

  const prompt = `You're helping an 18-year-old named Jack turn his own journal-style answers into a memoir written in his voice. This is chapter ${chapterNumber} of ${totalChapters}. ${positionNote}

Rules:
- Write in first person, like Jack telling these stories to a friend. Keep his humor and specific details intact.
- FACTUAL ACCURACY IS CRITICAL. Do not invent, assume, or embellish any specific fact that isn't in his answers below — this includes names of people, places, schools, teams, pets, dates, ages, and the outcome or details of any event. Never fill a gap with a plausible-sounding invented specific.
- If a detail is missing or ambiguous, either leave it out entirely or phrase around it vaguely ("a friend," "a teacher," "that summer," "one time") rather than guessing a name, place, or date.
- You may add ordinary connective narration — transitions between topics, describing a feeling, a natural turn of phrase — but never a new factual claim about what happened, who was there, or how something turned out.
- If an answer is short or thin on detail, write that section shorter and more general rather than padding it out with invented specifics. It's better for a section to feel brief and true than long and partly made up.
- Don't make it sound like a formal biography or resume — it's okay if it jumps between topics, since that's how memory actually works.
- Start your response with a short chapter title on its own line (no "Chapter ${chapterNumber}:" prefix needed, just an evocative title), then a blank line, then the chapter text.
- Aim for around 500-700 words.

Here are the journal answers this chapter is built from:

${qa}`;

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
        max_tokens: 1000,
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
      .join("\n");

    return new Response(JSON.stringify({ chapter: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to reach Anthropic API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/.netlify/functions/story" };
