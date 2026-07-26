import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI, authAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { format } from 'date-fns';
import { MOODS } from '../utils/constants.js';

const RESOURCES = [
  { icon: 'ti-lungs', label: 'Breathing exercises', prompt: 'Can you guide me through a breathing exercise for anxiety?' },
  { icon: 'ti-brain', label: 'Grounding technique', prompt: 'Teach me a grounding technique to feel present and calm.' },
  { icon: 'ti-notebook', label: 'Journal prompt', prompt: 'Give me a helpful journaling prompt for self-reflection.' },
  { icon: 'ti-sun', label: 'Daily affirmations', prompt: 'Share some positive affirmations to start my day with.' },
  { icon: 'ti-heart', label: 'Self-compassion', prompt: 'Help me practice self-compassion — I\'ve been hard on myself lately.' },
  { icon: 'ti-zzz', label: 'Sleep tips', prompt: 'What are some evidence-based tips for better sleep?' },
];

const INITIAL_MESSAGES = [
  {
    id: 'init',
    role: 'assistant',
    content: "Hi there 👋 I'm your AI wellness companion. I'm here to listen, offer coping strategies, and help you prepare for therapy sessions. How are you doing today?",
    time: format(new Date(), 'h:mm a'),
  },
];

export default function AISupportPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    if (!text.trim() || sending) return;

    const userMsg = { id: Date.now(), role: 'user', content: text.trim(), time: format(new Date(), 'h:mm a') };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const apiMessages = newMessages
        .filter((m) => m.role !== 'init' && m.id !== 'init')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiAPI.chat(apiMessages);
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.reply,
        time: format(new Date(), 'h:mm a'),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Please try again in a moment. If you need immediate support, you can reach the 988 Suicide & Crisis Lifeline by calling or texting 988.",
        time: format(new Date(), 'h:mm a'),
      };
      setMessages((prev) => [...prev, errMsg]);
      if (err.response?.status !== 429) {
        showToast('AI connection issue. Please try again.', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const handleMood = async (mood) => {
    setSelectedMood(mood.label);
    try { await authAPI.logMood({ mood: mood.label, emoji: mood.emoji }); } catch {}
    send(`I'm feeling ${mood.label.toLowerCase()} today ${mood.emoji}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      <div className="container" style={{ height: 'calc(100vh - var(--nav-height) - 2rem)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '1rem' }}>AI Wellness Support</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
          {}
          <div className="card flex-col" style={{ overflow: 'hidden' }}>
            <div className="card-header"><span className="card-title"><i className="ti ti-mood-heart" /> How are you?</span></div>
            <div className="mood-grid">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  className={`mood-btn${selectedMood === m.label ? ' active' : ''}`}
                  onClick={() => handleMood(m)}
                  disabled={sending}
                >
                  <div className="mood-emoji">{m.emoji}</div>
                  <div className="mood-label-text">{m.label}</div>
                </button>
              ))}
            </div>

            <div style={{ padding: '0 1rem 0.5rem', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Resources
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {RESOURCES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => send(r.prompt)}
                  disabled={sending}
                  style={{
                    width: '100%', padding: '8px 1rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--text-secondary)',
                    transition: 'background 0.1s', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <i className={`ti ${r.icon}`} style={{ color: 'var(--teal)', fontSize: 16, flexShrink: 0 }} />
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '1rem', borderTop: '0.5px solid var(--border)' }}>
              <Link to="/therapists" className="btn btn-primary btn-sm btn-full">
                <i className="ti ti-calendar-plus" /> Book real session
              </Link>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
                AI support is not a replacement for licensed therapy.
              </p>
            </div>
          </div>

          {}
          <div className="card flex-col" style={{ overflow: 'hidden' }}>
            {}
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--purple-light)', color: 'var(--purple)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  <i className="ti ti-sparkles" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>healthify AI</div>
                  <div style={{ fontSize: 12, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                    Online — here to listen
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by Claude</div>
            </div>

            {}
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg ${msg.role}`}>
                  <div className={`bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                    {msg.content}
                  </div>
                  <div className="msg-time">{msg.time}</div>
                </div>
              ))}

              {sending && (
                <div className="chat-msg assistant">
                  <div className="bubble bubble-assistant">
                    <div className="typing-dots">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Share what's on your mind…"
                rows={1}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKey}
                disabled={sending}
              />
              <button
                className="send-btn"
                onClick={() => send(input)}
                disabled={sending || !input.trim()}
              >
                <i className="ti ti-send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
