const pageId = document.body.dataset.page;
const tooltip = document.getElementById('ss-tooltip');
const STORAGE_KEY = 'brandguard-suite-state-v4';

const CASE_STATUSES = ['New', 'Triaged', 'Investigating', 'Enforcement', 'Closed'];
const CASE_CHANNELS = ['Domain', 'Marketplace', 'Paid Search', 'App', 'Social'];
const THREAT_TYPES = ['Impersonation', 'Phishing', 'Counterfeit', 'Scam', 'Policy Abuse'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const DOMAIN_STATUSES = ['Active', 'Monitoring', 'Incident', 'Suspended'];
const ENFORCEMENT_STATUSES = ['Queued', 'Sent', 'In Progress', 'Resolved', 'Denied'];
const ENFORCEMENT_TYPES = ['Takedown Notice', 'Registrar Report', 'Paid Search Complaint', 'Marketplace Report', 'Legal Escalation'];

function q(id) {
  return document.getElementById(id);
}

function nowIso() {
  return new Date().toISOString();
}

function fmtDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString();
}

function fmtDateTime(iso) {
  const date = new Date(iso);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function fmtHours(value) {
  if (!Number.isFinite(value)) return 'Unavailable';
  return `${value.toFixed(1)}h`;
}

function fmtPct(value) {
  return `${Math.round(value)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseDate(iso) {
  return new Date(iso).getTime();
}

function addHours(iso, hours) {
  return new Date(parseDate(iso) + hours * 60 * 60 * 1000).toISOString();
}

function hoursBetween(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  return (parseDate(toIso) - parseDate(fromIso)) / (1000 * 60 * 60);
}

function randomFrom(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function riskClass(score) {
  if (score >= 85) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

function priorityClass(priority) {
  if (priority === 'Critical') return 'high';
  if (priority === 'High') return 'medium';
  if (priority === 'Medium') return 'case';
  return 'neutral';
}

function statusClass(status) {
  if (status === 'Closed' || status === 'Resolved') return 'low';
  if (status === 'Denied' || status === 'Suspended') return 'high';
  if (status === 'Enforcement' || status === 'In Progress' || status === 'Incident') return 'medium';
  return 'case';
}

function createStatusChip(label, kind) {
  return `<span class="ss-status-chip ${kind || ''}">${escapeHtml(label)}</span>`;
}

function countBy(list, keyFn) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function withinDays(iso, days) {
  const ageMs = Date.now() - parseDate(iso);
  return ageMs <= days * 24 * 60 * 60 * 1000;
}

function lifecycleAllowed(from, to) {
  const map = {
    New: ['Triaged', 'Closed'],
    Triaged: ['Investigating', 'Enforcement', 'Closed'],
    Investigating: ['Enforcement', 'Closed'],
    Enforcement: ['Closed', 'Investigating'],
    Closed: [],
  };
  return (map[from] || []).includes(to);
}

function getLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function threatToCategory(legacyThreat) {
  const map = {
    'Credential Phishing': 'Phishing',
    'Payment Fraud': 'Scam',
    'Malware Delivery': 'Policy Abuse',
    'Brand Spoofing': 'Impersonation',
    'Account Takeover': 'Scam',
  };
  return map[legacyThreat] || 'Impersonation';
}

function statusFromLegacy(legacyStatus) {
  const map = {
    Open: 'New',
    'Under Review': 'Triaged',
    'Enforcement Initiated': 'Enforcement',
    Resolved: 'Closed',
    Closed: 'Closed',
    'Not Created': 'New',
  };
  return map[legacyStatus] || 'New';
}

function priorityFromRisk(score) {
  if (score >= 90) return 'Critical';
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

function nextPriority(priority) {
  const index = PRIORITIES.indexOf(priority);
  if (index === -1 || index === PRIORITIES.length - 1) return priority;
  return PRIORITIES[index + 1];
}

function suggestedActionForCase(caseItem) {
  if (caseItem.channel === 'Domain') {
    return caseItem.threatType === 'Phishing' ? 'File registrar abuse report and notify vendor.' : 'Issue takedown notice to registrar and hosting provider.';
  }
  if (caseItem.channel === 'Marketplace') return 'Submit marketplace report and track seller relisting behavior.';
  if (caseItem.channel === 'Paid Search') return 'Submit paid search complaint with impersonation evidence.';
  if (caseItem.channel === 'Social') return 'Escalate impersonation profile to platform policy operations.';
  return 'Open enforcement action and monitor recurrence for 72 hours.';
}

function suggestedEnforcementType(caseItem) {
  if (caseItem.channel === 'Domain') return 'Registrar Report';
  if (caseItem.channel === 'Marketplace') return 'Marketplace Report';
  if (caseItem.channel === 'Paid Search') return 'Paid Search Complaint';
  if (caseItem.priority === 'Critical') return 'Legal Escalation';
  return 'Takedown Notice';
}

function suggestedVendorId(state, caseItem) {
  if (caseItem.channel === 'Domain') return 'ven-001';
  if (caseItem.channel === 'Marketplace') return 'ven-003';
  if (caseItem.channel === 'Paid Search') return 'ven-004';
  return state.vendors[0]?.id || 'ven-001';
}

function issueSummary(caseItem) {
  return `${caseItem.threatType} indicators detected on ${caseItem.channel.toLowerCase()} channel with risk score ${caseItem.riskScore}.`;
}

function seedVendors() {
  return [
    { id: 'ven-001', name: 'DomainShield Global', slaHours: 24, region: 'Global', notes: 'Primary registrar escalation partner.' },
    { id: 'ven-002', name: 'ClearTrace Intelligence', slaHours: 36, region: 'US/EU', notes: 'Threat analysis and takedown support.' },
    { id: 'ven-003', name: 'MarketWatch Response', slaHours: 48, region: 'Global', notes: 'Marketplace and commerce enforcement.' },
    { id: 'ven-004', name: 'Search Integrity Partners', slaHours: 24, region: 'Global', notes: 'Paid search abuse operations.' },
  ];
}

function seedDomains() {
  return [
    {
      id: 'dom-001',
      domainName: 'meta-loginsecure.com',
      registrar: 'Namecheap',
      status: 'Incident',
      expiresOn: '2026-11-14',
      dnsSecurity: { dnssec: false, registryLock: false, whoisPrivacy: true },
      riskFlags: ['lookalike', 'phishing'],
      notes: 'Observed in credential harvesting campaign.',
      actionLog: [{ timestamp: addHours(nowIso(), -28), text: 'Registrar abuse report drafted and queued.' }],
      lastFlaggedAt: addHours(nowIso(), -26),
    },
    {
      id: 'dom-002',
      domainName: 'meta-support-verification.net',
      registrar: 'GoDaddy',
      status: 'Monitoring',
      expiresOn: '2027-02-02',
      dnsSecurity: { dnssec: false, registryLock: false, whoisPrivacy: true },
      riskFlags: ['lookalike'],
      notes: 'Traffic pattern low but language indicates social engineering setup.',
      actionLog: [{ timestamp: addHours(nowIso(), -56), text: 'Added to monitoring watchlist.' }],
      lastFlaggedAt: addHours(nowIso(), -52),
    },
    {
      id: 'dom-003',
      domainName: 'meta-accountreview.org',
      registrar: 'Cloudflare Registrar',
      status: 'Incident',
      expiresOn: '2026-08-09',
      dnsSecurity: { dnssec: true, registryLock: false, whoisPrivacy: true },
      riskFlags: ['phishing', 'typosquat'],
      notes: 'Campaign references account recovery workflows.',
      actionLog: [{ timestamp: addHours(nowIso(), -19), text: 'Vendor requested expedited takedown.' }],
      lastFlaggedAt: addHours(nowIso(), -18),
    },
    {
      id: 'dom-004',
      domainName: 'metapay-refund-help.co',
      registrar: 'Tucows',
      status: 'Monitoring',
      expiresOn: '2027-01-22',
      dnsSecurity: { dnssec: true, registryLock: false, whoisPrivacy: false },
      riskFlags: ['scam'],
      notes: 'Likely payment diversion risk.',
      actionLog: [{ timestamp: addHours(nowIso(), -80), text: 'Added to payment abuse queue.' }],
      lastFlaggedAt: addHours(nowIso(), -78),
    },
    {
      id: 'dom-005',
      domainName: 'meta-auth-portal.help',
      registrar: 'Gandi',
      status: 'Suspended',
      expiresOn: '2026-07-03',
      dnsSecurity: { dnssec: false, registryLock: false, whoisPrivacy: true },
      riskFlags: ['phishing', 'lookalike'],
      notes: 'Suspended after verified credential theft indicators.',
      actionLog: [{ timestamp: addHours(nowIso(), -160), text: 'Domain suspended after registrar action.' }],
      lastFlaggedAt: addHours(nowIso(), -170),
    },
    {
      id: 'dom-006',
      domainName: 'meta-creator-assistance.app',
      registrar: 'Google Domains',
      status: 'Active',
      expiresOn: '2027-05-10',
      dnsSecurity: { dnssec: true, registryLock: true, whoisPrivacy: true },
      riskFlags: [],
      notes: 'No active abuse signals.',
      actionLog: [{ timestamp: addHours(nowIso(), -220), text: 'Routine portfolio review completed.' }],
      lastFlaggedAt: addHours(nowIso(), -220),
    },
  ];
}

function note(id, text, createdAt, author = 'System', kind = 'note') {
  return { id, text, createdAt, author, kind };
}

function seedCases() {
  return [
    {
      id: 'case-0001',
      title: 'Credential phishing against Meta login flow',
      channel: 'Domain',
      threatType: 'Phishing',
      riskScore: 94,
      priority: 'Critical',
      status: 'Enforcement',
      owner: 'Alex Chen',
      createdAt: addHours(nowIso(), -88),
      updatedAt: addHours(nowIso(), -3),
      triagedAt: addHours(nowIso(), -82),
      closedAt: null,
      summary: 'Domain cluster mimics official login prompts and account recovery language.',
      aiSummary: 'High likelihood impersonation domain targeting account credentials. Recommend registrar abuse report and rapid takedown.',
      aiSuggestedAction: 'Open registrar escalation and preserve evidence snapshot.',
      linkedDomainId: 'dom-001',
      notes: [
        note('note-001', 'Escalated to external vendor due to credential theft indicators.', addHours(nowIso(), -6), 'Alex Chen', 'status'),
        note('note-002', 'Threat intel confirms active redirect chain to fake auth page.', addHours(nowIso(), -14), 'Marta Li', 'note'),
      ],
    },
    {
      id: 'case-0002',
      title: 'Counterfeit listings using Meta branding assets',
      channel: 'Marketplace',
      threatType: 'Counterfeit',
      riskScore: 86,
      priority: 'High',
      status: 'Investigating',
      owner: 'Marta Li',
      createdAt: addHours(nowIso(), -120),
      updatedAt: addHours(nowIso(), -16),
      triagedAt: addHours(nowIso(), -112),
      closedAt: null,
      summary: 'Marketplace seller network reuses trademarked logos and support language.',
      aiSummary: 'Cross-listing behavior suggests coordinated counterfeit operation.',
      aiSuggestedAction: 'Prepare marketplace enforcement packet and seller takedown request.',
      linkedDomainId: null,
      notes: [note('note-003', 'Added 12 listing URLs to evidence package.', addHours(nowIso(), -22), 'Marta Li')],
    },
    {
      id: 'case-0003',
      title: 'Paid search ad redirecting to spoofed support portal',
      channel: 'Paid Search',
      threatType: 'Scam',
      riskScore: 79,
      priority: 'High',
      status: 'Triaged',
      owner: 'Jordan Pike',
      createdAt: addHours(nowIso(), -66),
      updatedAt: addHours(nowIso(), -20),
      triagedAt: addHours(nowIso(), -60),
      closedAt: null,
      summary: 'Sponsored ad route masks destination and requests payment data.',
      aiSummary: 'Likely paid-search scam campaign targeting support seekers.',
      aiSuggestedAction: 'Submit paid search complaint with ad creative and destination evidence.',
      linkedDomainId: 'dom-004',
      notes: [note('note-004', 'Waiting for ad account abuse team confirmation.', addHours(nowIso(), -20), 'Jordan Pike')],
    },
    {
      id: 'case-0004',
      title: 'Social impersonation profile requesting account recovery',
      channel: 'Social',
      threatType: 'Impersonation',
      riskScore: 73,
      priority: 'Medium',
      status: 'New',
      owner: 'Unassigned',
      createdAt: addHours(nowIso(), -14),
      updatedAt: addHours(nowIso(), -14),
      triagedAt: null,
      closedAt: null,
      summary: 'Profile bio and DMs mimic official support escalation language.',
      aiSummary: 'Potential impersonation with moderate confidence and active outreach.',
      aiSuggestedAction: 'Triaged review and preserve account metadata before report.',
      linkedDomainId: null,
      notes: [note('note-005', 'Initial report received from support channel.', addHours(nowIso(), -14), 'System')],
    },
    {
      id: 'case-0005',
      title: 'Suspicious app package reusing Meta trademarks',
      channel: 'App',
      threatType: 'Policy Abuse',
      riskScore: 68,
      priority: 'Medium',
      status: 'Triaged',
      owner: 'Rina Shah',
      createdAt: addHours(nowIso(), -92),
      updatedAt: addHours(nowIso(), -31),
      triagedAt: addHours(nowIso(), -87),
      closedAt: null,
      summary: 'Third-party app listing includes deceptive branding and fake support links.',
      aiSummary: 'Trademark misuse and deceptive support prompts detected in listing metadata.',
      aiSuggestedAction: 'Coordinate app store report and monitor clone package rollout.',
      linkedDomainId: null,
      notes: [note('note-006', 'Store listing metadata archived for legal review.', addHours(nowIso(), -31), 'Rina Shah')],
    },
    {
      id: 'case-0006',
      title: 'Legacy phishing domain enforcement closure',
      channel: 'Domain',
      threatType: 'Phishing',
      riskScore: 91,
      priority: 'Critical',
      status: 'Closed',
      owner: 'Alex Chen',
      createdAt: addHours(nowIso(), -212),
      updatedAt: addHours(nowIso(), -96),
      triagedAt: addHours(nowIso(), -206),
      closedAt: addHours(nowIso(), -96),
      summary: 'Domain suspended and campaign infrastructure disabled.',
      aiSummary: 'Historical phishing incident resolved after registrar intervention.',
      aiSuggestedAction: 'Document closure and retain indicators for recurrence monitoring.',
      linkedDomainId: 'dom-005',
      notes: [note('note-007', 'Closure confirmed with registrar abuse desk.', addHours(nowIso(), -96), 'Alex Chen', 'status')],
    },
    {
      id: 'case-0007',
      title: 'Marketplace listing driving users to fake support domain',
      channel: 'Marketplace',
      threatType: 'Impersonation',
      riskScore: 64,
      priority: 'Medium',
      status: 'Investigating',
      owner: 'Marta Li',
      createdAt: addHours(nowIso(), -42),
      updatedAt: addHours(nowIso(), -12),
      triagedAt: addHours(nowIso(), -38),
      closedAt: null,
      summary: 'Listing contains direct links to suspicious support contact forms.',
      aiSummary: 'Likely brand misuse aimed at support fraud funneling.',
      aiSuggestedAction: 'Pair marketplace report with linked domain investigation.',
      linkedDomainId: 'dom-002',
      notes: [note('note-008', 'Added seller account network graph.', addHours(nowIso(), -12), 'Marta Li')],
    },
    {
      id: 'case-0008',
      title: 'Policy-abuse domain clone with typo variant',
      channel: 'Domain',
      threatType: 'Impersonation',
      riskScore: 58,
      priority: 'Medium',
      status: 'Triaged',
      owner: 'Jordan Pike',
      createdAt: addHours(nowIso(), -36),
      updatedAt: addHours(nowIso(), -9),
      triagedAt: addHours(nowIso(), -32),
      closedAt: null,
      summary: 'Typosquat clone detected in routine domain watchlist scan.',
      aiSummary: 'Likely preparatory infrastructure for broader impersonation campaign.',
      aiSuggestedAction: 'Continue monitoring and pre-stage enforcement package.',
      linkedDomainId: 'dom-003',
      notes: [note('note-009', 'Monitoring active; no live payload observed.', addHours(nowIso(), -9), 'Jordan Pike')],
    },
  ];
}

function seedEvidence() {
  return [
    { id: 'ev-001', caseId: 'case-0001', type: 'url', value: 'https://meta-loginsecure.com/account/recovery', capturedAt: addHours(nowIso(), -30) },
    { id: 'ev-002', caseId: 'case-0001', type: 'screenshot', value: 'Credential capture form with cloned branding', capturedAt: addHours(nowIso(), -29) },
    { id: 'ev-003', caseId: 'case-0002', type: 'url', value: 'Marketplace seller profile cluster (12 listings)', capturedAt: addHours(nowIso(), -25) },
    { id: 'ev-004', caseId: 'case-0003', type: 'text_snippet', value: 'Ad copy: "Verify your Meta support account now"', capturedAt: addHours(nowIso(), -22) },
    { id: 'ev-005', caseId: 'case-0004', type: 'screenshot', value: 'Impersonation DM requesting credentials', capturedAt: addHours(nowIso(), -13) },
    { id: 'ev-006', caseId: 'case-0007', type: 'url', value: 'Marketplace listing redirect chain', capturedAt: addHours(nowIso(), -15) },
  ];
}

function seedEnforcementActions() {
  return [
    {
      id: 'act-001',
      caseId: 'case-0001',
      vendorId: 'ven-001',
      actionType: 'Registrar Report',
      status: 'In Progress',
      requestedAt: addHours(nowIso(), -26),
      dueAt: addHours(nowIso(), -2),
      resolvedAt: null,
      outcome: 'Pending',
      notes: [note('note-201', 'Registrar acknowledged ticket; awaiting domain lock.', addHours(nowIso(), -4), 'Vendor Liaison')],
    },
    {
      id: 'act-002',
      caseId: 'case-0002',
      vendorId: 'ven-003',
      actionType: 'Marketplace Report',
      status: 'Sent',
      requestedAt: addHours(nowIso(), -20),
      dueAt: addHours(nowIso(), 28),
      resolvedAt: null,
      outcome: 'Pending',
      notes: [note('note-202', 'Marketplace queue accepted submission.', addHours(nowIso(), -18), 'Marta Li')],
    },
    {
      id: 'act-003',
      caseId: 'case-0003',
      vendorId: 'ven-004',
      actionType: 'Paid Search Complaint',
      status: 'Resolved',
      requestedAt: addHours(nowIso(), -55),
      dueAt: addHours(nowIso(), -31),
      resolvedAt: addHours(nowIso(), -34),
      outcome: 'Removed',
      notes: [note('note-203', 'Ad and destination removed by search provider.', addHours(nowIso(), -34), 'Jordan Pike')],
    },
    {
      id: 'act-004',
      caseId: 'case-0006',
      vendorId: 'ven-001',
      actionType: 'Legal Escalation',
      status: 'Resolved',
      requestedAt: addHours(nowIso(), -180),
      dueAt: addHours(nowIso(), -156),
      resolvedAt: addHours(nowIso(), -160),
      outcome: 'Escalated',
      notes: [note('note-204', 'Outside counsel coordinated closure packet.', addHours(nowIso(), -160), 'Legal Ops')],
    },
    {
      id: 'act-005',
      caseId: 'case-0007',
      vendorId: 'ven-003',
      actionType: 'Marketplace Report',
      status: 'Queued',
      requestedAt: addHours(nowIso(), -8),
      dueAt: addHours(nowIso(), 40),
      resolvedAt: null,
      outcome: 'Pending',
      notes: [note('note-205', 'Awaiting analyst approval for full seller bundle.', addHours(nowIso(), -8), 'System')],
    },
  ];
}

function createInitialState() {
  const cases = seedCases();
  const domains = seedDomains();
  const evidence = seedEvidence();
  const vendors = seedVendors();
  const enforcementActions = seedEnforcementActions();

  return {
    version: 4,
    cases,
    evidence,
    domains,
    vendors,
    enforcementActions,
    selectedCaseId: cases[0]?.id || null,
    selectedDomainId: domains[0]?.id || null,
    selectedActionId: enforcementActions[0]?.id || null,
    nextCaseSeq: 100,
    nextEvidenceSeq: 100,
    nextDomainSeq: 100,
    nextActionSeq: 100,
    nextNoteSeq: 500,
  };
}

function normalizeCase(caseItem, index) {
  const createdAt = caseItem.createdAt || addHours(nowIso(), -(index + 1) * 6);
  const notes = Array.isArray(caseItem.notes)
    ? caseItem.notes
    : [note(`note-norm-${index + 1}`, String(caseItem.notes || 'Imported note'), createdAt, 'System')];

  return {
    id: caseItem.id || caseItem.caseId || `case-${String(index + 1).padStart(4, '0')}`,
    title: caseItem.title || `${caseItem.threatType || caseItem.predictedThreatType || 'Threat'} investigation`,
    channel: CASE_CHANNELS.includes(caseItem.channel) ? caseItem.channel : 'Domain',
    threatType: THREAT_TYPES.includes(caseItem.threatType) ? caseItem.threatType : threatToCategory(caseItem.predictedThreatType),
    riskScore: Number(caseItem.riskScore ?? caseItem.threatScore ?? 60),
    priority: PRIORITIES.includes(caseItem.priority) ? caseItem.priority : priorityFromRisk(Number(caseItem.riskScore ?? caseItem.threatScore ?? 60)),
    status: CASE_STATUSES.includes(caseItem.status) ? caseItem.status : statusFromLegacy(caseItem.caseStatus),
    owner: caseItem.owner || 'Unassigned',
    createdAt,
    updatedAt: caseItem.updatedAt || createdAt,
    triagedAt: caseItem.triagedAt || null,
    closedAt: caseItem.closedAt || null,
    summary: caseItem.summary || issueSummary({ channel: caseItem.channel || 'Domain', threatType: threatToCategory(caseItem.predictedThreatType), riskScore: Number(caseItem.riskScore ?? caseItem.threatScore ?? 60) }),
    aiSummary: caseItem.aiSummary || 'AI triage summary unavailable. Review evidence and threat indicators manually.',
    aiSuggestedAction: caseItem.aiSuggestedAction || caseItem.recommendedEnforcementAction || 'Review and determine next enforcement action.',
    linkedDomainId: caseItem.linkedDomainId || caseItem.domainId || null,
    notes,
  };
}

function normalizeDomain(domain, index) {
  const id = domain.id || domain.domainId || `dom-${String(index + 1).padStart(4, '0')}`;
  const status = DOMAIN_STATUSES.includes(domain.status)
    ? domain.status
    : domain.caseStatus === 'Closed'
      ? 'Suspended'
      : Number(domain.riskScore || 0) >= 80
        ? 'Incident'
        : 'Monitoring';

  return {
    id,
    domainName: domain.domainName || domain.name || `unknown-${index + 1}.com`,
    registrar: domain.registrar || randomFrom(['Namecheap', 'GoDaddy', 'Gandi', 'Tucows'], index),
    status,
    expiresOn: domain.expiresOn || new Date(Date.now() + (120 + index * 7) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dnsSecurity: {
      dnssec: Boolean(domain.dnsSecurity?.dnssec),
      registryLock: Boolean(domain.dnsSecurity?.registryLock),
      whoisPrivacy: domain.dnsSecurity?.whoisPrivacy !== false,
    },
    riskFlags: Array.isArray(domain.riskFlags) ? domain.riskFlags : domain.predictedThreatType ? [threatToCategory(domain.predictedThreatType).toLowerCase()] : [],
    notes: domain.notes || 'Imported domain record.',
    actionLog: Array.isArray(domain.actionLog) ? domain.actionLog : [{ timestamp: domain.detectedAt || nowIso(), text: 'Imported from legacy simulation.' }],
    lastFlaggedAt: domain.lastFlaggedAt || domain.detectedAt || nowIso(),
  };
}

function normalizeVendor(vendor, index) {
  return {
    id: vendor.id || `ven-${String(index + 1).padStart(3, '0')}`,
    name: vendor.name || vendor.vendor || `Vendor ${index + 1}`,
    slaHours: Number(vendor.slaHours || 24),
    region: vendor.region || 'Global',
    notes: vendor.notes || 'Imported vendor profile.',
  };
}

function normalizeAction(action, index) {
  return {
    id: action.id || `act-${String(index + 1).padStart(3, '0')}`,
    caseId: action.caseId,
    vendorId: action.vendorId,
    actionType: ENFORCEMENT_TYPES.includes(action.actionType) ? action.actionType : 'Takedown Notice',
    status: ENFORCEMENT_STATUSES.includes(action.status) ? action.status : 'Queued',
    requestedAt: action.requestedAt || nowIso(),
    dueAt: action.dueAt || addHours(action.requestedAt || nowIso(), 24),
    resolvedAt: action.resolvedAt || null,
    outcome: action.outcome || 'Pending',
    notes: Array.isArray(action.notes) ? action.notes : [],
  };
}

function migrateFromLegacy(existing) {
  const domains = (existing.domains || []).map((domain, index) => normalizeDomain(domain, index));
  const domainIds = new Set(domains.map((domain) => domain.id));

  let cases = (existing.cases || []).map((legacyCase, index) => {
    const normalized = normalizeCase(
      {
        id: legacyCase.caseId,
        title: `${threatToCategory(legacyCase.predictedThreatType)} threat review`,
        channel: 'Domain',
        threatType: threatToCategory(legacyCase.predictedThreatType),
        riskScore: Number(legacyCase.threatScore || legacyCase.riskScore || 62),
        priority: priorityFromRisk(Number(legacyCase.threatScore || legacyCase.riskScore || 62)),
        status: statusFromLegacy(legacyCase.caseStatus),
        owner: randomFrom(['Alex Chen', 'Marta Li', 'Jordan Pike', 'Rina Shah'], index),
        createdAt: legacyCase.createdAt,
        updatedAt: legacyCase.updatedAt,
        summary: legacyCase.actionRationale || 'Imported from legacy domain-case simulation.',
        aiSummary: `Legacy import: ${legacyCase.predictedThreatType || 'threat'} mapped to ${threatToCategory(legacyCase.predictedThreatType)} workflow.`,
        aiSuggestedAction: legacyCase.recommendedEnforcementAction || 'Review and route to appropriate enforcement owner.',
        linkedDomainId: domainIds.has(legacyCase.domainId) ? legacyCase.domainId : null,
        notes: [note(`note-legacy-${index + 1}`, 'Imported from previous dashboard version.', legacyCase.createdAt || nowIso(), 'System')],
      },
      index
    );

    if (normalized.status !== 'New' && !normalized.triagedAt) {
      normalized.triagedAt = addHours(normalized.createdAt, 4);
    }
    if (normalized.status === 'Closed' && !normalized.closedAt) {
      normalized.closedAt = normalized.updatedAt;
    }

    return normalized;
  });

  if (!cases.length) {
    cases = createInitialState().cases;
  }

  const vendors = (existing.vendors || []).length ? existing.vendors.map((vendor, index) => normalizeVendor(vendor, index)) : seedVendors();
  const evidence = [];

  cases.forEach((caseItem, index) => {
    evidence.push({
      id: `ev-legacy-${index + 1}`,
      caseId: caseItem.id,
      type: 'text_snippet',
      value: caseItem.summary,
      capturedAt: caseItem.createdAt,
    });
  });

  const enforcementActions = cases
    .filter((caseItem) => caseItem.status === 'Enforcement' || caseItem.status === 'Closed' || caseItem.priority === 'Critical')
    .map((caseItem, index) => {
      const vendorId = suggestedVendorId({ vendors }, caseItem);
      const requestedAt = addHours(caseItem.createdAt, 10);
      const dueAt = addHours(requestedAt, vendors.find((vendor) => vendor.id === vendorId)?.slaHours || 24);
      const resolved = caseItem.status === 'Closed';
      return normalizeAction(
        {
          id: `act-legacy-${index + 1}`,
          caseId: caseItem.id,
          vendorId,
          actionType: suggestedEnforcementType(caseItem),
          status: resolved ? 'Resolved' : 'In Progress',
          requestedAt,
          dueAt,
          resolvedAt: resolved ? caseItem.closedAt || caseItem.updatedAt : null,
          outcome: resolved ? 'Removed' : 'Pending',
          notes: [note(`note-legacy-action-${index + 1}`, 'Generated during migration from legacy state.', requestedAt, 'System')],
        },
        index
      );
    });

  return {
    version: 4,
    cases,
    evidence,
    domains: domains.length ? domains : seedDomains(),
    vendors,
    enforcementActions,
    selectedCaseId: cases[0]?.id || null,
    selectedDomainId: (domains[0] || seedDomains()[0])?.id || null,
    selectedActionId: enforcementActions[0]?.id || null,
    nextCaseSeq: 200,
    nextEvidenceSeq: 200,
    nextDomainSeq: 200,
    nextActionSeq: 200,
    nextNoteSeq: 800,
  };
}

function normalizeState(state) {
  const cases = (state.cases || []).map((item, index) => normalizeCase(item, index));
  const domains = (state.domains || []).map((item, index) => normalizeDomain(item, index));
  const vendors = (state.vendors || seedVendors()).map((item, index) => normalizeVendor(item, index));
  const evidence = Array.isArray(state.evidence) ? state.evidence : [];
  const enforcementActions = (state.enforcementActions || []).map((item, index) => normalizeAction(item, index));

  return {
    version: 4,
    cases: cases.length ? cases : seedCases(),
    evidence: evidence.length ? evidence : seedEvidence(),
    domains: domains.length ? domains : seedDomains(),
    vendors: vendors.length ? vendors : seedVendors(),
    enforcementActions: enforcementActions.length ? enforcementActions : seedEnforcementActions(),
    selectedCaseId: state.selectedCaseId || cases[0]?.id || null,
    selectedDomainId: state.selectedDomainId || domains[0]?.id || null,
    selectedActionId: state.selectedActionId || enforcementActions[0]?.id || null,
    nextCaseSeq: Number(state.nextCaseSeq) || 300,
    nextEvidenceSeq: Number(state.nextEvidenceSeq) || 300,
    nextDomainSeq: Number(state.nextDomainSeq) || 300,
    nextActionSeq: Number(state.nextActionSeq) || 300,
    nextNoteSeq: Number(state.nextNoteSeq) || 900,
  };
}

function loadState() {
  const existing = getLocalState();
  if (!existing) {
    const created = createInitialState();
    persistState(created);
    return created;
  }

  if (existing.version >= 4) {
    const normalized = normalizeState(existing);
    persistState(normalized);
    return normalized;
  }

  const migrated = migrateFromLegacy(existing);
  persistState(migrated);
  return migrated;
}

const appState = loadState();

function ensureValidSelections() {
  if (!appState.cases.some((caseItem) => caseItem.id === appState.selectedCaseId)) {
    appState.selectedCaseId = appState.cases[0]?.id || null;
  }
  if (!appState.domains.some((domain) => domain.id === appState.selectedDomainId)) {
    appState.selectedDomainId = appState.domains[0]?.id || null;
  }
  if (!appState.enforcementActions.some((action) => action.id === appState.selectedActionId)) {
    appState.selectedActionId = appState.enforcementActions[0]?.id || null;
  }
}

ensureValidSelections();
persistState(appState);

function getCaseById(caseId) {
  return appState.cases.find((caseItem) => caseItem.id === caseId) || null;
}

function getDomainById(domainId) {
  return appState.domains.find((domain) => domain.id === domainId) || null;
}

function getVendorById(vendorId) {
  return appState.vendors.find((vendor) => vendor.id === vendorId) || null;
}

function getActionById(actionId) {
  return appState.enforcementActions.find((action) => action.id === actionId) || null;
}

function nextNoteId() {
  appState.nextNoteSeq += 1;
  return `note-${String(appState.nextNoteSeq).padStart(4, '0')}`;
}

function nextActionId() {
  appState.nextActionSeq += 1;
  return `act-${String(appState.nextActionSeq).padStart(4, '0')}`;
}

function addCaseNote(caseId, text, author = 'Analyst', kind = 'note') {
  const caseItem = getCaseById(caseId);
  if (!caseItem) return false;
  caseItem.notes.unshift(note(nextNoteId(), text, nowIso(), author, kind));
  caseItem.updatedAt = nowIso();
  persistState(appState);
  return true;
}

function setCaseOwner(caseId, owner) {
  const caseItem = getCaseById(caseId);
  if (!caseItem) return false;
  caseItem.owner = owner || 'Unassigned';
  caseItem.updatedAt = nowIso();
  addCaseNote(caseId, `Owner set to ${caseItem.owner}.`, 'System', 'status');
  persistState(appState);
  return true;
}

function updateCaseStatus(caseId, nextStatus, source = 'Analyst') {
  const caseItem = getCaseById(caseId);
  if (!caseItem) return false;
  if (caseItem.status === nextStatus) return true;
  if (!lifecycleAllowed(caseItem.status, nextStatus)) return false;

  const from = caseItem.status;
  caseItem.status = nextStatus;
  caseItem.updatedAt = nowIso();

  if (nextStatus === 'Triaged' && !caseItem.triagedAt) {
    caseItem.triagedAt = nowIso();
  }
  if (nextStatus === 'Closed') {
    caseItem.closedAt = nowIso();
  }

  caseItem.notes.unshift(note(nextNoteId(), `Status changed from ${from} to ${nextStatus}.`, nowIso(), source, 'status'));
  persistState(appState);
  return true;
}

function escalateCasePriority(caseId) {
  const caseItem = getCaseById(caseId);
  if (!caseItem) return false;
  const next = nextPriority(caseItem.priority);
  if (next === caseItem.priority) return false;
  caseItem.priority = next;
  caseItem.updatedAt = nowIso();
  caseItem.notes.unshift(note(nextNoteId(), `Priority escalated to ${next}.`, nowIso(), 'Analyst', 'status'));
  persistState(appState);
  return true;
}

function createEnforcementAction(caseId, actionType, reason) {
  const caseItem = getCaseById(caseId);
  if (!caseItem) return null;

  const vendorId = suggestedVendorId(appState, caseItem);
  const vendor = getVendorById(vendorId);
  const requestedAt = nowIso();
  const dueAt = addHours(requestedAt, vendor?.slaHours || 24);

  const action = {
    id: nextActionId(),
    caseId,
    vendorId,
    actionType,
    status: 'Queued',
    requestedAt,
    dueAt,
    resolvedAt: null,
    outcome: 'Pending',
    notes: [note(nextNoteId(), reason || `${actionType} created from investigation panel.`, requestedAt, 'Analyst', 'status')],
  };

  appState.enforcementActions.unshift(action);
  appState.selectedActionId = action.id;

  if (caseItem.status !== 'Closed' && caseItem.status !== 'Enforcement') {
    if (lifecycleAllowed(caseItem.status, 'Enforcement')) {
      updateCaseStatus(caseId, 'Enforcement', 'System');
    } else {
      caseItem.status = 'Enforcement';
      caseItem.updatedAt = nowIso();
    }
  }

  caseItem.notes.unshift(note(nextNoteId(), `${actionType} opened with ${vendor?.name || 'vendor queue'}.`, nowIso(), 'System', 'status'));
  persistState(appState);
  return action;
}

function actionSlaMeta(action) {
  if (action.status === 'Resolved' || action.status === 'Denied') {
    return { label: 'Completed', kind: 'low', breach: false };
  }

  const hoursLeft = hoursBetween(nowIso(), action.dueAt);
  if (hoursLeft < 0) {
    return { label: `Overdue ${Math.abs(hoursLeft).toFixed(1)}h`, kind: 'high', breach: true };
  }
  if (hoursLeft < 8) {
    return { label: `${hoursLeft.toFixed(1)}h left`, kind: 'medium', breach: false };
  }
  return { label: `${hoursLeft.toFixed(1)}h left`, kind: 'low', breach: false };
}

function updateEnforcementStatus(actionId, status) {
  const action = getActionById(actionId);
  if (!action) return false;
  if (!ENFORCEMENT_STATUSES.includes(status)) return false;

  action.status = status;

  if (status === 'Resolved') {
    action.resolvedAt = nowIso();
    action.outcome = action.outcome === 'Pending' ? 'Removed' : action.outcome;
  } else if (status === 'Denied') {
    action.resolvedAt = nowIso();
    action.outcome = 'Not Removed';
  } else {
    action.resolvedAt = null;
    action.outcome = 'Pending';
  }

  action.notes.unshift(note(nextNoteId(), `Enforcement status updated to ${status}.`, nowIso(), 'Analyst', 'status'));

  const caseItem = getCaseById(action.caseId);
  if (caseItem) {
    caseItem.updatedAt = nowIso();
    caseItem.notes.unshift(note(nextNoteId(), `${action.actionType} status updated to ${status}.`, nowIso(), 'System', 'status'));
    if (status === 'Resolved' && caseItem.status === 'Enforcement') {
      updateCaseStatus(caseItem.id, 'Closed', 'System');
    }
  }

  persistState(appState);
  return true;
}

function addEnforcementNote(actionId, text) {
  const action = getActionById(actionId);
  if (!action) return false;
  action.notes.unshift(note(nextNoteId(), text, nowIso(), 'Analyst', 'note'));
  persistState(appState);
  return true;
}

function addDomainActionLog(domainId, text) {
  const domain = getDomainById(domainId);
  if (!domain) return false;
  domain.actionLog.unshift({ timestamp: nowIso(), text });
  domain.status = domain.status === 'Active' ? 'Monitoring' : domain.status;
  persistState(appState);
  return true;
}

function renderKvGrid(container, rows) {
  if (!container) return;
  container.innerHTML = rows
    .map((row) => `<article class="ss-kv"><p>${escapeHtml(row.label)}</p><strong>${escapeHtml(row.value)}</strong></article>`)
    .join('');
}

function renderBarList(container, rows) {
  if (!container) return;
  const max = Math.max(1, ...rows.map((row) => row.value));
  container.innerHTML = rows
    .map((row) => {
      const width = Math.round((row.value / max) * 100);
      const displayValue = row.display ?? row.value;
      return `
        <article class="ss-bar-item">
          <div class="ss-bar-meta"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(displayValue))}</strong></div>
          <div class="ss-bar-track"><span style="width:${width}%"></span></div>
        </article>
      `;
    })
    .join('');
}

function renderGrid(svg, width, height, lines = 4) {
  for (let i = 0; i <= lines; i += 1) {
    const y = (height / lines) * i;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('x2', String(width));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', 'rgba(143, 151, 181, 0.24)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }
}

function renderPolyline(svg, series, color, width, height) {
  const step = width / Math.max(1, series.length - 1);
  const points = series
    .map((value, index) => {
      const x = index * step;
      const y = height - value * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', color);
  polyline.setAttribute('stroke-width', '2.4');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(polyline);
}

function renderSimpleLineChart(svg, valuesA, valuesB) {
  if (!svg) return;
  svg.innerHTML = '';
  const width = 640;
  const height = 170;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const max = Math.max(1, ...valuesA, ...valuesB);
  const normalizedA = valuesA.map((value) => value / max);
  const normalizedB = valuesB.map((value) => value / max);

  renderGrid(svg, width, height, 4);
  renderPolyline(svg, normalizedA, 'var(--ss-color-accent-primary)', width, height);
  renderPolyline(svg, normalizedB, 'var(--ss-color-accent-secondary)', width, height);
}

function queryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function updateQueryParam(name, value) {
  const url = new URL(window.location.href);
  if (!value) {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.replaceState({}, '', url);
}

function selectedCase() {
  return getCaseById(appState.selectedCaseId);
}

function selectedDomain() {
  return getDomainById(appState.selectedDomainId);
}

function selectedAction() {
  return getActionById(appState.selectedActionId);
}

function caseEvidence(caseId) {
  return appState.evidence.filter((item) => item.caseId === caseId).sort((a, b) => parseDate(b.capturedAt) - parseDate(a.capturedAt));
}

function caseActions(caseId) {
  return appState.enforcementActions.filter((action) => action.caseId === caseId).sort((a, b) => parseDate(b.requestedAt) - parseDate(a.requestedAt));
}

function domainLinkedCases(domainId) {
  return appState.cases.filter((caseItem) => caseItem.linkedDomainId === domainId).sort((a, b) => b.riskScore - a.riskScore);
}

function caseTimeline(caseItem) {
  const entries = [];

  caseItem.notes.forEach((item) => {
    entries.push({
      timestamp: item.createdAt,
      title: item.kind === 'status' ? 'Workflow Update' : `Note by ${item.author}`,
      detail: item.text,
    });
  });

  caseEvidence(caseItem.id).forEach((item) => {
    entries.push({
      timestamp: item.capturedAt,
      title: `Evidence captured (${item.type})`,
      detail: item.value,
    });
  });

  caseActions(caseItem.id).forEach((action) => {
    entries.push({
      timestamp: action.requestedAt,
      title: `${action.actionType} initiated`,
      detail: `Vendor ${getVendorById(action.vendorId)?.name || 'Unassigned'} · ${action.status}`,
    });
    if (action.resolvedAt) {
      entries.push({
        timestamp: action.resolvedAt,
        title: `${action.actionType} completed`,
        detail: `Outcome: ${action.outcome}`,
      });
    }
  });

  return entries.sort((a, b) => parseDate(b.timestamp) - parseDate(a.timestamp));
}

function overviewPage() {
  if (!q('overview-kpi-open')) return;

  const state = { range: 'all' };
  const rangeButtons = Array.from(document.querySelectorAll('[data-overview-range]'));

  function scopedCases() {
    if (state.range === 'week') {
      return appState.cases.filter((caseItem) => withinDays(caseItem.createdAt, 7));
    }
    return appState.cases;
  }

  function scopedActions() {
    if (state.range === 'week') {
      return appState.enforcementActions.filter((action) => withinDays(action.requestedAt, 7));
    }
    return appState.enforcementActions;
  }

  function volumeSeries(cases, weeks = 8) {
    const values = Array.from({ length: weeks }, () => 0);
    const now = Date.now();
    cases.forEach((caseItem) => {
      const diffDays = Math.floor((now - parseDate(caseItem.createdAt)) / (24 * 60 * 60 * 1000));
      const bucket = weeks - 1 - Math.floor(diffDays / 7);
      if (bucket >= 0 && bucket < weeks) values[bucket] += 1;
    });
    return values;
  }

  function closeSeries(actions, weeks = 8) {
    const values = Array.from({ length: weeks }, () => 0);
    const now = Date.now();
    actions.forEach((action) => {
      if (!action.resolvedAt) return;
      const diffDays = Math.floor((now - parseDate(action.resolvedAt)) / (24 * 60 * 60 * 1000));
      const bucket = weeks - 1 - Math.floor(diffDays / 7);
      if (bucket >= 0 && bucket < weeks) values[bucket] += 1;
    });
    return values;
  }

  function render() {
    const cases = scopedCases();
    const actions = scopedActions();

    const openCases = cases.filter((caseItem) => caseItem.status !== 'Closed').length;
    const highPriority = cases.filter((caseItem) => (caseItem.priority === 'High' || caseItem.priority === 'Critical') && caseItem.status !== 'Closed').length;
    const domainsFlagged = appState.domains.filter((domain) => domain.riskFlags.length && withinDays(domain.lastFlaggedAt, 7)).length;
    const breaches = actions.filter((action) => actionSlaMeta(action).breach).length;

    const avgTriage = average(cases.map((caseItem) => hoursBetween(caseItem.createdAt, caseItem.triagedAt)));
    const avgClose = average(cases.map((caseItem) => hoursBetween(caseItem.createdAt, caseItem.closedAt)));

    q('overview-kpi-open').textContent = String(openCases);
    q('overview-kpi-high').textContent = String(highPriority);
    q('overview-kpi-domains').textContent = String(domainsFlagged);
    q('overview-kpi-breaches').textContent = String(breaches);
    q('overview-kpi-triage').textContent = fmtHours(avgTriage || 0);
    q('overview-kpi-close').textContent = fmtHours(avgClose || 0);

    const channelRows = countBy(cases, (caseItem) => caseItem.channel).sort((a, b) => b.value - a.value);
    const typeRows = countBy(cases, (caseItem) => caseItem.threatType).sort((a, b) => b.value - a.value);
    renderBarList(q('overview-channel-bars'), channelRows.length ? channelRows : [{ label: 'No data', value: 0 }]);
    renderBarList(q('overview-type-bars'), typeRows.length ? typeRows : [{ label: 'No data', value: 0 }]);

    const topChannel = channelRows[0]?.label || 'Unavailable';
    const topThreat = typeRows[0]?.label || 'Unavailable';
    q('overview-summary').textContent = `Program is tracking ${cases.length} cases in scope. Highest concentration is ${topChannel} with ${topThreat} as the dominant threat category.`;

    q('overview-watchlist').innerHTML = [
      `${breaches} enforcement action(s) are currently over SLA and require vendor follow-up.`,
      `${highPriority} high/critical case(s) remain open for active triage or investigation.`,
      `${domainsFlagged} flagged domain(s) were observed in the last 7 days.`,
    ]
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');

    renderSimpleLineChart(q('overview-volume-line'), volumeSeries(cases), closeSeries(actions));
  }

  rangeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.range = button.dataset.overviewRange;
      rangeButtons.forEach((entry) => entry.classList.toggle('is-active', entry === button));
      render();
    });
  });

  render();
}

function queuePage() {
  if (!q('queue-rows')) return;

  const state = {
    query: '',
    channel: 'all',
    threat: 'all',
    status: 'all',
  };

  const rowsEl = q('queue-rows');
  const summary = q('queue-summary');
  const search = q('queue-search');
  const channelFilter = q('queue-channel-filter');
  const threatFilter = q('queue-threat-filter');
  const statusFilter = q('queue-status-filter');

  const kpiTotal = q('queue-kpi-total');
  const kpiCritical = q('queue-kpi-critical');
  const kpiNew = q('queue-kpi-new');

  const empty = q('queue-selected-empty');
  const panel = q('queue-selected-panel');
  const kv = q('queue-kv-grid');
  const notes = q('queue-notes');
  const statusSelect = q('queue-status-select');
  const ownerInput = q('queue-owner-input');
  const noteInput = q('queue-note-input');
  const stateMsg = q('queue-state');
  const openLink = q('queue-open-case');

  function setMessage(text, kind = 'loading') {
    if (!stateMsg) return;
    if (!text) {
      stateMsg.className = 'ss-hidden';
      stateMsg.textContent = '';
      return;
    }
    stateMsg.className = `ss-${kind}`;
    stateMsg.textContent = text;
  }

  function buildFilterOptions() {
    if (channelFilter) {
      channelFilter.innerHTML = `<option value="all">All Channels</option>${CASE_CHANNELS.map(
        (channel) => `<option value="${escapeHtml(channel)}">${escapeHtml(channel)}</option>`
      ).join('')}`;
    }

    if (threatFilter) {
      threatFilter.innerHTML = `<option value="all">All Threat Types</option>${THREAT_TYPES.map(
        (threat) => `<option value="${escapeHtml(threat)}">${escapeHtml(threat)}</option>`
      ).join('')}`;
    }

    if (statusFilter) {
      statusFilter.innerHTML = `<option value="all">All Statuses</option>${CASE_STATUSES.map(
        (status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`
      ).join('')}`;
    }

    if (statusSelect) {
      statusSelect.innerHTML = CASE_STATUSES.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join('');
    }
  }

  function filteredCases() {
    const query = state.query.trim().toLowerCase();
    return appState.cases
      .filter((caseItem) => {
        if (state.channel !== 'all' && caseItem.channel !== state.channel) return false;
        if (state.threat !== 'all' && caseItem.threatType !== state.threat) return false;
        if (state.status !== 'all' && caseItem.status !== state.status) return false;
        if (!query) return true;
        return `${caseItem.id} ${caseItem.title} ${caseItem.owner}`.toLowerCase().includes(query);
      })
      .sort((a, b) => b.riskScore - a.riskScore || parseDate(b.createdAt) - parseDate(a.createdAt));
  }

  function renderSelected() {
    const caseItem = selectedCase();
    if (!caseItem) {
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      if (openLink) openLink.href = './charts.html';
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    renderKvGrid(kv, [
      { label: 'Case ID', value: caseItem.id },
      { label: 'Channel', value: caseItem.channel },
      { label: 'Threat Type', value: caseItem.threatType },
      { label: 'Risk Score', value: String(caseItem.riskScore) },
      { label: 'Priority', value: caseItem.priority },
      { label: 'Status', value: caseItem.status },
      { label: 'Owner', value: caseItem.owner },
      { label: 'Created', value: fmtDateTime(caseItem.createdAt) },
    ]);

    notes.innerHTML = caseItem.notes
      .slice(0, 8)
      .map((entry) => `<li><strong>${escapeHtml(entry.author)}</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.createdAt))}</span></li>`)
      .join('');

    statusSelect.value = caseItem.status;
    ownerInput.value = caseItem.owner;
    if (openLink) openLink.href = `./charts.html?case=${encodeURIComponent(caseItem.id)}`;
  }

  function renderTable() {
    const rows = filteredCases();

    kpiTotal.textContent = String(rows.length);
    kpiCritical.textContent = String(rows.filter((caseItem) => caseItem.priority === 'Critical').length);
    kpiNew.textContent = String(rows.filter((caseItem) => caseItem.status === 'New').length);

    summary.textContent = `${rows.length} case(s) in queue`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="9">No cases match active filters.</td></tr>';
    }

    rows.forEach((caseItem) => {
      const row = document.createElement('tr');
      if (appState.selectedCaseId === caseItem.id) row.classList.add('is-selected');
      row.innerHTML = `
        <td>${escapeHtml(caseItem.id)}</td>
        <td>${escapeHtml(caseItem.channel)}</td>
        <td>${escapeHtml(caseItem.threatType)}</td>
        <td>${createStatusChip(String(caseItem.riskScore), riskClass(caseItem.riskScore))}</td>
        <td>${createStatusChip(caseItem.priority, priorityClass(caseItem.priority))}</td>
        <td>${createStatusChip(caseItem.status, statusClass(caseItem.status))}</td>
        <td>${escapeHtml(caseItem.owner)}</td>
        <td>${escapeHtml(fmtDate(caseItem.createdAt))}</td>
        <td>${escapeHtml(caseItem.notes[0]?.text || 'No notes')}</td>
      `;
      row.addEventListener('click', () => {
        appState.selectedCaseId = caseItem.id;
        persistState(appState);
        render();
      });
      rowsEl.appendChild(row);
    });

    if (!appState.selectedCaseId && rows[0]) {
      appState.selectedCaseId = rows[0].id;
      persistState(appState);
    }

    renderSelected();
  }

  function render() {
    setMessage('');
    renderTable();
  }

  q('queue-update-status')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    const success = updateCaseStatus(caseItem.id, statusSelect.value, 'Analyst');
    if (!success) {
      setMessage(`Invalid lifecycle transition from ${caseItem.status} to ${statusSelect.value}.`, 'error');
      return;
    }
    setMessage('Case status updated.', 'loading');
    render();
  });

  q('queue-save-owner')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    setCaseOwner(caseItem.id, ownerInput.value.trim() || 'Unassigned');
    setMessage('Owner updated.', 'loading');
    render();
  });

  q('queue-add-note')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    const text = noteInput.value.trim();
    if (!text) {
      setMessage('Enter a note before saving.', 'error');
      return;
    }
    addCaseNote(caseItem.id, text, 'Analyst');
    noteInput.value = '';
    setMessage('Note added.', 'loading');
    render();
  });

  q('queue-escalate')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    const changed = escalateCasePriority(caseItem.id);
    setMessage(changed ? 'Priority escalated.' : 'Case is already at Critical priority.', changed ? 'loading' : 'error');
    render();
  });

  search?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderTable();
  });

  channelFilter?.addEventListener('change', (event) => {
    state.channel = event.target.value;
    renderTable();
  });

  threatFilter?.addEventListener('change', (event) => {
    state.threat = event.target.value;
    renderTable();
  });

  statusFilter?.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderTable();
  });

  if (!appState.selectedCaseId && appState.cases[0]) {
    appState.selectedCaseId = appState.cases[0].id;
    persistState(appState);
  }

  buildFilterOptions();
  render();
}

