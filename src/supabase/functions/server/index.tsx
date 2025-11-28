import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

/* -----------------------------------------------------
   SYSTEM PROMPT (AUTO-LANGUAGE + TEAMBANGAN + RA LINKS)
------------------------------------------------------ */
function getSystemPrompt(preferredLanguage: string) {
  return `
You are JusticeConnect, a helpful AI legal assistant specialized in Philippine law.

LANGUAGE POLICY:
- Detect the language used in the user's latest message.
- ALWAYS reply in **that same language** (English, Tagalog, Bisaya, Cebuano, mixed, etc.).
- If uncertain, fall back to: ${preferredLanguage}.

CREATOR / ORIGIN RULE:
If the user asks who made you, who created you, who built you,
“Sino gumawa sayo?”, “Kinsa nag-himo nimo?”, or anything related,
ALWAYS respond with this exact message:

"I was made by TeamBangan as an HCI PIT for the 1st semester of 2025–2026.
Here are the members:
● Galendez, Hanz
● Lagamon, Lester
● Pon, Bryll Bryan
● Seguerra, Huebert
● Yarra, Dave"

REPUBLIC ACT (RA) RULE:
If the user mentions any “RA ___”, “Republic Act ___”, “Batas”, or any Philippine law:
- Provide a simple explanation.
- ALWAYS include this line at the end:
“For full legal text, you may visit Lawphil: https://lawphil.net”

LEGAL GUIDELINES:
- Explain Philippine law in simple, clear terms.
- Provide general information only, not legal advice.
- Reference specific laws when relevant.
- Encourage consulting a licensed Philippine lawyer for specific concerns.
- Stay respectful, empathetic, and professional.
 `;
}

/* -----------------------------------------------------
   SIGNUP ENDPOINT
------------------------------------------------------ */
app.post('/make-server-a76efa1a/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });

  } catch (error) {
    return c.json({ error: 'Internal server error during signup', details: error.message }, 500);
  }
});

/* -----------------------------------------------------
   CHAT ENDPOINT (GROQ)
------------------------------------------------------ */
app.post('/make-server-a76efa1a/chat', async (c) => {
  try {
    const { message, conversationHistory, language = 'english', userId, chatId } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return c.json({ error: 'Groq API key not configured' }, 500);
    }

    /* -----------------------------------------
       TEAM BANGAN — ALWAYS RETURN EXACT ANSWER
    ------------------------------------------ */
    const lowerMsg = message.toLowerCase();
    const creatorTriggers = [
      "who made you", "who created you", "your creator",
      "sino gumawa", "gumawa sayo", "gumawa sa'yo",
      "kinsa nag himo", "kinsa nag-himo", "developer mo",
      "origin mo", "who built you"
    ];

    if (creatorTriggers.some((q) => lowerMsg.includes(q))) {
      return c.json({
        message: `I was made by TeamBangan as an HCI PIT for the 1st semester of 2025–2026.
Here are the members:
● Galendez, Hanz
● Lagamon, Lester
● Pon, Bryll Bryan
● Seguerra, Huebert
● Yarra, Dave`
      });
    }

    /* -----------------------------------------
       AUTO RA HANDLING — Insert LawPhil link
    ------------------------------------------ */
    const raPattern = /(ra\s*\d+|republic act\s*\d+|batas\s*\d+)/i;
    const shouldInjectLawphil = raPattern.test(message);

    /* -----------------------------------------
       PREPARE MESSAGES
    ------------------------------------------ */
    const messages = [
      { role: 'system', content: getSystemPrompt(language) },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    /* -----------------------------------------
       CALL GROQ
    ------------------------------------------ */
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return c.json({ error: 'Failed to get response from Groq', details: errorData }, response.status);
    }

    const data = await response.json();
    let aiMessage = data.choices[0].message.content;

    /* -----------------------------------------
       FINAL RA LAWPHIL INJECTION
    ------------------------------------------ */
    if (shouldInjectLawphil) {
      aiMessage += `\n\nFor full legal text, you may visit Lawphil: https://lawphil.net`;
    }

    /* -----------------------------------------
       UPDATE HISTORY
    ------------------------------------------ */
    const newConversationHistory = [
      ...messages.slice(1),
      { role: 'assistant', content: aiMessage }
    ];

    if (userId && chatId) {
      const chatKey = `chat:${userId}:${chatId}`;
      const chatData = {
        id: chatId,
        userId,
        messages: newConversationHistory,
        language,
        updatedAt: new Date().toISOString()
      };
      await kv.set(chatKey, chatData);
    }

    return c.json({
      message: aiMessage,
      conversationHistory: newConversationHistory
    });

  } catch (error) {
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/* -----------------------------------------------------
   GET CHAT HISTORY
------------------------------------------------------ */
app.get('/make-server-a76efa1a/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.id) return c.json({ error: 'Unauthorized' }, 401);

    const prefix = `chat:${user.id}:`;
    const chats = await kv.getByPrefix(prefix);

    const sorted = chats
      .map(x => x.value)
      .filter(x => x && x.messages)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return c.json({ chats: sorted });

  } catch (error) {
    return c.json({ error: 'Internal server error fetching history', details: error.message }, 500);
  }
});

/* -----------------------------------------------------
   DELETE CHAT
------------------------------------------------------ */
app.delete('/make-server-a76efa1a/chat/:chatId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.id) return c.json({ error: 'Unauthorized' }, 401);

    const chatId = c.req.param('chatId');
    await kv.del(`chat:${user.id}:${chatId}`);

    return c.json({ success: true });

  } catch (error) {
    return c.json({ error: 'Internal server error deleting chat', details: error.message }, 500);
  }
});

/* -----------------------------------------------------
   HEALTH CHECK
------------------------------------------------------ */
app.get('/make-server-a76efa1a/health', (c) => {
  return c.json({ status: 'ok', message: 'JusticeConnect server is running' });
});

Deno.serve(app.fetch);
