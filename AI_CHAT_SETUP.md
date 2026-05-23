# AI Chat Setup - FREE Option

## Your Chat Widget Works RIGHT NOW! 🎉

The chat widget is **already working** with built-in rule-based responses. No API key needed!

It can answer common questions about:
- Pricing and costs
- Delivery integration
- Supplies marketplace  
- Support contact information

---

## Want Smarter AI? Get Groq (FREE) ⚡

**Groq is 100% free and incredibly fast!**

### Why Groq?
- ✅ **FREE**: 14,400 requests per day (enough for ~500 conversations/day)
- ✅ **FAST**: 300+ tokens/second (almost instant responses)
- ✅ **POWERFUL**: Llama 3.3 70B model (beats GPT-3.5)
- ✅ **NO CREDIT CARD**: Just sign up with email

### Get Your Free API Key (2 minutes)

1. **Sign up**: Go to https://console.groq.com
2. **Create account**: Use email or GitHub
3. **Get key**: Click "API Keys" → "Create API Key"
4. **Copy it**: Starts with `gsk_...`

### Add to Your Project

**Local Development:**
Create `.env.local` in `apps/portal/`:
```bash
GROQ_API_KEY=gsk_your_key_here
```

**Vercel Deployment:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add: `GROQ_API_KEY` = `gsk_your_key_here`
4. Redeploy

That's it! Your chat widget now has powerful AI. 🚀

---

## Alternative: OpenAI (Paid)

If you prefer OpenAI (requires credit card):

```bash
OPENAI_API_KEY=sk_...
```

**Note**: If both keys are set, Groq will be used (it's free!).

---

## How It Works

The chat API tries these in order:

1. **Groq** (if `GROQ_API_KEY` is set) - FREE & FAST ⭐
2. **OpenAI** (if `OPENAI_API_KEY` is set) - Paid
3. **Rule-based** (no key needed) - Basic but works!

---

## Free Tier Limits

**Groq Free Tier:**
- 14,400 requests per day
- 300,000 tokens per day
- ~500 full conversations per day
- Perfect for most websites!

**What happens if I hit the limit?**
- Chat falls back to rule-based responses
- Users still get help
- No errors or downtime

---

## Questions?

**"Do I need to add a credit card to Groq?"**
No! Groq is completely free with no credit card required.

**"Will my chat widget stop working if I don't add a key?"**
No! It works right now with rule-based responses.

**"Can I test the AI locally?"**
Yes! Add the key to `.env.local` and run `pnpm dev`.

**"Is Groq actually good?"**
Yes! Llama 3.3 70B is comparable to GPT-4 for most tasks, and Groq's inference is 5-10x faster than OpenAI.

---

## Comparison

| Feature | Rule-Based (No Key) | Groq (Free) | OpenAI (Paid) |
|---------|---------------------|-------------|---------------|
| Cost | FREE | FREE | ~$0.15/1000 messages |
| Speed | Instant | Ultra-fast (300 tokens/s) | Fast (50 tokens/s) |
| Quality | Basic Q&A | Very good | Excellent |
| Setup | None | 2 minutes | 5 minutes |
| Credit Card | No | No | Yes |
| Daily Limit | Unlimited | 14,400 requests | Pay per use |

**Recommendation**: Start with no key (it works!), then add Groq when you want better AI.
