// Helper Groq - server-only. NU importa in componente client.
// Cheia GROQ_API_KEY se seteaza pe Vercel (variabila de mediu server-side).

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY nu este setat. Configureaza variabila de mediu pe Vercel.');
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API a returnat ${res.status}: ${errText || res.statusText}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Raspuns invalid de la Groq (lipseste continutul).');
  }

  return content;
}
