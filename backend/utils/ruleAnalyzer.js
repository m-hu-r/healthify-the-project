
const SYMPTOM_WEIGHTS = {
  racing_thoughts:      { anxiety: 3 },
  on_edge:               { anxiety: 2, stress: 1 },
  panic_feelings:         { anxiety: 3 },
  persistent_sadness:      { depression: 3 },
  loss_of_interest:         { depression: 3 },
  low_energy:                 { depression: 2, sleep: 1 },
  concentration:                { depression: 1, anxiety: 1, stress: 1 },
  sleep_trouble:                  { sleep: 3 },
  oversleeping:                     { sleep: 2, depression: 1 },
  irritability:                       { stress: 2, relationships: 1 },
  overwhelmed:                          { stress: 3 },
  flashbacks:                             { trauma: 3 },
  avoidance:                                { trauma: 2 },
  numbness:                                   { trauma: 2, depression: 1 },
  relationship_conflict:                        { relationships: 3 },
  loneliness:                                     { relationships: 2, depression: 1 },
  grieving:                                         { grief: 3 },
  self_criticism:                                     { selfEsteem: 3 },
  appetite_changes:                                     { depression: 1, stress: 1 },
};

const DURATION_MULTIPLIER = {
  couple_days: 0.6,
  about_a_week: 0.8,
  few_weeks: 1.0,
  month_plus: 1.3,
};

const LEVEL_BUMPS = {
  sleep: { good: 0, okay: 1, poor: 3 },
  energy: { good: 0, okay: 1, poor: 2 },
  stressLevel: { low: 0, manageable: 1, high: 3 },
};

const CATEGORY_META = {
  anxiety: {
    label: 'Anxiety',
    emoji: '🌀',
    vibe: "your mind's been running laps lately",
    specialties: ['Anxiety', 'CBT', 'Mindfulness'],
    tips: [
      'Try the 5-4-3-2-1 grounding technique when worry spikes (5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste).',
      'Practice slow, diaphragmatic breathing for 5 minutes, twice a day.',
      "Write worries down and set aside a specific 'worry time' to revisit them, rather than all day.",
      'Cut back on caffeine, especially after midday — it can amplify a racing feeling.',
    ],
  },
  depression: {
    label: 'Low mood',
    emoji: '🌧️',
    vibe: 'the heaviness lately has been real',
    specialties: ['Depression', 'CBT'],
    tips: [
      'Aim for one small, achievable task a day rather than a long to-do list.',
      'Try to get natural light and a short walk outside daily, even briefly.',
      'Keep a simple mood journal to notice patterns and small wins.',
      'Reach out to one supportive person this week, even just a short message.',
    ],
  },
  stress: {
    label: 'Stress / burnout',
    emoji: '🔥',
    vibe: "you've been pouring from a pretty empty cup",
    specialties: ['Stress Management', 'Life Transitions', 'Mindfulness'],
    tips: [
      'Break large tasks into smaller steps and tackle one at a time.',
      'Build in short breaks during the day — even 5 minutes helps reset focus.',
      'Try progressive muscle relaxation before bed to unwind.',
      "Say 'no' to one non-essential commitment this week.",
    ],
  },
  sleep: {
    label: 'Sleep difficulty',
    emoji: '🌙',
    vibe: 'rest has been hard to come by',
    specialties: ['Stress Management', 'CBT'],
    tips: [
      'Keep a consistent sleep and wake time, even on weekends.',
      'Avoid screens for 30–60 minutes before bed.',
      'Keep your bedroom cool, dark, and reserved mainly for sleep.',
      'Avoid caffeine and heavy meals in the evening.',
    ],
  },
  trauma: {
    label: 'Trauma-related stress',
    emoji: '🕯️',
    vibe: 'some old weight seems to be resurfacing',
    specialties: ['Trauma', 'PTSD'],
    tips: [
      'Ground yourself with slow breathing when memories or reminders surface.',
      'Keep a daily routine that feels safe and predictable.',
      "Processing distressing memories is usually easier — and safer — with a trauma-informed therapist guiding the pace.",
      "Be patient with yourself; healing from difficult experiences isn't linear.",
    ],
  },
  relationships: {
    label: 'Relationship strain',
    emoji: '💬',
    vibe: 'connection with others has felt strained',
    specialties: ['Relationships', 'Couples Counseling', 'Family Therapy'],
    tips: [
      "Try 'I feel…' statements instead of blame when discussing conflict.",
      'Set aside dedicated, distraction-free time to reconnect.',
      'Notice conflict patterns that repeat — they\'re useful to bring into therapy.',
      'Practice reflecting back what you heard before responding.',
    ],
  },
  grief: {
    label: 'Grief / loss',
    emoji: '🍂',
    vibe: 'loss has been sitting heavy with you',
    specialties: ['Grief'],
    tips: [
      'Give yourself permission to grieve at your own pace — there\'s no fixed timeline.',
      'Consider marking meaningful dates in a way that feels right for you.',
      'Talk about your loss with someone who can listen without trying to fix it.',
      'Gentle physical activity can help with processing difficult emotions.',
    ],
  },
  selfEsteem: {
    label: 'Self-esteem',
    emoji: '🌱',
    vibe: "you've been your own harshest critic",
    specialties: ['Self-esteem', 'Identity & Self-discovery'],
    tips: [
      'Keep a running list of things you did well, however small.',
      'Challenge one self-critical thought a day — would you say it to a friend?',
      'Set one small, achievable goal to build a sense of accomplishment.',
      "Practice a self-compassion break: name the struggle, remind yourself you're not alone in it.",
    ],
  },
};