function investigationPage() {
  if (!q('investigation-case-select')) return;

  const select = q('investigation-case-select');
  const meta = q('investigation-meta');
  const empty = q('investigation-empty');
  const panel = q('investigation-panel');

  const caseGrid = q('investigation-case-grid');
  const assetGrid = q('investigation-asset-grid');
  const evidenceList = q('investigation-evidence');
  const timeline = q('investigation-timeline');
  const enforcementLog = q('investigation-enforcement-log');

  const aiSummary = q('investigation-ai-summary');
  const aiCategory = q('investigation-ai-category');
  const aiAction = q('investigation-ai-action');

  function buildSelect() {
    select.innerHTML = appState.cases
      .slice()
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((caseItem) => `<option value="${escapeHtml(caseItem.id)}">${escapeHtml(caseItem.id)} · ${escapeHtml(caseItem.title)}</option>`)
      .join('');
  }

  function render() {
    const caseItem = selectedCase();
    if (!caseItem) {
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    select.value = caseItem.id;
    meta.textContent = `${caseItem.status} · Updated ${fmtDateTime(caseItem.updatedAt)}`;

    renderKvGrid(caseGrid, [
      { label: 'Case ID', value: caseItem.id },
      { label: 'Title', value: caseItem.title },
      { label: 'Channel', value: caseItem.channel },
      { label: 'Threat Type', value: caseItem.threatType },
      { label: 'Risk Score', value: String(caseItem.riskScore) },
      { label: 'Priority', value: caseItem.priority },
      { label: 'Status', value: caseItem.status },
      { label: 'Owner', value: caseItem.owner },
    ]);

    const domain = getDomainById(caseItem.linkedDomainId);
    renderKvGrid(assetGrid, [
      { label: 'Linked Domain / Asset', value: domain?.domainName || 'Unavailable' },
      { label: 'Registrar', value: domain?.registrar || 'Unavailable' },
      { label: 'Domain Status', value: domain?.status || 'Unavailable' },
      { label: 'Risk Flags', value: domain?.riskFlags.join(', ') || 'None' },
      { label: 'Summary', value: caseItem.summary },
    ]);

    evidenceList.innerHTML = caseEvidence(caseItem.id)
      .map((item) => `<li><strong>${escapeHtml(item.type)}</strong> · ${escapeHtml(item.value)}<br /><span>${escapeHtml(fmtDateTime(item.capturedAt))}</span></li>`)
      .join('');

    aiSummary.textContent = caseItem.aiSummary;
    aiCategory.textContent = `Suggested category: ${caseItem.threatType}`;
    aiAction.textContent = `Suggested next action: ${caseItem.aiSuggestedAction}`;

    timeline.innerHTML = caseTimeline(caseItem)
      .slice(0, 12)
      .map((entry) => `<li><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.detail)}</p><span>${escapeHtml(fmtDateTime(entry.timestamp))}</span></li>`)
      .join('');

    const actions = caseActions(caseItem.id);
    enforcementLog.innerHTML = actions.length
      ? actions
          .map((action) => {
            const vendor = getVendorById(action.vendorId);
            return `<li><strong>${escapeHtml(action.actionType)}</strong> · ${escapeHtml(vendor?.name || 'Unassigned')} · ${createStatusChip(
              action.status,
              statusClass(action.status)
            )}<br /><span>${escapeHtml(fmtDateTime(action.requestedAt))}</span></li>`;
          })
          .join('')
      : '<li>No enforcement actions yet.</li>';

    q('investigation-send-vendor').disabled = caseItem.status === 'Closed';
    q('investigation-escalate-legal').disabled = caseItem.status === 'Closed';
    q('investigation-close-case').disabled = caseItem.status === 'Closed';
  }

  q('investigation-send-vendor')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    createEnforcementAction(caseItem.id, suggestedEnforcementType(caseItem), 'Action initiated from Case Investigation view.');
    render();
  });

  q('investigation-escalate-legal')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    createEnforcementAction(caseItem.id, 'Legal Escalation', 'Escalated to legal from investigation panel.');
    render();
  });

  q('investigation-close-case')?.addEventListener('click', () => {
    const caseItem = selectedCase();
    if (!caseItem) return;
    updateCaseStatus(caseItem.id, 'Closed', 'Analyst');
    render();
  });

  select.addEventListener('change', (event) => {
    appState.selectedCaseId = event.target.value;
    persistState(appState);
    updateQueryParam('case', event.target.value);
    render();
  });

  const fromQuery = queryParam('case');
  if (fromQuery && getCaseById(fromQuery)) {
    appState.selectedCaseId = fromQuery;
  } else if (!appState.selectedCaseId && appState.cases[0]) {
    appState.selectedCaseId = appState.cases[0].id;
  }

  buildSelect();
  render();
}

