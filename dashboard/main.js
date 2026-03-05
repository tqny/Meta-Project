import {
  STAGES,
  deriveRunNarrative,
  enrichCases,
  fmt,
  groupCount,
  loadPayload,
  pct,
  prettyNumber,
  toNumber,
  transitionCaseStage,
} from './shared-data.js';

const els = {
  runMeta: document.querySelector('#run-meta'),
  autopilot: document.querySelector('#run-autopilot'),
  resetState: document.querySelector('#reset-state'),
  kpiDomains: document.querySelector('#kpi-domains'),
  kpiDomainsFoot: document.querySelector('#kpi-domains-foot'),
  kpiCases: document.querySelector('#kpi-cases'),
  kpiCasesFoot: document.querySelector('#kpi-cases-foot'),
  kpiHot: document.querySelector('#kpi-hot'),
  kpiHotFoot: document.querySelector('#kpi-hot-foot'),
  kpiCampaigns: document.querySelector('#kpi-campaigns'),
  kpiCampaignsFoot: document.querySelector('#kpi-campaigns-foot'),
  kpiQuality: document.querySelector('#kpi-quality'),
  kpiQualityFoot: document.querySelector('#kpi-quality-foot'),
  terminalCode: document.querySelector('#ops-terminal-code'),
  terminalOutput: document.querySelector('#ops-terminal-output'),
  terminalTabs: Array.from(document.querySelectorAll('[data-ops-tab]')),
  riskDonut: document.querySelector('#risk-donut'),
  riskDonutTotal: document.querySelector('#risk-donut-total'),
  riskLegend: document.querySelector('#risk-legend'),
  brandPills: document.querySelector('#brand-pills'),
  stageFunnel: document.querySelector('#stage-funnel'),
  threatCurve: document.querySelector('#threat-curve'),
  curveMedian: document.querySelector('#curve-median'),
  curveThreshold: document.querySelector('#curve-threshold'),
  vendorGrid: document.querySelector('#vendor-grid'),
  stageTabs: Array.from(document.querySelectorAll('[data-stage-filter]')),
  queueSearch: document.querySelector('#queue-search'),
  queueCount: document.querySelector('#queue-count'),
  queueRows: document.querySelector('#queue-rows'),
  selectedCase: document.querySelector('#selected-case'),
  caseSummary: document.querySelector('#case-summary'),
  caseActions: document.querySelector('#case-actions'),
  caseActivity: document.querySelector('#case-activity'),
  caseNote: document.querySelector('#case-note'),
  saveNote: document.querySelector('#save-note'),
  clearNote: document.querySelector('#clear-note'),
};

const state = {
  payload: null,
  cases: [],
  selectedCaseId: null,
  stageFilter: 'all',
  searchTerm: '',
  terminalTab: 'pipeline',
};

function localKey(runId) {
  return `speculo-v2-ops:${runId}`;
}

function addActivity(caseRow, note, actor = 'analyst:speculo') {
  caseRow.activity = Array.isArray(caseRow.activity) ? caseRow.activity : [];
  caseRow.activity.unshift({
    kind: 'note',
    timestamp: new Date().toISOString(),
    actor,
    note,
    from: caseRow.stage,
    to: caseRow.stage,
  });
}