const SEVERITY_META = {
  minimal:     { emoji: '🌤️', headline: 'Looking steady' },
  mild:        { emoji: '🙂', headline: 'A few things worth noticing' },
  moderate:    { emoji: '💛', headline: 'Worth paying closer attention to' },
  significant: { emoji: '🧡', headline: 'This deserves real support' },
  elevated:    { emoji: '❤️', headline: "Let's get you support right now" },
};

const GENERAL_TIPS = [
  'Keep up regular sleep, movement, and social connection — the basics matter most.',
  'Try a daily 5-minute check-in with yourself: how am I actually doing today?',
  'Keep a short gratitude note — even one line a day.',
  "You're in a fairly steady place right now — keep doing what's working for you.",
];

const MOOD_ECHO = {
  great: "Love to hear you've been feeling great! 🎉",
  okay: "Sounds like you've been holding steady.",
  low: 'Sorry to hear things have felt low lately.',
  anxious: 'That anxious feeling is exhausting to carry around.',
  frustrated: 'Frustration like that can really wear you down.',
  exhausted: "Running on empty is rough — let's take a proper look.",
};

const CRISIS_MESSAGE = {
  headline: "You matter, and  aap tak suraksha bal pohonch rahi h.",
  body: "If you're in immediate danger, please call your local emergency number. Agr aap kisi bhi samasya ka samna kr rhe h to turant call kree 112 yahan sabhi rogon ka ilaj kiya jata h .",
  action: 'Please consider talking to someone you trust — you don\'t have to go through this alone. kripya kisi se baat karien akele koi kadam na uthayein.',
};

function scoreLevel(score) {
  if (score >= 9) return 'significant';
  if (score >= 6) return 'moderate';
  if (score >= 3) return 'mild';
  return 'minimal';
}