function domainsPage() {
  if (!q('domains-rows')) return;

  const state = {
    query: '',
    status: 'all',
  };

  const search = q('domains-search');
  const statusFilter = q('domains-status-filter');
  const rowsEl = q('domains-rows');
  const summary = q('domains-summary');

  const kpiTotal = q('domains-kpi-total');
  const kpiMonitoring = q('domains-kpi-monitoring');
  const kpiIncident = q('domains-kpi-incident');

  const empty = q('domains-empty');
  const panel = q('domains-panel');
  const detailGrid = q('domains-detail-grid');
  const riskFlags = q('domains-risk-flags');
  const linkedCases = q('domains-linked-cases');
  const log = q('domains-log');
  const logInput = q('domains-log-input');

  function buildFilter() {
    statusFilter.innerHTML = `<option value="all">All Domain Statuses</option>${DOMAIN_STATUSES.map(
      (status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`
    ).join('')}`;
  }

  function filteredDomains() {
    const query = state.query.trim().toLowerCase();
    return appState.domains
      .filter((domain) => {
        if (state.status !== 'all' && domain.status !== state.status) return false;
        if (!query) return true;
        return `${domain.domainName} ${domain.registrar} ${domain.riskFlags.join(' ')}`.toLowerCase().includes(query);
      })
      .sort((a, b) => parseDate(b.lastFlaggedAt) - parseDate(a.lastFlaggedAt));
  }

  function securityLabel(domain) {
    return `DNSSEC ${domain.dnsSecurity.dnssec ? 'On' : 'Off'} · Lock ${domain.dnsSecurity.registryLock ? 'On' : 'Off'} · WHOIS ${
      domain.dnsSecurity.whoisPrivacy ? 'Private' : 'Public'
    }`;
  }

  function renderSelected() {
    const domain = selectedDomain();
    if (!domain) {
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    renderKvGrid(detailGrid, [
      { label: 'Domain', value: domain.domainName },
      { label: 'Registrar', value: domain.registrar },
      { label: 'Status', value: domain.status },
      { label: 'Expiration', value: domain.expiresOn },
      { label: 'Security Flags', value: securityLabel(domain) },
      { label: 'Portfolio Notes', value: domain.notes },
    ]);

    riskFlags.innerHTML = domain.riskFlags.length
      ? domain.riskFlags.map((flag) => `<span class="ss-chip">${escapeHtml(flag)}</span>`).join('')
      : '<span class="ss-chip">No active risk flags</span>';

    const linked = domainLinkedCases(domain.id);
    linkedCases.innerHTML = linked.length
      ? linked.map((caseItem) => `<li><a href="./charts.html?case=${encodeURIComponent(caseItem.id)}">${escapeHtml(caseItem.id)}</a> · ${escapeHtml(caseItem.title)}</li>`).join('')
      : '<li>No linked cases.</li>';

    log.innerHTML = domain.actionLog
      .slice(0, 10)
      .map((entry) => `<li><strong>Registrar Action</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.timestamp))}</span></li>`)
      .join('');
  }

  function renderTable() {
    const rows = filteredDomains();

    kpiTotal.textContent = String(appState.domains.length);
    kpiMonitoring.textContent = String(appState.domains.filter((domain) => domain.status === 'Monitoring').length);
    kpiIncident.textContent = String(appState.domains.filter((domain) => domain.status === 'Incident').length);

    summary.textContent = `${rows.length} domain(s) in view`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="6">No domains match current filters.</td></tr>';
    }

    rows.forEach((domain) => {
      const row = document.createElement('tr');
      if (domain.id === appState.selectedDomainId) row.classList.add('is-selected');
      row.innerHTML = `
        <td>${escapeHtml(domain.domainName)}</td>
        <td>${escapeHtml(domain.registrar)}</td>
        <td>${escapeHtml(domain.expiresOn)}</td>
        <td>${escapeHtml(securityLabel(domain))}</td>
        <td>${createStatusChip(domain.status, statusClass(domain.status))}</td>
        <td>${domain.riskFlags.map((flag) => `<span class="ss-chip">${escapeHtml(flag)}</span>`).join(' ') || 'None'}</td>
      `;
      row.addEventListener('click', () => {
        appState.selectedDomainId = domain.id;
        persistState(appState);
        renderSelected();
      });
      rowsEl.appendChild(row);
    });

    if (!appState.selectedDomainId && rows[0]) {
      appState.selectedDomainId = rows[0].id;
      persistState(appState);
    }

    renderSelected();
  }

  q('domains-log-add')?.addEventListener('click', () => {
    const domain = selectedDomain();
    if (!domain) return;
    const text = logInput.value.trim();
    if (!text) return;
    addDomainActionLog(domain.id, text);
    logInput.value = '';
    renderSelected();
  });

  search?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderTable();
  });

  statusFilter?.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderTable();
  });

  if (!appState.selectedDomainId && appState.domains[0]) {
    appState.selectedDomainId = appState.domains[0].id;
    persistState(appState);
  }

  buildFilter();
  renderTable();
}

function enforcementPage() {
  if (!q('enforcement-rows')) return;

  const state = { vendor: 'all', status: 'all' };

  const vendorFilter = q('enforcement-vendor-filter');
  const statusFilter = q('enforcement-status-filter');
  const rowsEl = q('enforcement-rows');
  const summary = q('enforcement-summary');

  const kpiOpen = q('enforcement-kpi-open');
  const kpiBreach = q('enforcement-kpi-breach');
  const kpiResolved = q('enforcement-kpi-resolved');

  const empty = q('enforcement-empty');
  const panel = q('enforcement-panel');
  const detailGrid = q('enforcement-detail-grid');
  const nextStatus = q('enforcement-next-status');
  const noteInput = q('enforcement-note-input');
  const notes = q('enforcement-notes');

  function buildFilters() {
    vendorFilter.innerHTML = `<option value="all">All Vendors</option>${appState.vendors
      .map((vendor) => `<option value="${escapeHtml(vendor.id)}">${escapeHtml(vendor.name)}</option>`)
      .join('')}`;

    statusFilter.innerHTML = `<option value="all">All Statuses</option>${ENFORCEMENT_STATUSES.map(
      (status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`
    ).join('')}`;

    nextStatus.innerHTML = ENFORCEMENT_STATUSES.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join('');
  }

  function filteredActions() {
    return appState.enforcementActions
      .filter((action) => {
        if (state.vendor !== 'all' && action.vendorId !== state.vendor) return false;
        if (state.status !== 'all' && action.status !== state.status) return false;
        return true;
      })
      .sort((a, b) => parseDate(a.dueAt) - parseDate(b.dueAt));
  }

  function renderSelected() {
    const action = selectedAction();
    if (!action) {
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    const vendor = getVendorById(action.vendorId);
    const caseItem = getCaseById(action.caseId);
    const sla = actionSlaMeta(action);

    renderKvGrid(detailGrid, [
      { label: 'Action ID', value: action.id },
      { label: 'Case ID', value: action.caseId },
      { label: 'Case Title', value: caseItem?.title || 'Unavailable' },
      { label: 'Vendor', value: vendor?.name || 'Unassigned' },
      { label: 'Action Type', value: action.actionType },
      { label: 'Current Status', value: action.status },
      { label: 'SLA Timer', value: sla.label },
      { label: 'Outcome', value: action.outcome },
      { label: 'Requested', value: fmtDateTime(action.requestedAt) },
      { label: 'Due', value: fmtDateTime(action.dueAt) },
    ]);

    nextStatus.value = action.status;

    notes.innerHTML = action.notes
      .slice(0, 12)
      .map((entry) => `<li><strong>${escapeHtml(entry.author)}</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.createdAt))}</span></li>`)
      .join('');
  }

  function renderTable() {
    const rows = filteredActions();

    const openCount = appState.enforcementActions.filter((action) => action.status !== 'Resolved' && action.status !== 'Denied').length;
    const breachCount = appState.enforcementActions.filter((action) => actionSlaMeta(action).breach).length;
    const resolvedCount = appState.enforcementActions.filter((action) => action.status === 'Resolved').length;

    kpiOpen.textContent = String(openCount);
    kpiBreach.textContent = String(breachCount);
    kpiResolved.textContent = String(resolvedCount);

    summary.textContent = `${rows.length} enforcement action(s) in view`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="7">No enforcement actions match current filters.</td></tr>';
    }

    rows.forEach((action) => {
      const vendor = getVendorById(action.vendorId);
      const caseItem = getCaseById(action.caseId);
      const sla = actionSlaMeta(action);
      const row = document.createElement('tr');
      if (action.id === appState.selectedActionId) row.classList.add('is-selected');
      row.innerHTML = `
        <td>${escapeHtml(caseItem?.id || action.caseId)}</td>
        <td>${escapeHtml(vendor?.name || 'Unassigned')}</td>
        <td>${escapeHtml(action.actionType)}</td>
        <td>${createStatusChip(sla.label, sla.kind)}</td>
        <td>${createStatusChip(action.status, statusClass(action.status))}</td>
        <td>${escapeHtml(action.outcome)}</td>
        <td>${escapeHtml(action.resolvedAt ? fmtDate(action.resolvedAt) : 'Open')}</td>
      `;
      row.addEventListener('click', () => {
        appState.selectedActionId = action.id;
        persistState(appState);
        renderSelected();
      });
      rowsEl.appendChild(row);
    });

    if (!appState.selectedActionId && rows[0]) {
      appState.selectedActionId = rows[0].id;
      persistState(appState);
    }

    renderSelected();

    const byType = countBy(appState.enforcementActions, (action) => action.actionType).sort((a, b) => b.value - a.value);
    renderBarList(q('enforcement-type-bars'), byType.length ? byType : [{ label: 'No data', value: 0 }]);
  }

  q('enforcement-update-status')?.addEventListener('click', () => {
    const action = selectedAction();
    if (!action) return;
    updateEnforcementStatus(action.id, nextStatus.value);
    renderTable();
  });

  q('enforcement-add-note')?.addEventListener('click', () => {
    const action = selectedAction();
    if (!action) return;
    const text = noteInput.value.trim();
    if (!text) return;
    addEnforcementNote(action.id, text);
    noteInput.value = '';
    renderSelected();
  });

  vendorFilter?.addEventListener('change', (event) => {
    state.vendor = event.target.value;
    renderTable();
  });

  statusFilter?.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderTable();
  });

  buildFilters();
  renderTable();
}

