const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a compassionate AI wellness companion for Healer, an online therapy platform. Your role:

- Listen empathetically and validate emotions without judgment
- Offer evidence-based coping strategies: breathing exercises, grounding techniques (5-4-3-2-1), CBT thought challenging, progressive muscle relaxation
- Help users prepare for therapy sessions — what to bring up, how to articulate their feelings
- Gently encourage professional help when needed, and remind users they can book a real session
- Keep responses warm, concise (2-4 sentences typically), and actionable
- NEVER diagnose, prescribe, or replace a licensed therapist
- If someone expresses suicidal ideation or crisis: immediately provide the 988 Suicide & Crisis Lifeline and encourage them to call
- Maintain confidentiality — never reference previous unrelated conversations
- Ask one follow-up question to deepen understanding when appropriate

You speak as a friend with clinical knowledge — warm, direct, practical. Not clinical jargon, not toxic positivity.`;

router.post('/chat', protect, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const validMessages = messages
      .filter((m) => m.role && m.content && typeof m.content === 'string')
      .slice(-20) 
      .map((m) => ({ role: m.role, content: m.content }));

    if (validMessages.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: validMessages,
    });

    const reply = response.content[0]?.text || "I'm here for you. Can you tell me more about how you're feeling?";

    res.json({
      reply,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' });
    }
    next(err);
  }
});

module.exports = router;