function analyze(answers = {}) {
  const {
    symptoms = [],
    duration = 'few_weeks',
    sleep = 'okay',
    energy = 'okay',
    stressLevel = 'manageable',
    history = [],
    risk = 'no',
  } = answers;

  const multiplier = DURATION_MULTIPLIER[duration] ?? 1.0;

  const totals = {};
  for (const symptomKey of symptoms) {
    const weights = SYMPTOM_WEIGHTS[symptomKey];
    if (!weights) continue;
    for (const [category, weight] of Object.entries(weights)) {
      totals[category] = (totals[category] || 0) + weight;
    }
  }

  for (const category of Object.keys(totals)) {
    totals[category] = totals[category] * multiplier;
  }

  totals.sleep = (totals.sleep || 0) + (LEVEL_BUMPS.sleep[sleep] || 0);
  totals.depression = (totals.depression || 0) + (LEVEL_BUMPS.energy[energy] || 0);
  totals.stress = (totals.stress || 0) + (LEVEL_BUMPS.stressLevel[stressLevel] || 0);

  const categories = Object.entries(totals)
    .map(([key, score]) => ({
      key,
      label: CATEGORY_META[key]?.label || key,
      emoji: CATEGORY_META[key]?.emoji || '✨',
      vibe: CATEGORY_META[key]?.vibe || '',
      score: Math.round(score * 10) / 10,
      level: scoreLevel(score),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = categories.filter((c) => c.score >= 3).slice(0, 3);
  const topScore = categories[0]?.score || 0;

  const riskFlag = risk === 'occasionally' || risk === 'frequently';

  let severityTier;
  if (riskFlag) severityTier = 'elevated';
  else severityTier = scoreLevel(topScore);

  const specialtySet = [];
  for (const cat of primary.length ? primary : categories.slice(0, 1)) {
    const specs = CATEGORY_META[cat.key]?.specialties || [];
    for (const s of specs) {
      if (!specialtySet.includes(s)) specialtySet.push(s);
    }
  }

  if (history.includes('on_medication') || history.includes('prior_diagnosis')) {
    if (!specialtySet.includes('Medication Management')) specialtySet.push('Medication Management');
  }

  let tips = [];
  if (primary.length) {
    for (const cat of primary.slice(0, 2)) {
      tips.push(...(CATEGORY_META[cat.key]?.tips || []));
    }
    tips = [...new Set(tips)].slice(0, 6);
  } else {
    tips = GENERAL_TIPS;
  }

  const moodEcho = MOOD_ECHO[answers.mood] || '';
  const severityInfo = SEVERITY_META[severityTier] || SEVERITY_META.minimal;

  let patternLine;
  if (riskFlag) {
    patternLine = "What you've shared matters, and it deserves real, immediate care.";
  } else if (primary.length === 0) {
    patternLine = "Nothing here points to a big concern — you seem to be in a fairly steady, everyday range. 🌤️";
  } else if (primary.length === 1) {
    const cat = primary[0];
    patternLine = `It looks like ${cat.vibe || cat.label.toLowerCase() + ' has been showing up'} — ${cat.emoji} ${cat.label.toLowerCase()}, at a ${cat.level} level.`;
  } else {
    const vibes = primary.map((c) => c.vibe).filter(Boolean);
    const labels = primary.map((c) => `${c.emoji} ${c.label.toLowerCase()}`);
    const opener = vibes.length ? `It sounds like ${vibes.slice(0, 2).join(', and ')}.` : 'A few things stand out.';
    patternLine = `${opener} The overlapping patterns: ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`;
  }

  const summary = [moodEcho, patternLine].filter(Boolean).join(' ');

  return {
    severityTier, 
    severityEmoji: severityInfo.emoji,
    severityHeadline: severityInfo.headline,
    riskFlag,
    crisis: riskFlag ? CRISIS_MESSAGE : null,
    summary,
    categories,
    primaryIssues: primary,
    recommendedSpecialties: specialtySet.slice(0, 4),
    tips,
    disclaimer: 'Jaldi kahin se sahitya pane ki kosis kre. Hamesha apki seva m tatpar .',
  };
}

module.exports = { analyze, CATEGORY_META, SYMPTOM_WEIGHTS };
