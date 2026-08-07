# Deploying Jack's Archive

A quick walkthrough to get this live on your domain. Should take 20–30 minutes the first time.

## 1. Get an Anthropic API key (for the AI features)

1. Go to **console.anthropic.com** and create an account (this is separate from claude.ai — it's the developer side).
2. Add a small amount of billing credit (a few dollars is plenty — each chapter or follow-up question costs a few cents).
3. Go to **API Keys** and create a new key. Copy it somewhere safe.

## 2. Put the code on GitHub

1. Go to **github.com** and create a free account if you don't have one.
2. Create a new repository (e.g. `jacks-archive`).
3. Upload every file in this folder to that repository, keeping the `netlify` subfolder structure intact.

## 3. Connect Netlify to that repo

1. Go to **netlify.com**, sign up free, click **"Add new site" → "Import an existing project"**.
2. Choose GitHub, select the repository.
3. Build settings: leave the build command blank; publish directory `.` (a single period). Netlify should auto-detect this from `netlify.toml` — confirm and deploy.
4. Wait for the first deploy. Open the random `.netlify.app` URL it gives you and confirm the sealed entry screen loads (the AI features won't work yet — that's next).

## 4. Add your API key to Netlify

1. In your Netlify site dashboard: **Site configuration → Environment variables → Add a variable**.
2. Name: `ANTHROPIC_API_KEY`
3. Value: paste the key from step 1.
4. Save, then **Deploys → Trigger deploy → Deploy site** so the functions pick it up.

## 5. Connect your domain

1. In Netlify: **Domain management → Add a domain**, enter your domain.
2. Netlify will show either nameservers to switch to, or a specific DNS record (usually CNAME) to add at your registrar.
3. Add whichever it shows at wherever you manage the domain (GoDaddy, Namecheap, etc.).
4. Can take minutes to a few hours to activate. Free HTTPS auto-provisions once it's pointed correctly.

## 6. Test it end to end

1. Visit your domain. Enter a passphrase — that's what keeps things synced across every device (same phrase, every time).
2. Answer a question — try editing its wording first, then saving.
3. Try "Go deeper on this" after saving an answer.
4. Tap **"+ File a new entry"** and add something of your own — it's available any time, independent of the question flow.
5. Open the same URL on another device with the *same* passphrase, confirm everything shows up there too.
6. Go to **Write my story** once a few things are filed, and watch the chapters stream in.

---

### A couple of honest notes

- **Not bank-grade security.** The passphrase is a simple shared key, not a full login system — fine for a private family keepsake, not for anything sensitive.
- **Cost:** realistically well under a dollar total even with heavy use, between Netlify's free tier and Anthropic's per-use pricing.
- **Length:** with all 100 questions answered, the finished memoir will land around 10,000–15,000 words (roughly 5 questions per chapter, ~500–700 words each) — call it 35–50 pages. Answering fewer, or skipping some, produces a shorter book proportionally.
- **Fabrication safeguard:** the story-writing prompt explicitly instructs the AI not to invent names, places, dates, or events that weren't in the answers — it's told to leave gaps vague rather than guess. It's a strong instruction, not an ironclad guarantee, so it's worth reading the finished chapters once to check they ring true.
- If anything doesn't match the Netlify or Anthropic dashboards you see (interfaces occasionally shift), their own help docs will have the current click-path.