function severityClass(score) {
  if (score >= 80) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

function saveState() {
  if (!state.payload) return;
  const key = localKey(state.payload.run.run_id);
  localStorage.setItem(
    key,
    JSON.stringify({
      cases: state.cases,
      selectedCaseId: state.selectedCaseId,
    })
  );
}

function loadLocalState(payload) {
  const key = localKey(payload.run.run_id);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.cases)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function selectedCase() {
  return state.cases.find((row) => row.case_id === state.selectedCaseId) || null;
}

function visibleCases() {
  const search = state.searchTerm.trim().toLowerCase();
  return state.cases.filter((row) => {
    if (state.stageFilter !== 'all' && row.stage !== state.stageFilter) return false;
    if (!search) return true;
    const hay = `${row.case_id} ${row.domain} ${row.vendor} ${row.recommended_action} ${row.registrar}`.toLowerCase();
    return hay.includes(search);
  });
}

function renderTerminal() {
  const rows = visibleCases();
  const narrative = deriveRunNarrative(state.payload, state.cases);
  const actionLeaders = Array.from(narrative.actionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([action, count]) => `${action}:${count}`)
    .join(', ');

  const content = {
    pipeline: {
      code: `run_id: ${narrative.runId}\n` +
        `domains_in_scope: ${narrative.domains}\n` +
        `active_cases: ${narrative.cases}\n` +
        `high_risk_cases: ${narrative.highRisk}\n` +
        `stage_detect: ${narrative.stageCounts.get(STAGES.DETECT) || 0}\n` +
        `stage_validate: ${narrative.stageCounts.get(STAGES.VALIDATE) || 0}\n` +
        `stage_enforce: ${narrative.stageCounts.get(STAGES.ENFORCE) || 0}\n` +
        `stage_monitor: ${narrative.stageCounts.get(STAGES.MONITOR) || 0}\n` +
        `stage_closed: ${narrative.stageCounts.get(STAGES.CLOSED) || 0}`,
      out: `Visible queue: ${rows.length} case(s) matching current filter.`,
    },
    sla: {
      code: `avg_time_to_action_hours: ${state.payload.executive_summary.average_time_to_action_hours}\n` +
        `current_threshold: ${state.payload.run.threshold}\n` +
        `quality_proxy: ${fmt(state.payload.overview.quality_proxy, 3)}\n` +
        `threshold_gap: ${state.payload.overview.threshold_gap}\n` +
        `recommended_threshold: ${state.payload.threshold_tuning.recommended_threshold}`,
      out: 'SLA posture combines speed, queue pressure, and threshold discipline.',
    },
    response: {
      code: `top_actions: ${actionLeaders || 'Unavailable'}\n` +
        `filter_stage: ${state.stageFilter}\n` +
        `autopilot_rule: score>=80 => enforce\n` +
        `autopilot_rule: enforce<70 => monitor\n` +
        `autopilot_rule: monitor<60 => closed`,
      out: 'Response plan is stage-aware and capacity-conscious.',
    },
  };

  const current = content[state.terminalTab] || content.pipeline;
  els.terminalTabs.forEach((tab) => {
    const on = tab.dataset.opsTab === state.terminalTab;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-selected', String(on));
  });
  els.terminalCode.textContent = current.code;
  els.terminalOutput.textContent = current.out;
}

function renderKpis() {
  const rows = state.cases;
  const highRisk = rows.filter((row) => toNumber(row.threat_score) >= 80).length;
  const enforceQueue = rows.filter((row) => row.stage === STAGES.ENFORCE).length;

  els.kpiDomains.textContent = prettyNumber(state.payload.overview.domains_analyzed);
  els.kpiCases.textContent = prettyNumber(rows.length);
  els.kpiHot.textContent = prettyNumber(highRisk);
  els.kpiCampaigns.textContent = prettyNumber(state.payload.campaigns.length);
  els.kpiQuality.textContent = pct(state.payload.overview.quality_proxy);

  els.kpiDomainsFoot.textContent = `Seed ${state.payload.run.seed} · sample ${state.payload.run.sample_size}`;
  els.kpiCasesFoot.textContent = `${pct(rows.length / Math.max(1, state.payload.overview.domains_analyzed))} of monitored domains`;
  els.kpiHotFoot.textContent = `${pct(highRisk / Math.max(1, rows.length))} of active workflow`;
  els.kpiCampaignsFoot.textContent = `${enforceQueue} case(s) currently in Enforce stage`;
  els.kpiQualityFoot.textContent = `Threshold gap ${state.payload.overview.threshold_gap > 0 ? '+' : ''}${state.payload.overview.threshold_gap}`;
}

function renderCharts() {
  renderRiskComposition();
  renderBrandPressure();
  renderWorkflowFunnel();
  renderThreatCurve();
  renderVendorUtilization();
}

function renderRiskComposition() {
  const rows = state.cases;
  const total = rows.length;
  const buckets = [
    { label: 'High (80+)', count: rows.filter((row) => toNumber(row.threat_score) >= 80).length, color: 'var(--dh-color-danger)' },
    {
      label: 'Medium (65-79)',
      count: rows.filter((row) => {
        const score = toNumber(row.threat_score);
        return score >= 65 && score < 80;
      }).length,
      color: 'var(--dh-color-warning)',
    },
    { label: 'Low (<65)', count: rows.filter((row) => toNumber(row.threat_score) < 65).length, color: 'var(--dh-color-success)' },
  ];

  let angle = 0;
  const segments = buckets.map((bucket) => {
    const share = total ? bucket.count / total : 0;
    const start = angle;
    angle += share * 360;
    return `${bucket.color} ${start}deg ${angle}deg`;
  });
  els.riskDonut.style.background = `conic-gradient(${segments.join(', ')})`;
  els.riskDonutTotal.textContent = String(total);

  els.riskLegend.innerHTML = '';
  for (const bucket of buckets) {
    const item = document.createElement('p');
    item.className = 'spec-legend-item';
    item.innerHTML = `
      <span class="swatch" style="background:${bucket.color}"></span>
      <span>${bucket.label}</span>
      <strong>${bucket.count}</strong>
      <em>${total ? pct(bucket.count / total) : '0.0%'}</em>
    `;
    els.riskLegend.appendChild(item);
  }
}

function renderBrandPressure() {
  const brandCounts = Array.from(groupCount(state.cases, (row) => row.target_brand || 'Unknown').entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const max = Math.max(1, ...brandCounts.map((row) => row.value));

  els.brandPills.innerHTML = '';
  for (const row of brandCounts) {
    const item = document.createElement('article');
    item.className = 'spec-pill-item';
    item.innerHTML = `
      <div class="spec-pill-head">
        <span>${row.label}</span>
        <strong>${row.value}</strong>
      </div>
      <div class="spec-pill-track"><span style="width:${(row.value / max) * 100}%"></span></div>
    `;
    els.brandPills.appendChild(item);
  }
}

function renderWorkflowFunnel() {
  const stageOrder = [STAGES.DETECT, STAGES.VALIDATE, STAGES.ENFORCE, STAGES.MONITOR, STAGES.CLOSED];
  const counts = groupCount(state.cases, (row) => row.stage);
  const max = Math.max(1, ...stageOrder.map((stage) => counts.get(stage) || 0));

  els.stageFunnel.innerHTML = '';
  let prevCount = null;
  for (const stage of stageOrder) {
    const count = counts.get(stage) || 0;
    const width = 35 + (count / max) * 65;
    const conversion = prevCount === null ? 'entry stage' : `${pct(prevCount ? count / prevCount : 0)} from prior`;
    const row = document.createElement('article');
    row.className = 'spec-funnel-row';
    row.innerHTML = `
      <div class="spec-funnel-shape" style="--funnel-width:${width}%">
        <span>${stage}</span>
        <strong>${count}</strong>
      </div>
      <p>${conversion}</p>
    `;
    els.stageFunnel.appendChild(row);
    prevCount = count;
  }
}

function renderThreatCurve() {
  const scores = state.cases.map((row) => toNumber(row.threat_score)).sort((a, b) => b - a);
  const width = 460;
  const height = 180;
  const padX = 16;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  if (!scores.length) {
    els.threatCurve.innerHTML = '';
    els.curveMedian.textContent = 'Median threat: -';
    els.curveThreshold.textContent = 'Threshold line: -';
    return;
  }

  const points = scores.map((score, idx) => {
    const x = padX + (idx / Math.max(1, scores.length - 1)) * innerW;
    const y = padY + ((100 - score) / 100) * innerH;
    return [x, y];
  });
  const pointStr = points.map(([x, y]) => `${x},${y}`).join(' ');
  const areaStr = `${padX},${height - padY} ${pointStr} ${width - padX},${height - padY}`;
  const threshold = Math.round(toNumber(state.payload.run.threshold) * 100);
  const thresholdY = padY + ((100 - threshold) / 100) * innerH;
  const median = scores[Math.floor(scores.length / 2)];

  els.threatCurve.innerHTML = `
    <rect x="${padX}" y="${padY}" width="${innerW}" height="${innerH}" class="spec-line-bg"></rect>
    <line x1="${padX}" y1="${thresholdY}" x2="${width - padX}" y2="${thresholdY}" class="spec-line-threshold"></line>
    <polygon points="${areaStr}" class="spec-line-area"></polygon>
    <polyline points="${pointStr}" class="spec-line-path"></polyline>
  `;
  els.curveMedian.textContent = `Median threat: ${median.toFixed(1)}`;
  els.curveThreshold.textContent = `Threshold line: ${threshold}`;
}

function renderVendorUtilization() {
  els.vendorGrid.innerHTML = '';
  for (const vendor of state.payload.vendors) {
    const util = Math.max(0, Math.min(1, toNumber(vendor.utilization)));
    const item = document.createElement('article');
    item.className = 'spec-vendor-item';
    item.innerHTML = `
      <div class="spec-vendor-head">
        <strong>${vendor.vendor}</strong>
        <span>${vendor.assigned}/${vendor.capacity}</span>
      </div>
      <div class="spec-mini-gauge" style="--vendor-angle:${util * 360}deg">
        <div class="spec-mini-gauge-core">${pct(util)}</div>
      </div>
    `;
    els.vendorGrid.appendChild(item);
  }
}

function renderQueue() {
  const rows = visibleCases().sort((a, b) => toNumber(b.threat_score) - toNumber(a.threat_score));
  els.queueCount.textContent = `${rows.length} visible`;
  els.queueRows.innerHTML = '';

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6">No cases match current filters.</td>';
    els.queueRows.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    if (row.case_id === state.selectedCaseId) tr.classList.add('active');
    tr.innerHTML = `
      <td>${row.case_id}</td>
      <td>${row.domain}</td>
      <td>${row.stage}</td>
      <td><span class="spec-threat ${severityClass(toNumber(row.threat_score))}">${row.threat_score}</span></td>
      <td>${row.recommended_action}</td>
      <td>${row.vendor}</td>
    `;
    tr.addEventListener('click', () => {
      state.selectedCaseId = row.case_id;
      renderQueue();
      renderCaseConsole();
      saveState();
    });
    els.queueRows.appendChild(tr);
  }
}

function renderCaseConsole() {
  const row = selectedCase();
  if (!row) {
    els.selectedCase.textContent = 'No case selected';
    els.caseSummary.className = 'spec-console-empty';
    els.caseSummary.textContent = 'Select a case to inspect rationale and execute stage transitions.';
    els.caseActions.innerHTML = '';
    els.caseActivity.innerHTML = '<li>No activity to display.</li>';
    return;
  }

  els.selectedCase.textContent = `${row.case_id} · ${row.domain}`;
  els.caseSummary.className = 'spec-console-summary';
  els.caseSummary.innerHTML = `
    <div class="spec-summary-grid">
      <p><strong>Stage</strong><span>${row.stage}</span></p>
      <p><strong>Threat Score</strong><span>${row.threat_score}</span></p>
      <p><strong>Threat Type</strong><span>${row.predicted_threat_type}</span></p>
      <p><strong>Target Brand</strong><span>${row.target_brand}</span></p>
      <p><strong>Campaign</strong><span>${row.campaign_id || 'None'}</span></p>
      <p><strong>Confidence</strong><span>${row.confidence}</span></p>
    </div>
    <ul class="spec-rationale-list">${(row.explanation || []).map((item) => `<li>${item}</li>`).join('')}</ul>
  `;

  els.caseActions.innerHTML = '';
  for (const next of row.allowed_stage_transitions || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spec-secondary-btn';
    button.textContent = `Move to ${next}`;
    button.addEventListener('click', () => {
      transitionCaseStage(row, next);
      renderAll();
      saveState();
    });
    els.caseActions.appendChild(button);
  }

  const feed = Array.isArray(row.activity) ? row.activity : [];
  els.caseActivity.innerHTML = '';
  if (!feed.length) {
    els.caseActivity.innerHTML = '<li>No activity to display.</li>';
    return;
  }

  for (const entry of feed.slice(0, 10)) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.from} -> ${entry.to}</strong> · ${entry.actor} · ${entry.timestamp}<br>${entry.note || 'No note'}`;
    els.caseActivity.appendChild(li);
  }
}

function runAutopilot() {
  let updates = 0;
  for (const row of state.cases) {
    const score = toNumber(row.threat_score);
    if ((row.stage === STAGES.DETECT || row.stage === STAGES.VALIDATE) && score >= 80) {
      transitionCaseStage(row, STAGES.ENFORCE, 'system:autopilot');
      addActivity(row, 'Autopilot escalated case based on score>=80', 'system:autopilot');
      updates += 1;
      continue;
    }
    if (row.stage === STAGES.ENFORCE && score < 70) {
      transitionCaseStage(row, STAGES.MONITOR, 'system:autopilot');
      addActivity(row, 'Autopilot moved case to monitoring due to lower threat score', 'system:autopilot');
      updates += 1;
      continue;
    }
    if (row.stage === STAGES.MONITOR && score < 60) {
      transitionCaseStage(row, STAGES.CLOSED, 'system:autopilot');
      addActivity(row, 'Autopilot closed low-risk monitoring case', 'system:autopilot');
      updates += 1;
    }
  }

  if (updates === 0) {
    const row = selectedCase();
    if (row) addActivity(row, 'Autopilot run completed with no stage changes.', 'system:autopilot');
  }

  renderAll();
  saveState();
}

function bindEvents() {
  els.terminalTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.terminalTab = tab.dataset.opsTab;
      renderTerminal();
    });
  });

  els.stageTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.stageFilter = tab.dataset.stageFilter;
      els.stageTabs.forEach((item) => item.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderQueue();
      renderTerminal();
    });
  });

  els.queueSearch.addEventListener('input', () => {
    state.searchTerm = els.queueSearch.value;
    renderQueue();
    renderTerminal();
  });

  els.saveNote.addEventListener('click', () => {
    const row = selectedCase();
    if (!row) return;
    const note = els.caseNote.value.trim();
    if (!note) return;
    addActivity(row, note);
    els.caseNote.value = '';
    renderCaseConsole();
    saveState();
  });

  els.clearNote.addEventListener('click', () => {
    els.caseNote.value = '';
  });

  els.autopilot.addEventListener('click', runAutopilot);

  els.resetState.addEventListener('click', () => {
    if (!state.payload) return;
    localStorage.removeItem(localKey(state.payload.run.run_id));
    state.cases = enrichCases(state.payload.queue);
    state.selectedCaseId = state.cases[0]?.case_id || null;
    state.stageFilter = 'all';
    state.searchTerm = '';
    els.queueSearch.value = '';
    els.stageTabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.stageFilter === 'all'));
    renderAll();
  });
}

function renderAll() {
  renderTerminal();
  renderKpis();
  renderCharts();
  renderQueue();
  renderCaseConsole();
}

async function main() {
  try {
    state.payload = await loadPayload();
    const local = loadLocalState(state.payload);
    state.cases = local?.cases || enrichCases(state.payload.queue);
    state.selectedCaseId = local?.selectedCaseId || state.cases[0]?.case_id || null;

    const narrative = deriveRunNarrative(state.payload, state.cases);
    els.runMeta.textContent = `Run ${narrative.runId} · generated ${narrative.generatedAt} · threshold ${state.payload.run.threshold}`;

    bindEvents();
    renderAll();
  } catch (error) {
    els.runMeta.textContent = String(error);
  }
}

main();
