import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { analyserAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';

const STEPS = [
  {
    key: 'mood',
    type: 'single',
    prompt: "Hey, I'm your AI Analyser 🧭 — think of me as a quick, friendly check-in on how you're really doing. First up: how has your mood been lately?",
    options: [
      { value: 'great', label: 'Great', emoji: '😊' },
      { value: 'okay', label: 'Okay', emoji: '😐' },
      { value: 'low', label: 'Low', emoji: '😔' },
      { value: 'anxious', label: 'Anxious', emoji: '😰' },
      { value: 'frustrated', label: 'Frustrated', emoji: '😠' },
      { value: 'exhausted', label: 'Exhausted', emoji: '😴' },
    ],
  },
  {
    key: 'symptoms',
    type: 'multi',
    prompt: "Which of these have you noticed recently? Pick as many as apply.",
    options: [
      { value: 'racing_thoughts', label: 'Racing thoughts / constant worry' },
      { value: 'on_edge', label: 'Restlessness, feeling on edge' },
      { value: 'panic_feelings', label: 'Rapid heartbeat / panic feelings' },
      { value: 'persistent_sadness', label: 'Persistent sadness or emptiness' },
      { value: 'loss_of_interest', label: 'Lost interest in things you enjoyed' },
      { value: 'low_energy', label: 'Low energy / fatigue' },
      { value: 'concentration', label: 'Trouble concentrating' },
      { value: 'sleep_trouble', label: 'Trouble falling/staying asleep' },
      { value: 'oversleeping', label: 'Sleeping much more than usual' },
      { value: 'irritability', label: 'Irritability / anger outbursts' },
      { value: 'overwhelmed', label: 'Feeling overwhelmed by responsibilities' },
      { value: 'flashbacks', label: 'Flashbacks or intrusive memories' },
      { value: 'avoidance', label: 'Avoiding reminders of a past event' },
      { value: 'numbness', label: 'Feeling numb or disconnected' },
      { value: 'relationship_conflict', label: 'Conflict with partner/family' },
      { value: 'loneliness', label: 'Feeling lonely or isolated' },
      { value: 'grieving', label: 'Grieving a loss' },
      { value: 'self_criticism', label: 'Low self-worth / self-criticism' },
      { value: 'appetite_changes', label: 'Appetite changes' },
    ],
    allowNone: true,
  },
  {
    key: 'duration',
    type: 'single',
    prompt: "How long has this been going on?",
    options: [
      { value: 'couple_days', label: 'A day or two' },
      { value: 'about_a_week', label: 'About a week' },
      { value: 'few_weeks', label: 'A few weeks' },
      { value: 'month_plus', label: 'A month or more' },
    ],
  },
  {
    key: 'sleep',
    type: 'single',
    prompt: "How's your sleep been?",
    options: [
      { value: 'good', label: 'Good' },
      { value: 'okay', label: 'Okay' },
      { value: 'poor', label: 'Poor' },
    ],
  },
  {
    key: 'energy',
    type: 'single',
    prompt: "And your energy levels during the day?",
    options: [
      { value: 'good', label: 'Good' },
      { value: 'okay', label: 'Okay' },
      { value: 'poor', label: 'Low' },
    ],
  },
  {
    key: 'stressLevel',
    type: 'single',
    prompt: "How manageable does your day-to-day stress feel right now?",
    options: [
      { value: 'low', label: 'Low' },
      { value: 'manageable', label: 'Manageable' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    key: 'history',
    type: 'multi',
    prompt: "Any relevant history? This helps tailor recommendations. (Optional — pick any that apply.)",
    options: [
      { value: 'prior_diagnosis', label: 'Previously diagnosed with a mental health condition' },
      { value: 'prior_therapy', label: "I've been in therapy before" },
      { value: 'on_medication', label: 'Currently on medication for mental health' },
      { value: 'prefer_not_say', label: 'Prefer not to say' },
    ],
    allowNone: true,
  },
  {
    key: 'risk',
    type: 'single',
    prompt: "One important question: lately, have you had thoughts of hurting yourself, or that life isn't worth living?",
    sensitive: true,
    options: [
      { value: 'no', label: 'No' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'frequently', label: 'Frequently' },
      { value: 'unspecified', label: 'Prefer not to say' },
    ],
  },
  {
    key: 'notes',
    type: 'text',
    prompt: "Anything else you'd like to add, in your own words? (Optional)",
  },
];

function OptionCards({ step, selected, onSelect, onToggle, onContinue }) {
  const isMulti = step.type === 'multi';
  return (
    <div className="analyser-options">
      <div className="analyser-option-grid">
        {step.options.map((opt) => {
          const active = isMulti ? selected.includes(opt.value) : false;
          return (
            <button
              key={opt.value}
              className={`analyser-option-btn${active ? ' active' : ''}`}
              onClick={() => (isMulti ? onToggle(opt.value) : onSelect(opt.value))}
            >
              {opt.emoji && <span className="analyser-option-emoji">{opt.emoji}</span>}
              {opt.label}
            </button>
          );
        })}
        {isMulti && step.allowNone && (
          <button
            className={`analyser-option-btn${selected.length === 0 ? '' : ''}`}
            onClick={() => onContinue([])}
          >
            None of these
          </button>
        )}
      </div>
      {isMulti && (
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 10 }}
          disabled={selected.length === 0 && !step.allowNone}
          onClick={() => onContinue(selected)}
        >
          Continue <i className="ti ti-arrow-right" />
        </button>
      )}
    </div>
  );
}

function ResultCard({ result, therapists }) {
  const tierColor = {
    minimal: 'var(--teal)',
    mild: 'var(--teal-mid)',
    moderate: 'var(--amber, #B5860B)',
    significant: 'var(--coral)',
    elevated: 'var(--coral)',
  }[result.severityTier] || 'var(--teal)';

  return (
    <div className="analyser-result card">
      {result.crisis && (
        <div className="analyser-crisis-box">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            <i className="ti ti-alert-triangle" /> {result.crisis.headline}
          </div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>{result.crisis.body}</div>
          <div style={{ fontSize: 13 }}>{result.crisis.action}</div>
        </div>
      )}

      <div className="card-body">
        <div className="analyser-headline-row">
          <span className="analyser-headline-emoji">{result.severityEmoji || '✨'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{result.severityHeadline || 'Here\'s your check-in'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span className="analyser-severity-dot" style={{ background: tierColor }} />
              <span style={{ fontSize: 11.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text-secondary)' }}>
                {result.severityTier} range
              </span>
            </div>
          </div>
        </div>
        <p style={{ margin: '12px 0 14px' }}>{result.summary}</p>

        {result.categories.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {result.categories.slice(0, 5).map((c) => (
              <div key={c.key} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span>{c.emoji} {c.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.level}</span>
                </div>
                <div className="analyser-bar-track">
                  <div
                    className="analyser-bar-fill"
                    style={{ width: `${Math.min(100, (c.score / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
          <i className="ti ti-bulb" /> Things worth trying
        </div>
        <ul style={{ paddingLeft: 18, marginBottom: 16, fontSize: 13.5, lineHeight: 1.7 }}>
          {result.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>

        {therapists.length > 0 && (
          <>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              <i className="ti ti-stethoscope" /> People who get it
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {therapists.map((t) => (
                <Link
                  key={t._id}
                  to={`/therapists/${t._id}`}
                  className="analyser-therapist-row"
                >
                  <div
                    className="therapist-avatar-sm"
                    style={{ background: t.avatarColor, color: t.avatarTextColor }}
                  >
                    {t.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{t.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--amber, #B5860B)' }}>
                    <i className="ti ti-star-filled" /> {t.rating}
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/therapists" className="btn btn-primary btn-sm btn-full">
              <i className="ti ti-calendar-plus" /> Book a real session
            </Link>
            <p className="analyser-nudge">{result.disclaimer}</p>
          </>
        )}
        {therapists.length === 0 && (
          <p className="analyser-nudge">{result.disclaimer}</p>
        )}
      </div>
    </div>
  );
}

export default function AIAnalyserPage() {
  const { showToast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([
    { id: 'q0', role: 'assistant', kind: 'text', content: STEPS[0].prompt, time: format(new Date(), 'h:mm a') },
  ]);
  const [multiSelected, setMultiSelected] = useState([]);
  const [textValue, setTextValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, submitting]);

  const currentStep = STEPS[stepIndex];

  function pushUserBubble(text) {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', kind: 'text', content: text, time: format(new Date(), 'h:mm a') }]);
  }

  function pushBotBubble(text) {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: 'assistant', kind: 'text', content: text, time: format(new Date(), 'h:mm a') }]);
  }

  function advance(nextAnswers) {
    const nextIndex = stepIndex + 1;
    setMultiSelected([]);
    setTextValue('');
    if (nextIndex < STEPS.length) {
      setStepIndex(nextIndex);
      pushBotBubble(STEPS[nextIndex].prompt);
    } else {
      submit(nextAnswers);
    }
  }

  function handleSingleSelect(value) {
    const opt = currentStep.options.find((o) => o.value === value);
    pushUserBubble(opt.label);
    const nextAnswers = { ...answers, [currentStep.key]: value };
    setAnswers(nextAnswers);

    if (currentStep.key === 'risk' && (value === 'occasionally' || value === 'frequently')) {
      pushBotBubble("Thank you for being honest about that — it takes courage. Agar aap kisi bhi dikkt ka samna kr rhje h to call kre 112 yahan sabhi rogo ka ilaaj kiya jata h. ");
    }

    advance(nextAnswers);
  }

  function handleMultiToggle(value) {
    setMultiSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function handleMultiContinue(selected) {
    const labels = selected.length
      ? selected.map((v) => currentStep.options.find((o) => o.value === v)?.label).join(', ')
      : 'None of these';
    pushUserBubble(labels);
    const nextAnswers = { ...answers, [currentStep.key]: selected };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  }

  function handleTextSubmit() {
    if (textValue.trim()) pushUserBubble(textValue.trim());
    else pushUserBubble('(skipped)');
    const nextAnswers = { ...answers, notes: textValue.trim() };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  }

  async function submit(finalAnswers) {
    setSubmitting(true);
    try {
      const res = await analyserAPI.analyse(finalAnswers);
      setMessages((prev) => [
        ...prev,
        {
          id: 'result',
          role: 'assistant',
          kind: 'result',
          result: res.data.result,
          therapists: res.data.therapists,
        },
      ]);
      setDone(true);
    } catch (err) {
      pushBotBubble("I'm having trouble putting your results together right now. Please try again in a moment.");
      showToast('Analyser error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStepIndex(0);
    setAnswers({});
    setMultiSelected([]);
    setTextValue('');
    setDone(false);
    setMessages([{ id: 'q0', role: 'assistant', kind: 'text', content: STEPS[0].prompt, time: format(new Date(), 'h:mm a') }]);
  }

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      <div className="container" style={{ maxWidth: 720, height: 'calc(100vh - var(--nav-height) - 2rem)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>AI Analyser</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🧭 Know yourself better</span>
        </div>

        <div className="card flex-col" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}${msg.kind === 'result' ? ' analyser-result-msg' : ''}`}>
                {msg.kind === 'result' ? (
                  <ResultCard result={msg.result} therapists={msg.therapists} />
                ) : (
                  <>
                    <div className={`bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                      {msg.content}
                    </div>
                    {msg.time && <div className="msg-time">{msg.time}</div>}
                  </>
                )}
              </div>
            ))}

            {submitting && (
              <div className="chat-msg assistant">
                <div className="bubble bubble-assistant">
                  <div className="typing-dots">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {!done && !submitting && currentStep && (
            <div className="chat-input-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              {currentStep.type === 'text' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <textarea
                    className="chat-textarea"
                    placeholder="Type here, or leave blank and continue…"
                    rows={1}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
                  />
                  <button className="send-btn" onClick={handleTextSubmit}>
                    <i className="ti ti-send" />
                  </button>
                </div>
              ) : (
                <OptionCards
                  step={currentStep}
                  selected={multiSelected}
                  onSelect={handleSingleSelect}
                  onToggle={handleMultiToggle}
                  onContinue={handleMultiContinue}
                />
              )}
            </div>
          )}

          {done && (
            <div className="chat-input-row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-sm" onClick={restart}>
                <i className="ti ti-refresh" /> Start a new check-in
              </button>
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: '10px 0' }}>
           AI  hai  AI
        </p>
      </div>
    </div>
  );
}
