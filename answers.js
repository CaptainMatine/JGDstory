import { getStore } from "@netlify/blobs";

const EMPTY_DATA = {
  order: null, // shuffled array of fixed-question indices, set once on first load
  answers: {}, // { [fixedIndex]: { question: "text (possibly edited)", answer: "text", savedAt } }
  followups: [], // [{ id, parentIndex, question, answer, savedAt }]
  customEntries: [], // [{ id, question, answer, savedAt }]
  story: null, // { chapters: [{ title, text }], generatedAt } or null
};

export default async (req) => {
  const store = getStore("jacks-life-story");
  const url = new URL(req.url);
  const user = (url.searchParams.get("user") || "").trim().toLowerCase();

  if (!user) {
    return new Response(JSON.stringify({ error: "missing user key" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key = `data:${user}`;

  if (req.method === "GET") {
    const data = (await store.get(key, { type: "json" })) || EMPTY_DATA;
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const existing = (await store.get(key, { type: "json" })) || EMPTY_DATA;

    if (body.order) existing.order = body.order;

    if (body.answers) {
      existing.answers = { ...existing.answers, ...body.answers };
    }

    if (body.followups) {
      // full replace — client always sends the complete up-to-date array
      existing.followups = body.followups;
    }

    if (body.customEntries) {
      // full replace — client always sends the complete up-to-date array
      existing.customEntries = body.customEntries;
    }

    if (body.story !== undefined) {
      existing.story = body.story;
    }

    await store.setJSON(key, existing);
    return new Response(JSON.stringify(existing), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/.netlify/functions/answers" };
