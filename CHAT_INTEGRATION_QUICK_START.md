# QUICK START: Add Vectors to Your Chat

Copy one of these three options into your chat endpoint. Done!

## OPTION A: Minimal (Just add context)

```typescript
import { enhanceChatWithContext } from '@/lib/rag-chat';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';

export async function POST(req: Request) {
  const { messages, conversationId, userId } = await req.json();
  const supabase = await getSupabaseServerClient();
  
  // Add similar past messages as context
  const { messagesWithContext } = await enhanceChatWithContext(
    supabase,
    messages,
    conversationId,
    userId
  );
  
  // Use messagesWithContext instead of messages
  const response = await callYourAI(messagesWithContext);
  
  return Response.json({ response });
}
```

## OPTION B: Full (Add context + store for future)

```typescript
import { enhanceChatWithContext, storeConversationForRAG } from '@/lib/rag-chat';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';

export async function POST(req: Request) {
  const { messages, conversationId, userId } = await req.json();
  const supabase = await getSupabaseServerClient();
  
  // 1. Add vector context
  const { messagesWithContext, contextCount } = await enhanceChatWithContext(
    supabase,
    messages,
    conversationId,
    userId
  );
  
  console.log(`📚 Using ${contextCount} context messages`);
  
  // 2. Get AI response
  const userMessage = messages[messages.length - 1].content;
  const response = await callYourAI(messagesWithContext);
  
  // 3. Store for future context
  await storeConversationForRAG(
    supabase,
    conversationId,
    userId,
    userMessage,
    response
  );
  
  return Response.json({ response, contextUsed: contextCount });
}
```

## OPTION C: One-liner (Full RAG flow)

```typescript
import { executeChatWithRAG } from '@/lib/rag-chat';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';

export async function POST(req: Request) {
  const { messages, conversationId, userId } = await req.json();
  const supabase = await getSupabaseServerClient();
  
  const { response, contextUsed } = await executeChatWithRAG(
    supabase,
    messages,
    conversationId,
    userId,
    async (enhancedMessages) => {
      return await callYourAI(enhancedMessages);
    }
  );
  
  return Response.json({ response, contextUsed });
}
```

## That's it!

**Required setup:**
- Add `GROQ_API_KEY` or `OPENAI_API_KEY` to `.env.local`
- That's all!

**Already created for you:**
- ✅ Vector index: `chat-embeddings-openai`
- ✅ Vector bucket: `vectors`
- ✅ Embeddings library: Groq + OpenAI
- ✅ RAG integration functions

---

**See Also:**
- [Full Integration Guide](docs/VECTORS_CHAT_INTEGRATION.md)
- [Status Report](VECTORS_READY.md)
