import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Signup endpoint
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
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user.id);
    return c.json({ success: true, user: data.user });

  } catch (error) {
    console.error('Error in signup endpoint:', error);
    return c.json({ error: 'Internal server error during signup', details: error.message }, 500);
  }
});

// Get language system prompt
function getSystemPrompt(language: string) {
  const baseContent = `You are JusticeConnect, a helpful AI legal assistant specialized in Philippine law. You help Filipino citizens understand their legal rights and responsibilities under Philippine law.`;

  const languageInstructions = {
    english: 'Respond in English.',
    tagalog: 'Respond in Tagalog (Filipino). Use natural Tagalog expressions and terms.',
    bisaya: 'Respond in Bisaya (Cebuano). Use natural Bisaya/Cebuano expressions and terms.'
  };

  return `${baseContent}

${languageInstructions[language.toLowerCase()] || languageInstructions.english}

Key guidelines:
- Provide information about Philippine laws, regulations, and legal processes
- Explain legal concepts in simple, easy-to-understand language
- Reference specific laws when applicable (e.g., Civil Code, Revised Penal Code, Labor Code)
- Always remind users that you provide general information only, not legal advice
- Encourage users to consult with a licensed Philippine lawyer for specific legal matters
- Be respectful, professional, and empathetic
- If asked about laws from other countries, politely redirect to Philippine law

You should help with topics like:
- Family law (marriage, annulment, child custody)
- Labor rights and employment
- Property and land rights
- Criminal law basics
- Small claims and disputes
- Government procedures and documentation
- Consumer rights
- Traffic violations and regulations`;
}

// Chat endpoint
app.post('/make-server-a76efa1a/chat', async (c) => {
  try {
    const { message, conversationHistory, language = 'english', userId, chatId } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('Groq API key not found in environment variables');
      return c.json({ error: 'Groq API key not configured' }, 500);
    }

    // Prepare messages for Groq
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(language)
      },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log(`Sending request to Groq API (language: ${language})...`);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return c.json({ error: 'Failed to get response from Groq', details: errorData }, response.status);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    const newConversationHistory = [...messages.slice(1), { role: 'assistant', content: aiMessage }];

    // Save chat history for logged-in users
    if (userId && chatId) {
      try {
        const chatKey = `chat:${userId}:${chatId}`;
        const chatData = {
          id: chatId,
          userId,
          messages: newConversationHistory,
          language,
          updatedAt: new Date().toISOString()
        };
        await kv.set(chatKey, chatData);
        console.log(`✓ Chat history saved successfully:`, {
          key: chatKey,
          userId,
          chatId,
          messageCount: newConversationHistory.length,
          language
        });
      } catch (error) {
        console.error('Error saving chat history:', error);
        // Don't fail the request if history save fails
      }
    } else {
      console.log('Chat history not saved - userId or chatId missing:', { userId: !!userId, chatId: !!chatId });
    }

    console.log('Successfully received response from Groq');

    return c.json({
      message: aiMessage,
      conversationHistory: newConversationHistory
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Get chat history list for a user
app.get('/make-server-a76efa1a/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      console.error('Authorization error while fetching chat history:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prefix = `chat:${user.id}:`;
    const chats = await kv.getByPrefix(prefix);

    // Sort by most recent first and filter out null/undefined values
    const sortedChats = chats
      .map(chat => chat.value)
      .filter(chat => chat && chat.id && chat.messages)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    console.log(`Retrieved ${sortedChats.length} chats for user ${user.id}`);
    return c.json({ chats: sortedChats });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return c.json({ error: 'Internal server error while fetching history', details: error.message }, 500);
  }
});

// Delete a chat
app.delete('/make-server-a76efa1a/chat/:chatId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      console.error('Authorization error while deleting chat:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatId = c.req.param('chatId');
    const chatKey = `chat:${user.id}:${chatId}`;
    
    await kv.del(chatKey);
    console.log(`Chat ${chatId} deleted for user ${user.id}`);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error deleting chat:', error);
    return c.json({ error: 'Internal server error while deleting chat', details: error.message }, 500);
  }
});

// Health check endpoint
app.get('/make-server-a76efa1a/health', (c) => {
  return c.json({ status: 'ok', message: 'JusticeConnect server is running' });
});

Deno.serve(app.fetch);