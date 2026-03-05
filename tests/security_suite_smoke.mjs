import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function assertIncludes(content, pattern, context) {
  if (!content.includes(pattern)) {
    throw new Error(`Missing pattern in ${context}: ${pattern}`);
  }
}

function assertRegex(content, regex, context) {
  if (!regex.test(content)) {
    throw new Error(`Missing regex in ${context}: ${regex}`);
  }
}

const pages = [
  {
    file: 'dashboard/security-suite/security-overview.html',
    mustContain: [
      'data-page="overview"',
      'id="overview-kpi-open"',
      'id="overview-kpi-high"',
      'id="overview-kpi-domains"',
      'id="overview-kpi-breaches"',
      'id="overview-kpi-triage"',
      'id="overview-kpi-close"',
      'id="overview-volume-line"',
      'id="overview-channel-bars"',
      'id="overview-type-bars"',
      'id="overview-summary"',
      'id="overview-watchlist"',
    ],
  },
  {
    file: 'dashboard/security-suite/table.html',
    mustContain: [
      'data-page="queue"',
      'id="queue-search"',
      'id="queue-channel-filter"',
      'id="queue-threat-filter"',
      'id="queue-status-filter"',
      'id="queue-rows"',
      'id="queue-kpi-total"',
      'id="queue-kpi-critical"',
      'id="queue-kpi-new"',
      'id="queue-status-select"',
      'id="queue-owner-input"',
      'id="queue-note-input"',
      'id="queue-update-status"',
      'id="queue-save-owner"',
      'id="queue-add-note"',
      'id="queue-escalate"',
      'id="queue-open-case"',
    ],
  },
  {
    file: 'dashboard/security-suite/charts.html',
    mustContain: [
      'data-page="investigation"',
      'id="investigation-case-select"',
      'id="investigation-case-grid"',
      'id="investigation-asset-grid"',
      'id="investigation-evidence"',
      'id="investigation-ai-summary"',
      'id="investigation-ai-category"',
      'id="investigation-ai-action"',
      'id="investigation-send-vendor"',
      'id="investigation-escalate-legal"',
      'id="investigation-close-case"',
      'id="investigation-timeline"',
      'id="investigation-enforcement-log"',
    ],
  },
  {
    file: 'dashboard/security-suite/heatmap.html',
    mustContain: [
      'data-page="domains"',
      'id="domains-search"',
      'id="domains-status-filter"',
      'id="domains-kpi-total"',
      'id="domains-kpi-monitoring"',
      'id="domains-kpi-incident"',
      'id="domains-rows"',
      'id="domains-summary"',
      'id="domains-detail-grid"',
      'id="domains-risk-flags"',
      'id="domains-linked-cases"',
      'id="domains-log"',
      'id="domains-log-input"',
      'id="domains-log-add"',
    ],
  },
  {
    file: 'dashboard/security-suite/ui-elements.html',
    mustContain: [
      'data-page="enforcement"',
      'id="enforcement-vendor-filter"',
      'id="enforcement-status-filter"',
      'id="enforcement-kpi-open"',
      'id="enforcement-kpi-breach"',
      'id="enforcement-kpi-resolved"',
      'id="enforcement-rows"',
      'id="enforcement-summary"',
      'id="enforcement-detail-grid"',
      'id="enforcement-next-status"',
      'id="enforcement-update-status"',
      'id="enforcement-note-input"',
      'id="enforcement-add-note"',
      'id="enforcement-notes"',
      'id="enforcement-type-bars"',
    ],
  },
];

for (const page of pages) {
  const content = read(page.file);
  for (const token of page.mustContain) {
    assertIncludes(content, token, page.file);
  }
  assertRegex(content, /class="ss-page-tabs"/, page.file);
}

const js = read('dashboard/security-suite/assets/security-suite.js');
[
  'const STORAGE_KEY = \'brandguard-suite-state-v4\';',
  'const CASE_STATUSES = [\'New\', \'Triaged\', \'Investigating\', \'Enforcement\', \'Closed\'];',
  'function createInitialState()',
  'function migrateFromLegacy(existing)',
  'function overviewPage()',
  'function queuePage()',
  'function investigationPage()',
  'function domainsPage()',
  'function enforcementPage()',
  "if (pageId === 'overview') overviewPage();",
  "if (pageId === 'queue') queuePage();",
  "if (pageId === 'investigation') investigationPage();",
  "if (pageId === 'domains') domainsPage();",
  "if (pageId === 'enforcement') enforcementPage();",
].forEach((marker) => assertIncludes(js, marker, 'dashboard/security-suite/assets/security-suite.js'));

console.log('security-suite-smoke:ok');
