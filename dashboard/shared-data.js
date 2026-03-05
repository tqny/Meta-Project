const DATA_PATH = './data/product-v1.json';

const STAGES = {
  DETECT: 'Detect',
  VALIDATE: 'Validate',
  ENFORCE: 'Enforce',
  MONITOR: 'Monitor',
  CLOSED: 'Closed',
};

const STAGE_TRANSITIONS = {
  [STAGES.DETECT]: [STAGES.VALIDATE, STAGES.MONITOR],
  [STAGES.VALIDATE]: [STAGES.ENFORCE, STAGES.MONITOR],
  [STAGES.ENFORCE]: [STAGES.MONITOR, STAGES.CLOSED],
  [STAGES.MONITOR]: [STAGES.ENFORCE, STAGES.CLOSED],
  [STAGES.CLOSED]: [],
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pct(value) {
  return `${(toNumber(value) * 100).toFixed(1)}%`;
}

function fmt(value, digits = 2) {
  return toNumber(value).toFixed(digits);
}

function prettyNumber(value) {
  return new Intl.NumberFormat().format(toNumber(value));
}

async function loadPayload() {
  const response = await fetch(DATA_PATH, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load dashboard data (${response.status})`);
  }
  return response.json();
}

async function loadThresholdArtifact(payload) {
  const path = payload?.threshold_tuning?.artifact_path;
  if (!path || typeof path !== 'string') return null;
  const relative = path.startsWith('http') ? path : `../${path}`;
  try {
    const response = await fetch(relative, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function initialStageFromCase(caseRow) {
  const status = String(caseRow.status || '').toLowerCase();
  const score = toNumber(caseRow.threat_score);

  if (status === 'closed') return STAGES.CLOSED;
  if (status === 'resolved') return STAGES.MONITOR;
  if (status === 'escalated' || status === 'enforcement initiated') return STAGES.ENFORCE;

  if (score >= 90) return STAGES.DETECT;
  if (score >= 65) return STAGES.VALIDATE;
  return STAGES.MONITOR;
}

function enrichCases(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const stage = initialStageFromCase(row);
    const auditLog = Array.isArray(row.audit_log) ? row.audit_log : [];
    return {
      ...row,
      stage,
      allowed_stage_transitions: STAGE_TRANSITIONS[stage],
      activity: auditLog.map((entry) => ({
        kind: 'audit',
        timestamp: entry.timestamp,
        actor: entry.actor,
        note: entry.note,
        from: entry.from_status,
        to: entry.to_status,
      })),
    };
  });
}

function transitionCaseStage(caseRow, nextStage, actor = 'analyst:speculo') {
  if (!caseRow) return;
  const allowed = STAGE_TRANSITIONS[caseRow.stage] || [];
  if (!allowed.includes(nextStage)) return;

  const now = new Date().toISOString();
  caseRow.activity = Array.isArray(caseRow.activity) ? caseRow.activity : [];
  caseRow.activity.unshift({
    kind: 'stage',
    timestamp: now,
    actor,
    note: `Workflow moved from ${caseRow.stage} to ${nextStage}`,
    from: caseRow.stage,
    to: nextStage,
  });
  caseRow.stage = nextStage;
  caseRow.allowed_stage_transitions = STAGE_TRANSITIONS[nextStage] || [];
}

function groupCount(rows, getter) {
  const bucket = new Map();
  for (const row of rows) {
    const key = getter(row);
    bucket.set(key, (bucket.get(key) || 0) + 1);
  }
  return bucket;
}

function scoreBins(rows) {
  const bins = [
    { label: '90-100', min: 90, max: 100 },
    { label: '80-89', min: 80, max: 89 },
    { label: '70-79', min: 70, max: 79 },
    { label: '60-69', min: 60, max: 69 },
    { label: '50-59', min: 50, max: 59 },
    { label: '<50', min: 0, max: 49 },
  ];

  return bins.map((bin) => {
    const count = rows.filter((row) => {
      const score = toNumber(row.threat_score);
      return score >= bin.min && score <= bin.max;
    }).length;
    return { ...bin, count };
  });
}

function deriveRunNarrative(payload, rows) {
  const stageCounts = groupCount(rows, (row) => row.stage);
  const actionCounts = groupCount(rows, (row) => row.recommended_action || 'Monitor');
  const hot = rows.filter((row) => toNumber(row.threat_score) >= 80).length;

  return {
    runId: payload.run?.run_id || 'Unavailable',
    generatedAt: payload.run?.generated_at || payload.generated_at || 'Unavailable',
    threshold: payload.run?.threshold,
    domains: toNumber(payload.overview?.domains_analyzed),
    cases: rows.length,
    highRisk: hot,
    stageCounts,
    actionCounts,
  };
}

export {
  DATA_PATH,
  STAGES,
  STAGE_TRANSITIONS,
  fmt,
  pct,
  prettyNumber,
  loadPayload,
  loadThresholdArtifact,
  enrichCases,
  transitionCaseStage,
  groupCount,
  scoreBins,
  deriveRunNarrative,
  toNumber,
};