function showTooltip(event, text) {
  if (!tooltip) return;
  tooltip.textContent = text;
  tooltip.classList.remove('ss-hidden');
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
}

function hideTooltip() {
  if (!tooltip) return;
  tooltip.classList.add('ss-hidden');
}

function legacyNoop() {
  const root = document.querySelector('.ss-content');
  if (!root) return;
  const existing = root.querySelector('[data-legacy-message]');
  if (existing) return;
  const card = document.createElement('article');
  card.className = 'ss-card';
  card.dataset.legacyMessage = 'true';
  card.innerHTML = '<p class="ss-subtle">This legacy page is retained for rollback safety and is not part of the active 5-page MVP navigation.</p>';
  root.prepend(card);
}

if (pageId === 'overview') overviewPage();
if (pageId === 'queue') queuePage();
if (pageId === 'investigation') investigationPage();
if (pageId === 'domains') domainsPage();
if (pageId === 'enforcement') enforcementPage();
if (pageId === 'cases' || pageId === 'detail' || pageId === 'scan' || pageId === 'trends' || pageId === 'vendorops' || pageId === 'exec') {
  legacyNoop();
}

window.addEventListener('mousemove', (event) => {
  const target = event.target.closest('[data-tooltip]');
  if (!target) {
    hideTooltip();
    return;
  }
  showTooltip(event, target.dataset.tooltip);
});
window.addEventListener('scroll', hideTooltip, { passive: true });
