import {
  fmt,
  groupCount,
  loadPayload,
  loadThresholdArtifact,
  prettyNumber,
  toNumber,
} from './shared-data.js';

const els = {
  runMeta: document.querySelector('#campaign-run-meta'),
  terminalCode: document.querySelector('#th-terminal-code'),
  terminalOutput: document.querySelector('#th-terminal-output'),
  terminalTabs: Array.from(document.querySelectorAll('[data-th-tab]')),
  keywordBars: document.querySelector('#keyword-bars'),
  brandFocusBars: document.querySelector('#brand-focus-bars'),
  thresholdBars: document.querySelector('#threshold-bars'),
  campaignSearch: document.querySelector('#campaign-search'),
  campaignMin: document.querySelector('#campaign-min'),
  campaignMinLabel: document.querySelector('#campaign-min-label'),
  campaignCount: document.querySelector('#campaign-count'),
  campaignRows: document.querySelector('#campaign-rows'),
  selectedCampaign: document.querySelector('#selected-campaign'),
  campaignSummary: document.querySelector('#campaign-summary'),
  campaignActions: document.querySelector('#campaign-actions'),
  campaignCases: document.querySelector('#campaign-cases'),
  campaignBrief: document.querySelector('#campaign-brief'),
};

const state = {
  payload: null,
  thresholdArtifact: null,
  campaigns: [],
  selectedCampaignId: null,
  search: '',
  minDomains: 1,
  terminalTab: 'curve',
};

function localKey(runId) {
  return `speculo-v2-campaigns:${runId}`;
}

function saveState() {
  if (!state.payload) return;
  localStorage.setItem(
    localKey(state.payload.run.run_id),
    JSON.stringify({
      campaigns: state.campaigns.map((row) => ({
        campaign_id: row.campaign_id,
        status: row.status,
      })),
      selectedCampaignId: state.selectedCampaignId,
    })
  );
}

function loadLocalState(payload) {
  const raw = localStorage.getItem(localKey(payload.run.run_id));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function attachCampaignMetrics(payload) {
  const casesByCampaign = new Map();
  for (const row of payload.queue) {
    const key = row.campaign_id || 'none';
    if (!casesByCampaign.has(key)) casesByCampaign.set(key, []);
    casesByCampaign.get(key).push(row);
  }

  return payload.campaigns.map((campaign) => {
    const linked = casesByCampaign.get(campaign.campaign_id) || [];
    const avgScore = linked.length
      ? linked.reduce((sum, row) => sum + toNumber(row.threat_score), 0) / linked.length
      : 0;
    const highRisk = linked.filter((row) => toNumber(row.threat_score) >= 80).length;
    const priority = (campaign.domain_count * 2) + (avgScore / 12) + (highRisk * 3);

    return {
      ...campaign,
      linked_cases: linked,
      linked_case_count: linked.length,
      avg_score: avgScore,
      high_risk: highRisk,
      priority,
      status: 'Active',
    };
  });
}

function applyLocalStatuses(local) {
  if (!local || !Array.isArray(local.campaigns)) return;
  const statusById = new Map(local.campaigns.map((row) => [row.campaign_id, row.status]));
  state.campaigns.forEach((row) => {
    if (statusById.has(row.campaign_id)) {
      row.status = statusById.get(row.campaign_id);
    }
  });
  state.selectedCampaignId = local.selectedCampaignId || state.selectedCampaignId;
}

function selectedCampaign() {
  return state.campaigns.find((row) => row.campaign_id === state.selectedCampaignId) || null;
}

function filteredCampaigns() {
  const search = state.search.trim().toLowerCase();
  return state.campaigns
    .filter((row) => row.domain_count >= state.minDomains)
    .filter((row) => {
      if (!search) return true;
      const hay = `${row.campaign_id} ${row.primary_keyword || ''} ${row.primary_brand || ''} ${row.recommendation || ''}`.toLowerCase();
      return hay.includes(search);
    })
    .sort((a, b) => b.priority - a.priority);
}

function renderBarSeries(container, rows, unit) {
  container.innerHTML = '';
  const max = Math.max(1, ...rows.map((row) => row.value));
  for (const row of rows) {
    const item = document.createElement('article');
    item.className = 'spec-bar-item';
    item.innerHTML = `
      <div class="spec-bar-head"><span>${row.label}</span><strong>${row.value}</strong></div>
      <div class="spec-bar-track"><span style="width:${(row.value / max) * 100}%"></span></div>
      <p class="spec-bar-foot">${row.meta || `${row.value} ${unit}`}</p>
    `;
    container.appendChild(item);
  }
}

function thresholdRows() {
  if (state.thresholdArtifact && Array.isArray(state.thresholdArtifact.thresholds)) {
    return state.thresholdArtifact.thresholds;
  }
  const fallback = state.payload.threshold_tuning?.top_candidates || [];
  return fallback.map((row) => ({
    threshold: row.threshold,
    precision: row.precision,
    recall: row.recall,
    f1: row.f1,
    case_volume: row.case_volume,
    vendor_overflow_ratio: row.overflow_ratio,
  }));
}

function renderThresholdSnapshot() {
  const rows = thresholdRows()
    .map((row) => ({
      threshold: toNumber(row.threshold),
      f1: toNumber(row.f1),
      precision: toNumber(row.precision),
      recall: toNumber(row.recall),
    }))
    .filter((row) => Number.isFinite(row.threshold))
    .sort((a, b) => a.threshold - b.threshold);

  const sampled = rows.length > 10
    ? rows.filter((_row, index) => index % Math.ceil(rows.length / 10) === 0)
    : rows;

  const bars = sampled.map((row) => ({
    label: `t=${row.threshold.toFixed(2)}`,
    value: Math.round(row.f1 * 1000),
    meta: `f1=${fmt(row.f1, 3)} · p=${fmt(row.precision, 3)} · r=${fmt(row.recall, 3)}`,
  }));
  renderBarSeries(els.thresholdBars, bars, 'score');
}

function renderCampaignMetaCharts() {
  const keywordCounts = Array.from(groupCount(state.campaigns, (row) => row.primary_keyword || 'other').entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  renderBarSeries(els.keywordBars, keywordCounts, 'campaign(s)');

  const brandCounts = Array.from(groupCount(state.campaigns, (row) => row.primary_brand || 'Unknown').entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  renderBarSeries(els.brandFocusBars, brandCounts, 'campaign(s)');

  renderThresholdSnapshot();
}

function terminalContent() {
  const selected = selectedCampaign();
  const threshold = state.payload.threshold_tuning;
  const rows = thresholdRows().slice(0, 14);
  const recommendation = threshold?.recommended_threshold;

  const curveLines = rows
    .map((row) => `t=${fmt(row.threshold, 2)} | f1=${fmt(row.f1, 3)} | p=${fmt(row.precision, 3)} | r=${fmt(row.recall, 3)}`)
    .join('\n');

  const policy = threshold?.policy || {};
  const policyLines = [
    `recommended_threshold: ${recommendation ?? 'Unavailable'}`,
    `selection_mode: ${threshold?.selection_mode || 'Unavailable'}`,
    `min_precision: ${policy.min_precision ?? 'Unavailable'}`,
    `min_recall: ${policy.min_recall ?? 'Unavailable'}`,
    `max_overflow_ratio: ${policy.max_overflow_ratio ?? 'Unavailable'}`,
  ].join('\n');

  const memoLines = selected
    ? [
        `campaign: ${selected.campaign_id}`,
        `domains: ${selected.domain_count} | linked_cases: ${selected.linked_case_count}`,
        `avg_threat: ${fmt(selected.avg_score, 1)} | high_risk: ${selected.high_risk}`,
        `recommended_action: ${selected.recommendation || 'targeted registrar action'}`,
        `operational_status: ${selected.status}`,
      ].join('\n')
    : 'Select a campaign from the board to generate strategy memo.';

  return {
    curve: {
      code: curveLines || 'Threshold curve unavailable',
      out: `Evaluated runs: ${threshold?.evaluated_runs ?? 'Unavailable'} · total domains: ${threshold?.total_domains ?? 'Unavailable'}`,
    },
    policy: {
      code: policyLines,
      out: 'Policy constraints balance precision, recall, and operational overflow.',
    },
    memo: {
      code: memoLines,
      out: selected ? 'Campaign memo ready for escalation handoff.' : 'Awaiting campaign selection.',
    },
  };
}

function renderTerminal() {
  const content = terminalContent();
  const current = content[state.terminalTab] || content.curve;

  els.terminalTabs.forEach((tab) => {
    const on = tab.dataset.thTab === state.terminalTab;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-selected', String(on));
  });

  els.terminalCode.textContent = current.code;
  els.terminalOutput.textContent = current.out;
}

function renderCampaignTable() {
  const rows = filteredCampaigns();
  els.campaignCount.textContent = `${rows.length} visible`;
  els.campaignRows.innerHTML = '';

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6">No campaigns match current filters.</td>';
    els.campaignRows.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    if (row.campaign_id === state.selectedCampaignId) tr.classList.add('active');
    tr.innerHTML = `
      <td>${row.campaign_id}</td>
      <td>${row.domain_count}</td>
      <td>${row.linked_case_count}</td>
      <td>${fmt(row.avg_score, 1)}</td>
      <td>${fmt(row.priority, 1)}</td>
      <td>${row.status}</td>
    `;
    tr.addEventListener('click', () => {
      state.selectedCampaignId = row.campaign_id;
      renderCampaignTable();
      renderCampaignConsole();
      renderTerminal();
      saveState();
    });
    els.campaignRows.appendChild(tr);
  }
}

function renderCampaignConsole() {
  const row = selectedCampaign();
  if (!row) {
    els.selectedCampaign.textContent = 'No campaign selected';
    els.campaignSummary.className = 'spec-console-empty';
    els.campaignSummary.textContent = 'Select a campaign to inspect linked cases and launch action strategy.';
    els.campaignActions.innerHTML = '';
    els.campaignCases.innerHTML = '<li>No linked cases.</li>';
    els.campaignBrief.innerHTML = '<li>No campaign brief available.</li>';
    return;
  }

  els.selectedCampaign.textContent = `${row.campaign_id} · ${row.primary_keyword || 'keyword n/a'}`;
  els.campaignSummary.className = 'spec-console-summary';
  els.campaignSummary.innerHTML = `
    <div class="spec-summary-grid">
      <p><strong>Domains</strong><span>${row.domain_count}</span></p>
      <p><strong>Linked Cases</strong><span>${row.linked_case_count}</span></p>
      <p><strong>Avg Threat</strong><span>${fmt(row.avg_score, 1)}</span></p>
      <p><strong>High Risk</strong><span>${row.high_risk}</span></p>
      <p><strong>Primary Brand</strong><span>${row.primary_brand || 'Unknown'}</span></p>
      <p><strong>Status</strong><span>${row.status}</span></p>
    </div>
  `;

  els.campaignActions.innerHTML = '';
  const actions = [
    { label: 'Queue Escalation', value: 'Escalation Requested' },
    { label: 'Set Monitor', value: 'Monitor' },
    { label: 'Mark Contained', value: 'Contained' },
  ];

  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spec-secondary-btn';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      row.status = action.value;
      if (action.value === 'Escalation Requested') row.priority += 1.5;
      if (action.value === 'Contained') row.priority = Math.max(0, row.priority - 2.5);
      renderCampaignTable();
      renderCampaignConsole();
      renderTerminal();
      saveState();
    });
    els.campaignActions.appendChild(button);
  }

  els.campaignCases.innerHTML = '';
  if (!row.linked_cases.length) {
    els.campaignCases.innerHTML = '<li>No linked cases.</li>';
  } else {
    row.linked_cases
      .sort((a, b) => toNumber(b.threat_score) - toNumber(a.threat_score))
      .slice(0, 10)
      .forEach((caseRow) => {
        const li = document.createElement('li');
        li.textContent = `${caseRow.case_id} · ${caseRow.domain} · threat ${caseRow.threat_score} · ${caseRow.recommended_action}`;
        els.campaignCases.appendChild(li);
      });
  }

  const brief = [
    `Primary response: ${row.recommendation || 'targeted registrar action'}`,
    `Concentration: ${row.domain_count} domains with ${row.linked_case_count} linked enforcement cases.`,
    `Risk posture: average threat ${fmt(row.avg_score, 1)} with ${row.high_risk} high-risk case(s).`,
    `Suggested next move: ${row.status === 'Escalation Requested' ? 'prepare registrar takedown packet' : 'continue targeted monitoring and evidence capture'}.`,
  ];

  els.campaignBrief.innerHTML = brief.map((line) => `<li>${line}</li>`).join('');
}

function bindEvents() {
  els.terminalTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.terminalTab = tab.dataset.thTab;
      renderTerminal();
    });
  });

  els.campaignSearch.addEventListener('input', () => {
    state.search = els.campaignSearch.value;
    renderCampaignTable();
  });

  els.campaignMin.addEventListener('input', () => {
    state.minDomains = toNumber(els.campaignMin.value, 1);
    els.campaignMinLabel.textContent = String(state.minDomains);
    renderCampaignTable();
  });
}

async function main() {
  try {
    state.payload = await loadPayload();
    state.thresholdArtifact = await loadThresholdArtifact(state.payload);
    state.campaigns = attachCampaignMetrics(state.payload);

    const local = loadLocalState(state.payload);
    applyLocalStatuses(local);

    state.selectedCampaignId = state.selectedCampaignId || state.campaigns[0]?.campaign_id || null;

    els.runMeta.textContent = `Run ${state.payload.run.run_id} · generated ${state.payload.run.generated_at} · ${prettyNumber(state.campaigns.length)} campaigns indexed`;

    bindEvents();
    renderCampaignMetaCharts();
    renderTerminal();
    renderCampaignTable();
    renderCampaignConsole();
  } catch (error) {
    els.runMeta.textContent = String(error);
  }
}

main();
