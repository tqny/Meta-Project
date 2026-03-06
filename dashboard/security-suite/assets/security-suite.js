const pageId = document.body.dataset.page;
const tooltip = document.getElementById('ss-tooltip');
const STORAGE_KEY = 'brandguard-suite-state-v5';
const brandTrigger = document.querySelector('[data-brand-trigger]');
const explainerTriggers = Array.from(document.querySelectorAll('[data-explainer-trigger]'));

const OVERVIEW_EXPLAINERS = {
  'overview.page': {
    primary: {
      file: 'overview.explain.json',
      content: {
        id: 'overview.page',
        purpose: 'program snapshot layer',
        narrative: [
          'Suspicious domains and other off-platform threats start outside the company, but they create operational pressure inside the program as soon as detection systems find them.',
          'This page summarizes that pressure before a program manager drops into queue, investigation, or vendor execution.',
        ],
        shows: ['off-platform threat pressure', 'active casework', 'movement toward enforcement'],
        supports: ['prioritization', 'trend monitoring', 'stakeholder briefings'],
      },
    },
    views: {
      workflow: {
        file: 'overview.workflow_context.json',
        content: {
          id: 'overview.workflow_context',
          narrative:
            'Threats are first discovered across off-platform channels. AI helps prioritize which ones look most likely to abuse Meta brands. Higher-confidence items move into queue and investigation, while lower-confidence items can remain in monitoring.',
          sequence: ['discover', 'prioritize', 'queue', 'investigate', 'route', 'report'],
          branches: ['monitor', 'enforce_operationally', 'escalate_legally'],
          role: 'summarizes workflow health without doing the casework directly',
        },
      },
      decisions: {
        file: 'overview.decisions.json',
        content: {
          id: 'overview.decisions',
          narrative:
            'A program manager uses this page to decide where attention, escalation, and stakeholder communication should go first.',
          answers: [
            'Where is threat volume increasing?',
            'Which workflow stage is under pressure?',
            'Are cases and enforcement moving at a healthy pace?',
            'Are vendor or SLA issues emerging?',
          ],
          role: 'orientation and reporting layer for the program manager',
        },
      },
    },
    options: [
      { key: 'workflow', label: '[1] How this fits in the workflow' },
      { key: 'decisions', label: '[2] What decisions this page supports' },
    ],
  },
  'overview.program_health_surface': {
    primary: {
      file: 'overview.program_health_surface.json',
      content: {
        id: 'overview.program_health_surface',
        represents: 'main operational summary surface',
        narrative:
          'This is the fastest way to tell whether the system is absorbing incoming threat activity or falling behind it.',
        compares: ['incoming threat pressure', 'case movement', 'response movement'],
        core_question: 'Is the program keeping up with incoming threat activity?',
      },
    },
    views: {
      metrics: {
        file: 'overview.program_health_surface.metrics.json',
        content: {
          id: 'overview.program_health_surface.metrics',
          narrative:
            'These signals sit together because they are meant to be interpreted together, not in isolation.',
          tracks: ['detected activity', 'active case creation', 'enforcement movement'],
          role: 'compresses the highest-signal program indicators into one surface',
        },
      },
      workflow: {
        file: 'overview.program_health_surface.workflow_context.json',
        content: {
          id: 'overview.program_health_surface.workflow_context',
          narrative:
            'Detection systems and AI generate suspicious candidates. Those candidates become watch items, active cases, or enforcement work depending on confidence and urgency.',
          inputs: ['detection systems', 'AI prioritization'],
          downstream: ['queue', 'investigation', 'enforcement', 'legal escalation'],
          role: 'shows pressure and movement across the workflow',
        },
      },
    },
    options: [
      { key: 'metrics', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'overview.executive_briefing': {
    primary: {
      file: 'overview.executive_briefing.json',
      content: {
        id: 'overview.executive_briefing',
        represents: 'human-readable summary layer',
        narrative:
          'Charts and metrics show movement. This panel translates that movement into language a program manager can use with leadership, legal, security, integrity, and external partners.',
        turns: ['telemetry', 'case movement', 'enforcement load'],
        into: ['high-signal observations', 'stakeholder-ready guidance'],
      },
    },
    views: {
      why: {
        file: 'overview.executive_briefing.why.json',
        content: {
          id: 'overview.executive_briefing.why',
          narrative:
            'The role is not just to watch cases move. It is to recognize what the movement means and communicate the implications clearly.',
          supports: ['stakeholder briefings', 'trend flagging', 'operational risk communication'],
          role: 'reduces the need to interpret every chart manually',
        },
      },
      workflow: {
        file: 'overview.executive_briefing.workflow_context.json',
        content: {
          id: 'overview.executive_briefing.workflow_context',
          narrative:
            'Everything below this layer is operational detail. This panel sits above that detail and explains what should matter now.',
          sits_above: ['evidence', 'cases', 'enforcement actions'],
          surfaces: ['where threat pressure is rising', 'where execution is slowing', 'what leadership should know now'],
        },
      },
    },
    options: [
      { key: 'why', label: '[1] Why this matters' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'overview.threat_movement': {
    primary: {
      file: 'overview.threat_movement.json',
      content: {
        id: 'overview.threat_movement',
        represents: 'movement of threats through the operating system over time',
        narrative:
          'This chart shows whether incoming abuse is being turned into action and closure fast enough. It is the cleanest visual summary of pressure entering the system versus work leaving it.',
        tracks: ['domains flagged', 'cases opened', 'actions resolved'],
      },
    },
    views: {
      series: {
        file: 'overview.threat_movement.series.json',
        content: {
          id: 'overview.threat_movement.series',
          narrative:
            'Each series represents a different stage of the workflow, so the chart works best when the lines and bars are read together rather than separately.',
          domains_flagged: 'new suspicious assets detected by monitoring and AI systems',
          cases_opened: 'threats serious enough to become active investigation work',
          actions_resolved: 'enforcement actions that reached an outcome such as removal, closure, or escalation completion',
        },
      },
      workflow: {
        file: 'overview.threat_movement.workflow_context.json',
        content: {
          id: 'overview.threat_movement.workflow_context',
          narrative:
            'This panel sits at the center of the overall story: discover, prioritize, queue, investigate, enforce, and close. If detections rise faster than resolutions, operational pressure is building.',
          sequence: ['discover', 'prioritize', 'case creation', 'investigate', 'enforce', 'close_or_escalate'],
          role: 'shows whether the system is keeping pace with incoming off-platform abuse',
        },
      },
    },
    options: [
      { key: 'series', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'queue.page': {
    primary: {
      file: 'queue.explain.json',
      content: {
        id: 'queue.page',
        purpose: 'primary triage work surface',
        narrative: [
          'This is where suspicious domains and off-platform assets first become active operational work.',
          'The queue helps a program manager or analyst decide what requires attention now, what can stay in monitoring, and what should move forward into investigation.',
        ],
        supports: ['prioritization', 'triage', 'workflow updates', 'ownership assignment'],
        next_step: 'select a case and decide whether it should stay in monitoring, move into deeper investigation, or advance toward enforcement',
      },
    },
    views: {
      workflow: {
        file: 'queue.workflow_context.json',
        content: {
          id: 'queue.workflow_context',
          narrative:
            'Upstream, detection systems and AI models identify suspicious assets. Downstream, selected cases move into investigation, enforcement, or legal escalation depending on confidence and impact.',
          role: 'connects detection to human triage and case progression',
          sequence: ['detect', 'prioritize', 'queue', 'investigate', 'enforce_or_monitor'],
        },
      },
      decisions: {
        file: 'queue.decisions.json',
        content: {
          id: 'queue.decisions',
          narrative:
            'The queue is less about deep analysis and more about deciding who should work what, how urgent it is, and whether the case should advance.',
          answers: [
            'Which cases require immediate attention?',
            'Which items are still just watch candidates?',
            'Who owns the next step?',
            'What status should this case move into next?',
          ],
        },
      },
    },
    options: [
      { key: 'workflow', label: '[1] How this fits in the workflow' },
      { key: 'decisions', label: '[2] What decisions this page supports' },
    ],
  },
  'queue.ranked_threat_queue': {
    primary: {
      file: 'queue.ranked_threat_queue.json',
      content: {
        id: 'queue.ranked_threat_queue',
        represents: 'ranked list of case candidates and active casework',
        narrative:
          'This surface compresses the active queue into a scan-first view. Cases are sorted so the highest-risk and highest-priority items rise first, letting the team work top-down instead of case-by-case at random.',
        compares: ['risk score', 'threat signals', 'workflow status', 'owner', 'latest movement'],
      },
    },
    views: {
      measures: {
        file: 'queue.ranked_threat_queue.measures.json',
        content: {
          id: 'queue.ranked_threat_queue.measures',
          narrative:
            'Each row is a compact decision object: what the case is, why it matters, where it is in the workflow, and who is accountable for the next move.',
          columns: {
            queue_case: 'case identity and the core threat title',
            signals: 'channel, threat type, and linked domain context',
            risk_workflow: 'risk score and current status',
            owner: 'current operational owner',
            latest_activity: 'most recent movement or update signal',
          },
        },
      },
      workflow: {
        file: 'queue.ranked_threat_queue.workflow_context.json',
        content: {
          id: 'queue.ranked_threat_queue.workflow_context',
          narrative:
            'This table sits between automated detection and deeper case handling. It is the gate where suspicious activity becomes managed casework.',
          branches: ['monitor', 'investigate', 'prepare for enforcement'],
          role: 'determines what progresses and in what order',
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'queue.selected_case_utility': {
    primary: {
      file: 'queue.selected_case_utility.json',
      content: {
        id: 'queue.selected_case_utility',
        represents: 'focused case context and action panel',
        narrative:
          'Once a case is selected from the queue, this panel turns the ranked row into an actionable decision surface. It gives the operator enough context to move the case forward without leaving the queue.',
        includes: ['case summary', 'core metadata', 'AI suggested next step', 'workflow actions', 'recent notes'],
      },
    },
    views: {
      measures: {
        file: 'queue.selected_case_utility.measures.json',
        content: {
          id: 'queue.selected_case_utility.measures',
          narrative:
            'This panel is designed for fast decisions, not full investigation. It keeps only the context needed to update status, assign ownership, add notes, or escalate priority.',
          shows: {
            context: 'selected case summary and linked domain snapshot',
            metadata: 'owner, timestamps, evidence count, open actions',
            ai: 'recommended next move based on current signals',
            workflow_actions: 'status, owner, note, and priority controls',
          },
        },
      },
      workflow: {
        file: 'queue.selected_case_utility.workflow_context.json',
        content: {
          id: 'queue.selected_case_utility.workflow_context',
          narrative:
            'This panel bridges triage and deeper handling. It is where the queue turns from passive ranking into active case movement.',
          role: 'lets the operator update the case before it moves to investigation or enforcement',
          outcomes: ['keep in monitoring', 'advance investigation', 'prepare enforcement', 'escalate priority'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'investigation.page': {
    primary: {
      file: 'investigation.explain.json',
      content: {
        id: 'investigation.page',
        purpose: 'deep case analysis and recommendation surface',
        narrative: [
          'This page is where a queued case becomes explainable. It brings together signals, evidence, timeline movement, and AI recommendation so the operator can understand why a threat matters and what should happen next.',
          'The goal here is not just to see that a case is risky. It is to understand the reasoning behind the recommended response.',
        ],
        supports: ['decision clarity', 'evidence review', 'response planning', 'legal or vendor escalation readiness'],
      },
    },
    views: {
      workflow: {
        file: 'investigation.workflow_context.json',
        content: {
          id: 'investigation.workflow_context',
          narrative:
            'The queue decides what deserves attention. Investigation explains why. Once the case is understood clearly enough, it can move into operational enforcement or legal escalation with more confidence.',
          role: 'connects triage to action by making the case explainable',
          sequence: ['queue', 'investigate', 'recommend', 'enforce_or_escalate'],
        },
      },
      decisions: {
        file: 'investigation.decisions.json',
        content: {
          id: 'investigation.decisions',
          narrative:
            'This page helps answer whether the case is truly abusive, how urgent it is, and which response path is most appropriate.',
          answers: [
            'What signals are driving the risk assessment?',
            'How strong is the evidence?',
            'What action is recommended next?',
            'Is this ready for vendor, registrar, or legal routing?',
          ],
        },
      },
    },
    options: [
      { key: 'workflow', label: '[1] How this fits in the workflow' },
      { key: 'decisions', label: '[2] What decisions this page supports' },
    ],
  },
  'investigation.signal_recommendation': {
    primary: {
      file: 'investigation.signal_recommendation.json',
      content: {
        id: 'investigation.signal_recommendation',
        represents: 'main analytical decision surface for the selected case',
        narrative:
          'This surface combines signal buildup, evidence confidence, and recommended action in one place. It is designed to show not just that the case is risky, but how that risk develops across the case timeline.',
        includes: ['signal development', 'decision trend deck', 'AI recommendation', 'case and asset context'],
      },
    },
    views: {
      measures: {
        file: 'investigation.signal_recommendation.measures.json',
        content: {
          id: 'investigation.signal_recommendation.measures',
          narrative:
            'The visual traces help the operator read momentum: how the threat matured, how evidence accumulated, and when the case became ready for enforcement.',
          tracks: {
            signal_development: 'how signal strength rises across the case timeline',
            decision_trends: 'how threat signal, evidence confidence, and enforcement readiness move together',
            decision_module: 'AI summary, suggested classification, and suggested next action',
          },
        },
      },
      workflow: {
        file: 'investigation.signal_recommendation.workflow_context.json',
        content: {
          id: 'investigation.signal_recommendation.workflow_context',
          narrative:
            'This is the point where the workflow shifts from ranked suspicion to supported action. The surface is meant to justify movement into vendor execution, registrar action, or legal review.',
          role: 'translates detection and triage into an explainable recommendation',
          outcomes: ['monitor longer', 'send vendor request', 'escalate to legal', 'close if resolved'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'investigation.decision_module': {
    primary: {
      file: 'investigation.decision_module.json',
      content: {
        id: 'investigation.decision_module',
        represents: 'action-oriented recommendation block',
        narrative:
          'This module turns the case analysis into an explicit recommendation. It is where AI summary, suggested classification, and proposed action are presented together so the operator can move from understanding to execution.',
        includes: ['AI case summary', 'suggested classification', 'suggested enforcement action', 'next-step buttons'],
      },
    },
    views: {
      measures: {
        file: 'investigation.decision_module.measures.json',
        content: {
          id: 'investigation.decision_module.measures',
          narrative:
            'This block is less about raw signals and more about what the signals add up to. It condenses the investigation into a usable recommendation.',
          shows: {
            ai_summary: 'short explanation of why the case matters',
            classification: 'the predicted abuse pattern',
            enforcement_action: 'the most likely next response path',
            actions: 'buttons that move the case into vendor, legal, or closure workflows',
          },
        },
      },
      workflow: {
        file: 'investigation.decision_module.workflow_context.json',
        content: {
          id: 'investigation.decision_module.workflow_context',
          narrative:
            'This module sits at the handoff point between investigation and execution. Once a case is sufficiently understood, this is where the operator decides to act on it.',
          role: 'translates analysis into operational or legal motion',
          outcomes: ['send vendor request', 'escalate to legal', 'close if resolved'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'investigation.decision_trace': {
    primary: {
      file: 'investigation.decision_trace.json',
      content: {
        id: 'investigation.decision_trace',
        represents: 'chronological record of how the case evolved',
        narrative:
          'This trace shows how the case moved from detection to recommendation. It helps the operator understand not just the current state, but the sequence of events that created it.',
        includes: ['detection events', 'evidence capture', 'case updates', 'enforcement actions'],
      },
    },
    views: {
      measures: {
        file: 'investigation.decision_trace.measures.json',
        content: {
          id: 'investigation.decision_trace.measures',
          narrative:
            'The timeline is useful when a decision depends on sequence: what appeared first, when evidence accumulated, and when enforcement action was triggered.',
          shows: {
            detection: 'when the threat first entered the system',
            evidence: 'when supporting evidence was captured',
            workflow_updates: 'status and analyst note changes',
            enforcement: 'when actions were initiated or completed',
          },
        },
      },
      workflow: {
        file: 'investigation.decision_trace.workflow_context.json',
        content: {
          id: 'investigation.decision_trace.workflow_context',
          narrative:
            'This panel provides the audit trail behind the case. It makes the transition from raw detection to final action explainable to internal and external stakeholders.',
          role: 'supports accountability, handoff clarity, and escalation readiness',
          audiences: ['program managers', 'legal', 'security', 'vendors'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'enforcement.page': {
    primary: {
      file: 'enforcement.explain.json',
      content: {
        id: 'enforcement.page',
        purpose: 'external action coordination and outcome tracking surface',
        narrative: [
          'This page is where investigated threats turn into tracked external execution.',
          'It shows which vendor, registrar, or legal-path actions are active, what is overdue, and which outcomes are moving toward closure.',
        ],
        supports: ['vendor coordination', 'sla tracking', 'outcome management', 'escalation readiness'],
      },
    },
    views: {
      workflow: {
        file: 'enforcement.workflow_context.json',
        content: {
          id: 'enforcement.workflow_context',
          narrative:
            'After queue and investigation establish that a threat needs action, the work lands here as an execution object. This is where the team tracks who is handling it, what deadline applies, and whether the response path is succeeding.',
          sequence: ['investigate', 'route action', 'assign vendor or registrar path', 'track sla', 'resolve or escalate'],
          branches: ['vendor_execution', 'registrar_action', 'legal_escalation'],
          role: 'turns recommended action into managed external execution',
        },
      },
      decisions: {
        file: 'enforcement.decisions.json',
        content: {
          id: 'enforcement.decisions',
          narrative:
            'A program manager uses this page to decide where to intervene in execution: what is late, what needs escalation, and where external coordination is not moving fast enough.',
          answers: [
            'Which actions are still open?',
            'Where are SLA breaches forming?',
            'Which partner routes are overloaded?',
            'What should be escalated to legal or leadership?',
          ],
          role: 'execution oversight and escalation layer for the program',
        },
      },
    },
    options: [
      { key: 'workflow', label: '[1] How this fits in the workflow' },
      { key: 'decisions', label: '[2] What decisions this page supports' },
    ],
  },
  'enforcement.pipeline': {
    primary: {
      file: 'enforcement.pipeline.json',
      content: {
        id: 'enforcement.pipeline',
        represents: 'live action queue for external enforcement work',
        narrative:
          'This pipeline is the operational handoff from investigation into action. Each row is an active execution object: who is handling it, how urgent it is, and whether the case is progressing toward removal, closure, or escalation.',
        includes: ['vendor route', 'sla window', 'status and outcome', 'latest coordination'],
      },
    },
    views: {
      measures: {
        file: 'enforcement.pipeline.measures.json',
        content: {
          id: 'enforcement.pipeline.measures',
          narrative:
            'The table is designed to show response health at a glance. It tells the operator what is in motion, what is overdue, and which action paths are actually resolving threats.',
          columns: {
            enforcement_item: 'the case and action object currently being worked',
            vendor_route: 'which external partner or route owns the action',
            sla_window: 'how much time remains before the action becomes overdue',
            status_outcome: 'current execution state and latest outcome',
            latest_coordination: 'most recent handoff or partner update',
          },
        },
      },
      workflow: {
        file: 'enforcement.pipeline.workflow_context.json',
        content: {
          id: 'enforcement.pipeline.workflow_context',
          narrative:
            'This surface sits after investigation and before final reporting. It is where the program proves that identified threats are not only understood, but actively being worked toward closure.',
          role: 'tracks execution quality across vendors, registrars, and escalation paths',
          outcomes: ['removed', 'resolved', 'pending follow-up', 'escalated'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'enforcement.action_coordination_panel': {
    primary: {
      file: 'enforcement.action_coordination_panel.json',
      content: {
        id: 'enforcement.action_coordination_panel',
        represents: 'selected-action execution and update surface',
        narrative:
          'Once an enforcement item is selected, this panel becomes the active coordination workspace. It gives the operator the context needed to update status, log partner movement, and decide whether the action is progressing, stalled, or ready to escalate.',
        includes: ['selected action context', 'vendor and case metadata', 'status controls', 'coordination notes'],
      },
    },
    views: {
      measures: {
        file: 'enforcement.action_coordination_panel.measures.json',
        content: {
          id: 'enforcement.action_coordination_panel.measures',
          narrative:
            'This panel is designed for action management rather than trend reading. It condenses the selected enforcement item into the minimum set of facts and controls needed to manage execution cleanly.',
          shows: {
            action_context: 'the selected case, route, and latest execution state',
            metadata: 'vendor, channel, timing, and threat details',
            controls: 'status update controls for progressing the action',
            notes: 'running coordination log for vendor, registrar, or legal follow-up',
          },
        },
      },
      workflow: {
        file: 'enforcement.action_coordination_panel.workflow_context.json',
        content: {
          id: 'enforcement.action_coordination_panel.workflow_context',
          narrative:
            'This is the execution handoff surface inside enforcement. It is where the program manager or operator records whether the external response path is working and whether the case should continue, close, or escalate.',
          role: 'turns the pipeline row into an actively managed execution object',
          outcomes: ['continue vendor follow-up', 'confirm resolution', 'mark blocked', 'escalate for legal or leadership review'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'domains.page': {
    primary: {
      file: 'domains.explain.json',
      content: {
        id: 'domains.page',
        purpose: 'domain portfolio awareness and registrar operations surface',
        narrative: [
          'This page tracks the domain layer around the brand protection program: suspicious domains, managed portfolio assets, registrar posture, and linked case context.',
          'It exists because domain abuse work is not only about finding threats. It also depends on understanding registrar relationships, security controls, and how suspicious assets connect back to case activity.',
        ],
        supports: ['portfolio awareness', 'registrar operations', 'risk review', 'case linkage'],
      },
    },
    views: {
      workflow: {
        file: 'domains.workflow_context.json',
        content: {
          id: 'domains.workflow_context',
          narrative:
            'This page sits alongside queue, investigation, and enforcement as the domain-operations branch of the workflow. It helps the team connect suspicious domains and legitimate portfolio assets to the operational response path.',
          sequence: ['detect domain', 'assess controls and flags', 'link to cases', 'coordinate registrar action', 'continue monitoring or escalate'],
          branches: ['monitor', 'support enforcement', 'support legal escalation'],
          role: 'connects brand protection casework to domain management reality',
        },
      },
      decisions: {
        file: 'domains.decisions.json',
        content: {
          id: 'domains.decisions',
          narrative:
            'A program manager uses this page to decide which domains need closer monitoring, which assets are linked to active incidents, and whether registrar posture or domain controls create additional operational risk.',
          answers: [
            'Which domains are in active incident state?',
            'What security controls are missing or weak?',
            'Which assets are linked to open cases?',
            'Where should registrar follow-up happen next?',
          ],
          role: 'domain oversight and registrar coordination layer for the program',
        },
      },
    },
    options: [
      { key: 'workflow', label: '[1] How this fits in the workflow' },
      { key: 'decisions', label: '[2] What decisions this page supports' },
    ],
  },
  'domains.portfolio': {
    primary: {
      file: 'domains.portfolio.json',
      content: {
        id: 'domains.portfolio',
        represents: 'operational inventory of suspicious and managed domain assets',
        narrative:
          'This surface compresses the domain layer into a scan-first operational table. It shows which assets matter, what controls are in place, how risky they look, and whether they are linked to active investigation or response work.',
        includes: ['domain asset', 'security controls', 'risk posture', 'portfolio status', 'recent activity'],
      },
    },
    views: {
      measures: {
        file: 'domains.portfolio.measures.json',
        content: {
          id: 'domains.portfolio.measures',
          narrative:
            'Each row is a domain-level operating object. It is designed to let the team compare infrastructure posture and incident relevance without opening a deeper case view first.',
          columns: {
            domain_asset: 'the domain identity, registrar, and expiration context',
            security_controls: 'controls such as DNSSEC, lock, and privacy posture',
            risk_posture: 'current domain risk score and active flags',
            portfolio_status: 'whether the asset is active, monitored, in incident, or suspended',
            activity: 'latest portfolio or registrar movement tied to the asset',
          },
        },
      },
      workflow: {
        file: 'domains.portfolio.workflow_context.json',
        content: {
          id: 'domains.portfolio.workflow_context',
          narrative:
            'This table sits between detection and registrar follow-through. It helps the team decide which domains remain watch items, which ones support an active case, and which require registrar or enforcement attention.',
          role: 'turns domain signals into portfolio-aware operating decisions',
          outcomes: ['continue monitoring', 'link to case', 'support registrar action', 'escalate for stronger response'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'domains.domain_operations_panel': {
    primary: {
      file: 'domains.domain_operations_panel.json',
      content: {
        id: 'domains.domain_operations_panel',
        represents: 'selected-domain review and registrar follow-up surface',
        narrative:
          'Once a domain is selected, this panel becomes the active operating view for that asset. It combines domain context, linked-case relevance, risk posture, and registrar history so the team can decide what happens next.',
        includes: ['selected domain summary', 'metadata and controls', 'risk posture', 'linked cases', 'registrar action log'],
      },
    },
    views: {
      measures: {
        file: 'domains.domain_operations_panel.measures.json',
        content: {
          id: 'domains.domain_operations_panel.measures',
          narrative:
            'This panel is designed for asset-level judgment. It condenses the domain into the specific facts needed to decide whether to keep monitoring, support an active case, or push registrar action forward.',
          shows: {
            context: 'the selected asset, its registrar context, and current status',
            metadata: 'expiration, controls, linked case count, and latest action',
            risk_posture: 'where the asset sits on the risk scale and which flags are active',
            registrar_log: 'the working history of coordination and follow-up for the asset',
          },
        },
      },
      workflow: {
        file: 'domains.domain_operations_panel.workflow_context.json',
        content: {
          id: 'domains.domain_operations_panel.workflow_context',
          narrative:
            'This is the domain-operations handoff inside the workflow. It turns a row in the portfolio table into an actively managed asset, with the context needed to support enforcement, monitor registrar response, or prepare escalation.',
          role: 'bridges portfolio awareness and registrar execution',
          outcomes: ['continue monitoring', 'support linked casework', 'record registrar progress', 'escalate for stronger response'],
        },
      },
    },
    options: [
      { key: 'measures', label: '[1] What this measures' },
      { key: 'workflow', label: '[2] How this fits in the workflow' },
    ],
  },
  'workflow.meta': {
    primary: {
      file: 'workflow.meta.json',
      content: {
        id: 'workflow.meta',
        purpose: 'end-to-end operating model for off-platform brand protection',
        narrative: [
          'A suspicious domain starts outside the company when it is registered into the public domain system. Detection systems, vendor feeds, and AI-assisted models watch that ecosystem continuously for names, infrastructure, and behaviors that look likely to abuse Meta brands or user trust.',
          'Once a threat is detected, the system scores it, classifies it, and decides whether it should remain in monitoring, become active casework, or move toward enforcement. From there the work passes through queue, investigation, registrar or vendor execution, and finally into closure, reporting, and strategy tuning.',
        ],
        sequence: ['register', 'detect', 'score', 'queue', 'investigate', 'enforce', 'report'],
        branches: ['monitor', 'enforce_operationally', 'escalate_legally'],
      },
    },
    views: {
      pm_role: {
        file: 'workflow.meta.pm_role.json',
        content: {
          id: 'workflow.meta.pm_role',
          narrative:
            'A program manager in this role sits across the workflow rather than inside only one stage of it. They help shape detection priorities, keep triage and enforcement moving, coordinate with legal, security, integrity, registrars, and vendors, and make sure the program is operating coherently at scale.',
          owns: [
            'program strategy and prioritization',
            'cross-functional coordination',
            'vendor and registrar relationship oversight',
            'tracking enforcement performance and bottlenecks',
            'communicating trends and risk to stakeholders',
          ],
          role: 'connects operational signals to execution, escalation, and strategy',
        },
      },
      day_to_day: {
        file: 'workflow.meta.day_to_day.json',
        content: {
          id: 'workflow.meta.day_to_day',
          narrative:
            'Day to day, the work is a mix of queue review, escalation judgment, partner coordination, and reporting. The program manager is usually not doing deep technical forensics alone; they are making sure the right work is identified, routed, tracked, and explained to the right people.',
          likely_work: [
            'review new high-risk detections and case movement',
            'check whether investigations are ready for vendor or legal action',
            'follow up on overdue registrar or vendor workflows',
            'sync with legal, security, integrity, or business stakeholders',
            'identify trend shifts and prepare concise executive updates',
            'tune process, thresholds, and operating protocols over time',
          ],
          role: 'keeps the system moving and makes the workflow legible to the organization',
        },
      },
    },
    options: [
      { key: 'pm_role', label: '[1] Where the PM fits' },
      { key: 'day_to_day', label: '[2] What day to day looks like' },
    ],
  },
};

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

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function formatExplainerPrimitive(value) {
  if (typeof value === 'string') return [{ type: 'string', text: JSON.stringify(value) }];
  if (typeof value === 'number') return [{ type: 'number', text: String(value) }];
  if (typeof value === 'boolean') return [{ type: 'literal', text: value ? 'true' : 'false' }];
  if (value === null) return [{ type: 'literal', text: 'null' }];
  return [{ type: 'string', text: JSON.stringify(String(value)) }];
}

function formatExplainerLines(value, indent = 0) {
  if (Array.isArray(value)) {
    const lines = [{ indent, tokens: [{ type: 'punct', text: '[' }] }];

    value.forEach((item, index) => {
      const isLast = index === value.length - 1;
      if (Array.isArray(item) || isPlainObject(item)) {
        const nested = formatExplainerLines(item, indent + 1);
        if (!isLast) nested[nested.length - 1].tokens.push({ type: 'punct', text: ',' });
        lines.push(...nested);
      } else {
        lines.push({
          indent: indent + 1,
          tokens: [...formatExplainerPrimitive(item), ...(!isLast ? [{ type: 'punct', text: ',' }] : [])],
        });
      }
    });

    lines.push({ indent, tokens: [{ type: 'punct', text: ']' }] });
    return lines;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    const lines = [{ indent, tokens: [{ type: 'punct', text: '{' }] }];

    entries.forEach(([key, item], index) => {
      const isLast = index === entries.length - 1;
      const keyTokens = [
        { type: 'key', text: JSON.stringify(key) },
        { type: 'punct', text: ': ' },
      ];

      if (Array.isArray(item) || isPlainObject(item)) {
        const nested = formatExplainerLines(item, indent + 1);
        nested[0] = {
          indent: indent + 1,
          tokens: [...keyTokens, ...nested[0].tokens],
        };
        if (!isLast) nested[nested.length - 1].tokens.push({ type: 'punct', text: ',' });
        lines.push(...nested);
      } else {
        lines.push({
          indent: indent + 1,
          tokens: [...keyTokens, ...formatExplainerPrimitive(item), ...(!isLast ? [{ type: 'punct', text: ',' }] : [])],
        });
      }
    });

    lines.push({ indent, tokens: [{ type: 'punct', text: '}' }] });
    return lines;
  }

  return [{ indent, tokens: formatExplainerPrimitive(value) }];
}

function explainerLinesToText(lines) {
  return lines.map((line) => `${'  '.repeat(line.indent)}${line.tokens.map((token) => token.text).join('')}`).join('\n');
}

function renderExplainerLineMarkup(line, index) {
  const tokens = line.tokens
    .map((token) => `<span class="ss-code-token ss-code-token-${token.type}">${escapeHtml(token.text)}</span>`)
    .join('');

  return `
    <div class="ss-code-line">
      <span class="ss-code-line-number" aria-hidden="true">${index + 1}</span>
      <span class="ss-code-line-content" style="--ss-code-indent:${line.indent}">${tokens}</span>
    </div>
  `;
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
  if (status === 'Active') return 'low';
  if (status === 'Denied' || status === 'Suspended') return 'high';
  if (status === 'Enforcement' || status === 'In Progress' || status === 'Incident') return 'medium';
  if (status === 'Monitoring') return 'neutral';
  return 'case';
}

function createStatusChip(label, kind) {
  return `<span class="ss-status-chip ${kind || ''}">${escapeHtml(label)}</span>`;
}

function svgNode(name, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scrollToPanel(panelElement) {
  const target = panelElement?.closest('.ss-card') || panelElement;
  if (!target) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
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

function latestActivitySignal(note) {
  if (!note?.text) return 'No recent activity';
  const text = note.text.toLowerCase();
  if (text.includes('vendor')) return 'Vendor escalation';
  if (text.includes('closure confirmed') || text.includes('closure')) return 'Closure confirmed';
  if (text.includes('evidence')) return 'Evidence added';
  if (text.includes('awaiting')) return 'Awaiting review';
  if (text.includes('ticket')) return 'Ticket acknowledged';
  return note.text.length > 30 ? `${note.text.slice(0, 27)}...` : note.text;
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
    .map((row, index) => {
      const width = Math.round((row.value / max) * 100);
      const displayValue = row.display ?? row.value;
      const tone = row.tone || `tone-${index % 4}`;
      return `
        <article class="ss-bar-item ${escapeHtml(tone)}">
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
    const line = svgNode('line', {
      x1: 0,
      x2: width,
      y1: y,
      y2: y,
      stroke: i === lines ? 'rgba(143, 151, 181, 0.34)' : 'rgba(143, 151, 181, 0.16)',
      'stroke-width': 1,
    });
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

  const glowLine = svgNode('polyline', {
    points,
    fill: 'none',
    stroke: color,
    'stroke-width': 6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.14,
  });
  svg.appendChild(glowLine);

  const polyline = svgNode('polyline', {
    points,
    fill: 'none',
    stroke: color,
    'stroke-width': 2.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(polyline);

  const lastPoint = series[series.length - 1];
  if (!Number.isFinite(lastPoint)) return;
  const lastX = width;
  const lastY = height - lastPoint * height;
  const outer = svgNode('circle', {
    cx: lastX,
    cy: lastY,
    r: 5,
    fill: color,
    opacity: 0.18,
  });
  const inner = svgNode('circle', {
    cx: lastX,
    cy: lastY,
    r: 2.4,
    fill: color,
  });
  svg.appendChild(outer);
  svg.appendChild(inner);
}

function renderSimpleLineChart(svg, valuesA, valuesB) {
  if (!svg) return;
  svg.innerHTML = '';
  const width = 700;
  const height = 210;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const max = Math.max(1, ...valuesA, ...valuesB);
  const normalizedA = valuesA.map((value) => value / max);
  const normalizedB = valuesB.map((value) => value / max);

  const defs = svgNode('defs');
  const panelGlow = svgNode('linearGradient', {
    id: 'overview-chart-sheen',
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '100%',
  });
  panelGlow.appendChild(svgNode('stop', { offset: '0%', 'stop-color': 'rgba(136, 121, 255, 0.08)' }));
  panelGlow.appendChild(svgNode('stop', { offset: '70%', 'stop-color': 'rgba(121, 236, 225, 0.02)' }));
  panelGlow.appendChild(svgNode('stop', { offset: '100%', 'stop-color': 'rgba(255,255,255,0)' }));
  defs.appendChild(panelGlow);
  svg.appendChild(defs);

  const panel = svgNode('rect', {
    x: 0,
    y: 0,
    width,
    height,
    rx: 20,
    fill: 'url(#overview-chart-sheen)',
  });
  svg.appendChild(panel);

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

function syncVisibleSelection(items, selectedId, getId, assignSelection) {
  if (!items.length) return null;
  const current = items.find((item) => getId(item) === selectedId);
  if (current) return current;
  const fallback = items[0];
  assignSelection(getId(fallback));
  persistState(appState);
  return fallback;
}

function renderListMarkup(container, markup, fallback) {
  if (!container) return;
  container.innerHTML = markup || `<li>${escapeHtml(fallback)}</li>`;
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

const OVERVIEW_CHART_VIEWBOX = { width: 920, height: 360 };

function renderOverviewCompositeChart(svg, labels, domainSeries, caseSeries, resolvedSeries, options = {}) {
  if (!svg) return;

  const { activeBucket = null, highlightSeries = null } = options;
  svg.innerHTML = '';
  const { width, height } = OVERVIEW_CHART_VIEWBOX;
  const padding = { top: 20, right: 24, bottom: 52, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const chartBottom = padding.top + chartHeight;
  const count = Math.max(labels.length, 1);
  const slotWidth = chartWidth / count;
  const barWidth = Math.min(50, Math.max(18, slotWidth * 0.36));
  const maxValue = Math.max(1, ...domainSeries, ...caseSeries, ...resolvedSeries);
  const roundedMax = Math.max(4, Math.ceil(maxValue / 4) * 4);
  const chartTop = padding.top + 6;
  const chartUsableHeight = chartHeight - 10;

  const css = getComputedStyle(document.body);
  const domainsColor = css.getPropertyValue('--ss-color-accent-primary').trim() || '#a975ff';
  const casesColor = css.getPropertyValue('--ss-color-accent-secondary').trim() || '#79ece1';
  const resolvedColor = css.getPropertyValue('--ss-color-chart-lime').trim() || '#d7fb6a';
  const axisColor = 'rgba(157, 168, 197, 0.38)';
  const gridColor = 'rgba(157, 168, 197, 0.14)';
  const labelColor = 'rgba(191, 199, 224, 0.78)';
  const strongLabelColor = 'rgba(244, 247, 255, 0.92)';
  const trackColor = 'rgba(255,255,255,0.055)';
  const lastBandColor = 'rgba(255,255,255,0.035)';
  const activeBandColor = 'rgba(255,255,255,0.06)';
  const seriesOpacity = (key, active, muted) => (highlightSeries && highlightSeries !== key ? muted : active);
  const bucketData = [];

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const defs = svgNode('defs');

  const panelGlow = svgNode('linearGradient', {
    id: 'overview-hero-panel',
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '100%',
  });
  panelGlow.appendChild(svgNode('stop', { offset: '0%', 'stop-color': 'rgba(136, 121, 255, 0.08)' }));
  panelGlow.appendChild(svgNode('stop', { offset: '65%', 'stop-color': 'rgba(121, 236, 225, 0.03)' }));
  panelGlow.appendChild(svgNode('stop', { offset: '100%', 'stop-color': 'rgba(255,255,255,0)' }));

  const barFill = svgNode('linearGradient', {
    id: 'overview-hero-bars',
    x1: '0%',
    y1: '0%',
    x2: '0%',
    y2: '100%',
  });
  barFill.appendChild(svgNode('stop', { offset: '0%', 'stop-color': domainsColor, 'stop-opacity': '0.95' }));
  barFill.appendChild(svgNode('stop', { offset: '100%', 'stop-color': domainsColor, 'stop-opacity': '0.48' }));

  [
    { id: 'overview-hero-line-cases', color: casesColor },
    { id: 'overview-hero-line-resolved', color: resolvedColor },
  ].forEach(({ id, color }) => {
    const gradient = svgNode('linearGradient', {
      id,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    });
    gradient.appendChild(svgNode('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '0.66' }));
    gradient.appendChild(svgNode('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0.98' }));
    defs.appendChild(gradient);
  });

  defs.appendChild(panelGlow);
  defs.appendChild(barFill);
  svg.appendChild(defs);

  svg.appendChild(
    svgNode('rect', {
      x: 0,
      y: 0,
      width,
      height,
      rx: 20,
      fill: 'url(#overview-hero-panel)',
    })
  );

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  ticks.forEach((tick, index) => {
    const y = chartBottom - tick * chartUsableHeight;
    svg.appendChild(
      svgNode('line', {
        x1: padding.left,
        x2: width - padding.right,
        y1: y,
        y2: y,
        stroke: index === 0 ? axisColor : gridColor,
        'stroke-width': 1,
      })
    );
    const label = svgNode('text', {
      x: padding.left - 10,
      y: y + 3,
      fill: index === 0 ? strongLabelColor : labelColor,
      'font-size': 10.5,
      'text-anchor': 'end',
      'font-family': 'var(--ss-font-family-sans)',
    });
    label.textContent = String(Math.round(roundedMax * tick));
    svg.appendChild(label);
  });

  const bandIndex = Number.isInteger(activeBucket) ? activeBucket : count - 1;
  const lastBandX = padding.left + bandIndex * slotWidth;
  svg.appendChild(
    svgNode('rect', {
      x: lastBandX + slotWidth * 0.16,
      y: chartTop - 4,
      width: slotWidth * 0.68,
      height: chartUsableHeight + 10,
      rx: 18,
      fill: Number.isInteger(activeBucket) ? activeBandColor : lastBandColor,
    })
  );

  const pointSet = (series) =>
    series
      .map((value, index) => {
        const centerX = padding.left + index * slotWidth + slotWidth / 2;
        const normalized = roundedMax ? value / roundedMax : 0;
        const y = chartBottom - normalized * chartUsableHeight;
        return { x: centerX, y };
      });

  const linePath = (points) =>
    points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');

  domainSeries.forEach((value, index) => {
    const isActive = activeBucket === index;
    const centerX = padding.left + index * slotWidth + slotWidth / 2;
    const x = centerX - barWidth / 2;
    const normalized = roundedMax ? value / roundedMax : 0;
    const fillHeight = Math.max(value ? 18 : 0, normalized * chartUsableHeight);
    const y = chartBottom - fillHeight;

    svg.appendChild(
      svgNode('rect', {
        x,
        y: chartTop,
        width: barWidth,
        height: chartUsableHeight,
        rx: barWidth / 2,
        fill: trackColor,
        opacity: seriesOpacity('domains', 1, 0.34),
      })
    );

    if (fillHeight > 0) {
      svg.appendChild(
        svgNode('rect', {
          x,
          y,
          width: barWidth,
          height: fillHeight,
          rx: barWidth / 2,
          fill: 'url(#overview-hero-bars)',
          opacity: seriesOpacity('domains', isActive ? 1 : 0.96, 0.22),
        })
      );
    }

    const label = svgNode('text', {
      x: centerX,
      y: chartBottom + 24,
      fill: isActive ? strongLabelColor : labelColor,
      'font-size': 10,
      'text-anchor': 'middle',
      'font-family': 'var(--ss-font-family-sans)',
    });
    label.textContent = labels[index] || '';
    svg.appendChild(label);

    bucketData[index] = {
      index,
      label: labels[index] || '',
      x: centerX,
      barTop: y,
      domains: value,
      cases: caseSeries[index] || 0,
      resolved: resolvedSeries[index] || 0,
    };
  });

  [
    { key: 'cases', label: 'Cases', series: caseSeries, color: casesColor, stroke: 'url(#overview-hero-line-cases)' },
    { key: 'resolved', label: 'Resolved', series: resolvedSeries, color: resolvedColor, stroke: 'url(#overview-hero-line-resolved)' },
  ].forEach(({ label, series, color, stroke }) => {
    const points = pointSet(series);
    const pointsAttr = linePath(points);
    svg.appendChild(
      svgNode('polyline', {
        points: pointsAttr,
        fill: 'none',
        stroke: color,
        'stroke-width': 8,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: seriesOpacity(label.toLowerCase(), 0.12, 0.05),
      })
    );
    svg.appendChild(
      svgNode('polyline', {
        points: pointsAttr,
        fill: 'none',
        stroke,
        'stroke-width': 2.8,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: seriesOpacity(label.toLowerCase(), 1, 0.24),
      })
    );

    series.forEach((value, index) => {
      const point = points[index];
      const isLast = index === series.length - 1;
      const isActive = activeBucket === index;
      svg.appendChild(
        svgNode('circle', {
          cx: point.x,
          cy: point.y,
          r: isLast || isActive ? 7 : 5,
          fill: color,
          opacity: seriesOpacity(label.toLowerCase(), isLast || isActive ? 0.18 : 0.12, 0.08),
        })
      );
      svg.appendChild(
        svgNode('circle', {
          cx: point.x,
          cy: point.y,
          r: isLast || isActive ? 3 : 2.2,
          fill: color,
          opacity: seriesOpacity(label.toLowerCase(), 1, 0.28),
        })
      );

      bucketData[index][label.toLowerCase() === 'cases' ? 'casesY' : 'resolvedY'] = point.y;

      if (isLast) {
        const valueTagWidth = label === 'Resolved' ? 72 : 86;
        const tagX = clamp(point.x - valueTagWidth / 2, padding.left + 8, width - padding.right - valueTagWidth);
        const tagY = Math.max(chartTop - 2, point.y - 30);

        svg.appendChild(
          svgNode('rect', {
            x: tagX,
            y: tagY,
            width: valueTagWidth,
            height: 22,
            rx: 11,
            fill: 'rgba(12, 16, 28, 0.92)',
            stroke: color,
            'stroke-width': 1,
            opacity: 0.96,
          })
        );
        const valueText = svgNode('text', {
          x: tagX + valueTagWidth / 2,
          y: tagY + 14.5,
          fill: strongLabelColor,
          'font-size': 10.5,
          'text-anchor': 'middle',
          'font-family': 'var(--ss-font-family-sans)',
          'font-weight': 600,
        });
        valueText.textContent = `${label} ${series[series.length - 1]}`;
        svg.appendChild(valueText);
      }
    });
  });

  const axisLabel = svgNode('text', {
    x: padding.left - 32,
    y: chartTop - 6,
    fill: 'rgba(181, 189, 216, 0.58)',
    'font-size': 9.5,
    'text-anchor': 'start',
    'font-family': 'var(--ss-font-family-sans)',
    'letter-spacing': '0.06em',
  });
  axisLabel.textContent = 'count';
  svg.appendChild(axisLabel);

  bucketData.forEach((bucket, index) => {
    const hit = svgNode('rect', {
      x: padding.left + index * slotWidth,
      y: chartTop - 6,
      width: slotWidth,
      height: chartUsableHeight + 34,
      fill: 'transparent',
      'data-overview-bucket': index,
      tabindex: 0,
      'aria-label': `${bucket.label}: ${bucket.domains} domains flagged, ${bucket.cases} cases opened, ${bucket.resolved} actions resolved`,
    });
    svg.appendChild(hit);
    bucket.anchorY = Math.min(bucket.barTop, bucket.casesY ?? chartBottom, bucket.resolvedY ?? chartBottom);
  });

  return bucketData;
}

function overviewPage() {
  if (!q('overview-channel-bars')) return;

  const state = {
    range: 'all',
    activeBucket: null,
    highlightSeries: null,
    pinnedBucket: null,
    summaryTarget: { type: 'range' },
  };
  const rangeButtons = Array.from(document.querySelectorAll('[data-overview-range]'));
  const legendButtons = Array.from(document.querySelectorAll('[data-overview-series]'));
  const dayMs = 24 * 60 * 60 * 1000;
  const movementDeltas = q('overview-movement-deltas');
  const movementTooltip = q('overview-movement-tooltip');
  const chartStage = q('overview-chart-stage');
  const summaryTrigger = q('overview-summary-trigger');
  let movementModel = null;
  let summaryContext = null;
  let summaryPopover = null;

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

  function scopedDomains() {
    if (state.range === 'week') {
      return appState.domains.filter((domain) => domain.riskFlags.length && withinDays(domain.lastFlaggedAt, 7));
    }
    return appState.domains.filter((domain) => domain.riskFlags.length);
  }

  function bucketCount() {
    return state.range === 'week' ? 7 : 8;
  }

  function bucketSizeDays() {
    return state.range === 'week' ? 1 : 7;
  }

  function bucketLabels() {
    const count = bucketCount();
    const size = bucketSizeDays();
    return Array.from({ length: count }, (_, index) => {
      const offsetDays = (count - 1 - index) * size;
      const date = new Date(Date.now() - offsetDays * dayMs);
      return state.range === 'week'
        ? date.toLocaleDateString(undefined, { weekday: 'short' })
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
  }

  function bucketize(items, getIso) {
    const count = bucketCount();
    const size = bucketSizeDays();
    const values = Array.from({ length: count }, () => 0);
    const now = Date.now();

    items.forEach((item) => {
      const iso = getIso(item);
      if (!iso) return;
      const diffDays = Math.floor((now - parseDate(iso)) / dayMs);
      const bucket = count - 1 - Math.floor(diffDays / size);
      if (bucket >= 0 && bucket < count) values[bucket] += 1;
    });

    return values;
  }

  function periodSpanDays() {
    return bucketCount() * bucketSizeDays();
  }

  function countPreviousPeriod(items, getIso) {
    const span = periodSpanDays();
    const now = Date.now();
    return items.filter((item) => {
      const iso = getIso(item);
      if (!iso) return false;
      const diffDays = Math.floor((now - parseDate(iso)) / dayMs);
      return diffDays >= span && diffDays < span * 2;
    }).length;
  }

  function deltaMeta(current, previous) {
    const diff = current - previous;
    if (diff === 0) return 'Flat vs prior period';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff} vs prior period`;
  }

  function trendKind(current, previous) {
    if (current > previous) return 'medium';
    if (current < previous) return 'low';
    return 'neutral';
  }

  function renderMovementDeltas(stats) {
    if (!movementDeltas) return;
    movementDeltas.innerHTML = stats
      .map(
        (item) => `
          <article class="ss-overview-delta-card series-${escapeHtml(item.series)}">
            <span class="ss-overview-delta-label">${escapeHtml(item.label)}</span>
            <strong class="ss-overview-delta-value">${escapeHtml(String(item.current))}</strong>
          </article>
        `
      )
      .join('');
  }

  function initSummaryPopover() {
    if (!summaryTrigger) return null;
    const popover = document.createElement('div');
    popover.className = 'ss-explainer-popover ss-summary-console-popover';
    popover.id = 'ss-summary-console';
    popover.tabIndex = -1;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'false');
    popover.setAttribute('aria-label', 'Program Health summary');
    popover.innerHTML = `
      <div class="ss-explainer-popover-head">
        <div class="ss-explainer-window-meta">
          <span class="ss-explainer-lang">json</span>
          <strong class="ss-explainer-file" data-summary-file>program_health.summary</strong>
        </div>
        <span class="ss-explainer-head-mark" aria-hidden="true">{ }</span>
      </div>
      <div class="ss-explainer-popover-screen">
        <div class="ss-explainer-code" data-summary-code aria-live="polite" aria-atomic="true"></div>
      </div>
    `;
    document.body.appendChild(popover);
    summaryTrigger.setAttribute('aria-expanded', 'false');
    summaryTrigger.setAttribute('aria-controls', 'ss-summary-console');
    return popover;
  }

  function positionSummaryPopover(trigger) {
    if (!summaryPopover || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const surface = trigger.closest('.ss-overview-hero-card') || trigger.closest('.ss-overview-chart-panel');
    const surfaceRect = surface?.getBoundingClientRect();
    const horizontalPreferred = rect.right + 12;
    const popoverWidth = Math.min(summaryPopover.offsetWidth || 348, window.innerWidth - 24);
    const popoverHeight = Math.min(summaryPopover.offsetHeight || 260, window.innerHeight - 24);
    const preferredLeft = horizontalPreferred + popoverWidth > window.innerWidth
      ? rect.left - (popoverWidth + 12)
      : horizontalPreferred;
    const maxLeft = Math.max(12, window.innerWidth - popoverWidth - 12);
    const left = clamp(preferredLeft, 12, maxLeft);
    const maxTop = Math.max(12, window.innerHeight - popoverHeight - 12);
    const preferredTop = surfaceRect ? surfaceRect.top + 10 : rect.top - 2;
    const top = Math.min(maxTop, Math.max(12, preferredTop));
    summaryPopover.style.left = `${left}px`;
    summaryPopover.style.top = `${top}px`;
  }

  function renderSummaryPopover() {
    if (!summaryPopover || !summaryContext) return;
    const codeEl = summaryPopover.querySelector('[data-summary-code]');
    const fileEl = summaryPopover.querySelector('[data-summary-file]');
    if (!codeEl) return;
    if (fileEl) {
      fileEl.textContent = summaryContext.bucket ? 'program_health.bucket' : 'program_health.summary';
    }
    const lines = formatExplainerLines(summaryContext);
    codeEl.innerHTML = lines.map((line, index) => renderExplainerLineMarkup(line, index)).join('');
    codeEl.setAttribute('aria-label', explainerLinesToText(lines));
    positionSummaryPopover(summaryTrigger);
  }

  function openSummaryPopover() {
    if (!summaryPopover || !summaryContext || !summaryTrigger) return;
    renderSummaryPopover();
    summaryPopover.classList.add('is-open');
    summaryTrigger.setAttribute('aria-expanded', 'true');
    summaryTrigger.classList.add('is-active');
    summaryPopover.focus();
  }

  function closeSummaryPopover() {
    if (!summaryPopover || !summaryTrigger) return;
    summaryPopover.classList.remove('is-open');
    summaryTrigger.setAttribute('aria-expanded', 'false');
    summaryTrigger.classList.remove('is-active');
  }

  function rangeSummaryContext({ periodFlagged, periodCases, periodResolved, balanceSummary, topChannel, topThreat }) {
    return {
      window: state.range === 'week' ? 'current 7-day window' : 'current activity window',
      summary: `${periodFlagged} assets entered the workflow, ${periodCases} converted into cases, and ${periodResolved} actions closed.`,
      implication: balanceSummary,
      focus: `${topChannel} is the strongest current intake source while ${topThreat.toLowerCase()} remains the dominant threat pattern.`,
    };
  }

  function bucketSummaryContext(bucket) {
    const balance =
      bucket.resolved >= bucket.domains
        ? 'This bucket shows closures keeping pace with intake.'
        : bucket.resolved >= bucket.cases
          ? 'This bucket shows closures holding against case conversion while intake remains ahead.'
          : 'This bucket shows conversion outpacing closures, so local workflow pressure is building.';

    return {
      bucket: `${bucket.label} · ${state.range === 'week' ? '7-day view' : 'activity view'}`,
      domains_flagged: bucket.domains,
      cases_opened: bucket.cases,
      actions_resolved: bucket.resolved,
      implication: balance,
    };
  }

  function syncLegendState() {
    legendButtons.forEach((button) => {
      const key = button.dataset.overviewSeries;
      button.classList.toggle('is-active', state.highlightSeries === key);
      button.classList.toggle('is-dimmed', Boolean(state.highlightSeries) && state.highlightSeries !== key);
    });
  }

  function hideMovementTooltip() {
    if (!movementTooltip) return;
    movementTooltip.hidden = true;
    movementTooltip.innerHTML = '';
  }

  function renderMovementTooltip(bucket) {
    if (!movementTooltip || !chartStage || !bucket) return;
    movementTooltip.innerHTML = `
      <p class="ss-overview-tooltip-label">${escapeHtml(bucket.label)}</p>
      <div class="ss-overview-tooltip-grid">
        <div class="ss-overview-tooltip-row series-domains">
          <span class="ss-overview-tooltip-key">Domains Flagged</span>
          <span class="ss-overview-tooltip-value">${escapeHtml(String(bucket.domains))}</span>
        </div>
        <div class="ss-overview-tooltip-row series-cases">
          <span class="ss-overview-tooltip-key">Cases Opened</span>
          <span class="ss-overview-tooltip-value">${escapeHtml(String(bucket.cases))}</span>
        </div>
        <div class="ss-overview-tooltip-row series-resolved">
          <span class="ss-overview-tooltip-key">Actions Resolved</span>
          <span class="ss-overview-tooltip-value">${escapeHtml(String(bucket.resolved))}</span>
        </div>
      </div>
    `;
    movementTooltip.hidden = false;

    const stageRect = chartStage.getBoundingClientRect();
    const tooltipWidth = movementTooltip.offsetWidth;
    const tooltipHeight = movementTooltip.offsetHeight;
    const xRatio = stageRect.width / OVERVIEW_CHART_VIEWBOX.width;
    const yRatio = stageRect.height / OVERVIEW_CHART_VIEWBOX.height;
    const targetLeft = bucket.x * xRatio;
    const targetTop = bucket.anchorY * yRatio;
    const left = clamp(targetLeft, tooltipWidth / 2 + 10, stageRect.width - tooltipWidth / 2 - 10);
    const top = clamp(targetTop - tooltipHeight - 14, 8, stageRect.height - tooltipHeight - 8);
    movementTooltip.style.left = `${left}px`;
    movementTooltip.style.top = `${top}px`;
  }

  function renderMovementChart() {
    if (!movementModel) return;
    const buckets = renderOverviewCompositeChart(
      q('overview-volume-line'),
      movementModel.labels,
      movementModel.domainSeries,
      movementModel.caseSeries,
      movementModel.resolvedSeries,
      { activeBucket: state.activeBucket, highlightSeries: state.highlightSeries }
    );

    const svg = q('overview-volume-line');
    if (svg) {
      Array.from(svg.querySelectorAll('[data-overview-bucket]')).forEach((node) => {
        const index = Number(node.getAttribute('data-overview-bucket'));
        const activate = () => {
          state.activeBucket = index;
          renderMovementChart();
        };
        const deactivate = () => {
          if (state.activeBucket === index) {
            state.activeBucket = Number.isInteger(state.pinnedBucket) ? state.pinnedBucket : null;
            renderMovementChart();
          }
        };
        const selectBucket = (event) => {
          event.preventDefault();
          event.stopPropagation();
          state.pinnedBucket = index;
          state.activeBucket = index;
          state.summaryTarget = { type: 'bucket', index };
          render();
          openSummaryPopover();
        };
        node.addEventListener('mouseenter', activate);
        node.addEventListener('focus', activate);
        node.addEventListener('mouseleave', deactivate);
        node.addEventListener('blur', deactivate);
        node.addEventListener('click', selectBucket);
        node.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') selectBucket(event);
        });
      });
    }

    syncLegendState();

    if (Number.isInteger(state.activeBucket) && buckets[state.activeBucket]) {
      renderMovementTooltip(buckets[state.activeBucket]);
    } else {
      hideMovementTooltip();
    }
  }

  function render() {
    const cases = scopedCases();
    const actions = scopedActions();
    const domains = scopedDomains();

    const openCases = cases.filter((caseItem) => caseItem.status !== 'Closed').length;
    const highPriority = cases.filter((caseItem) => (caseItem.priority === 'High' || caseItem.priority === 'Critical') && caseItem.status !== 'Closed').length;
    const domainsFlagged = domains.length;
    const breaches = actions.filter((action) => actionSlaMeta(action).breach).length;
    const dueSoon = actions.filter((action) => {
      if (action.status === 'Resolved' || action.status === 'Denied') return false;
      const hoursLeft = hoursBetween(nowIso(), action.dueAt);
      return Number.isFinite(hoursLeft) && hoursLeft >= 0 && hoursLeft < 12;
    }).length;

    const avgTriage = average(cases.map((caseItem) => hoursBetween(caseItem.createdAt, caseItem.triagedAt)));
    const avgClose = average(cases.map((caseItem) => hoursBetween(caseItem.createdAt, caseItem.closedAt)));

    if (q('overview-kpi-open')) {
      q('overview-kpi-open').textContent = String(openCases);
      q('overview-kpi-high').textContent = String(highPriority);
      q('overview-kpi-domains').textContent = String(domainsFlagged);
      q('overview-kpi-breaches').textContent = String(breaches);
      q('overview-kpi-triage').textContent = fmtHours(avgTriage || 0);
      q('overview-kpi-close').textContent = fmtHours(avgClose || 0);
    }

    const totalCases = Math.max(1, cases.length);
    const channelTones = {
      Domain: 'tone-0',
      Marketplace: 'tone-1',
      'Paid Search': 'tone-2',
      App: 'tone-3',
      Social: 'tone-1',
    };
    const typeTones = {
      Impersonation: 'tone-0',
      Phishing: 'tone-1',
      Counterfeit: 'tone-2',
      Scam: 'tone-3',
      'Policy Abuse': 'tone-0',
    };

    const channelRows = countBy(cases, (caseItem) => caseItem.channel)
      .sort((a, b) => b.value - a.value)
      .map((row) => ({
        ...row,
        display: `${row.value} · ${fmtPct((row.value / totalCases) * 100)}`,
        tone: channelTones[row.label] || 'tone-0',
      }));

    const typeRows = countBy(cases, (caseItem) => caseItem.threatType)
      .sort((a, b) => b.value - a.value)
      .map((row) => ({
        ...row,
        display: `${row.value} · ${fmtPct((row.value / totalCases) * 100)}`,
        tone: typeTones[row.label] || 'tone-1',
      }));

    renderBarList(q('overview-channel-bars'), channelRows.length ? channelRows : [{ label: 'No data', value: 0, tone: 'tone-0' }]);
    renderBarList(q('overview-type-bars'), typeRows.length ? typeRows : [{ label: 'No data', value: 0, tone: 'tone-1' }]);

    const topChannel = channelRows[0]?.label || 'Unavailable';
    const topThreat = typeRows[0]?.label || 'Unavailable';

    const labels = bucketLabels();
    const domainSeries = bucketize(domains, (domain) => domain.lastFlaggedAt);
    const caseSeries = bucketize(cases, (caseItem) => caseItem.createdAt);
    const resolvedSeries = bucketize(actions.filter((action) => action.resolvedAt), (action) => action.resolvedAt);
    movementModel = { labels, domainSeries, caseSeries, resolvedSeries };

    const periodFlagged = domainSeries.reduce((total, value) => total + value, 0);
    const periodCases = caseSeries.reduce((total, value) => total + value, 0);
    const periodResolved = resolvedSeries.reduce((total, value) => total + value, 0);

    const previousFlagged = countPreviousPeriod(appState.domains.filter((domain) => domain.riskFlags.length), (domain) => domain.lastFlaggedAt);
    const previousCases = countPreviousPeriod(appState.cases, (caseItem) => caseItem.createdAt);
    const previousResolved = countPreviousPeriod(appState.enforcementActions.filter((action) => action.resolvedAt), (action) => action.resolvedAt);
    const caseConversionRate = periodFlagged ? Math.round((periodCases / periodFlagged) * 100) : 0;
    const responseGap = periodResolved - periodCases;

    const balanceSummary =
      periodResolved >= periodFlagged
        ? 'Resolution throughput is currently keeping pace with intake.'
        : periodResolved >= periodCases
          ? 'Resolution is holding against case conversion, but flagged intake is still ahead.'
          : 'Incoming pressure is outpacing resolved action volume.';

    const bucketContext =
      state.summaryTarget?.type === 'bucket' && Number.isInteger(state.summaryTarget.index)
        ? {
            label: labels[state.summaryTarget.index] || '',
            domains: domainSeries[state.summaryTarget.index] || 0,
            cases: caseSeries[state.summaryTarget.index] || 0,
            resolved: resolvedSeries[state.summaryTarget.index] || 0,
          }
        : null;

    summaryContext = bucketContext
      ? bucketSummaryContext(bucketContext)
      : rangeSummaryContext({ periodFlagged, periodCases, periodResolved, balanceSummary, topChannel, topThreat });
    if (summaryPopover?.classList.contains('is-open')) renderSummaryPopover();
    renderMovementDeltas([
      { label: 'Domains Flagged', current: periodFlagged, previous: previousFlagged, series: 'domains' },
      { label: 'Cases Opened', current: periodCases, previous: previousCases, series: 'cases' },
      { label: 'Actions Resolved', current: periodResolved, previous: previousResolved, series: 'resolved' },
    ]);

    renderListMarkup(
      q('overview-watchlist'),
      [
        {
          title: 'Threat intake',
          chips: [
            createStatusChip(`${periodFlagged} flagged`, periodFlagged ? 'case' : 'neutral'),
            createStatusChip(deltaMeta(periodFlagged, previousFlagged), trendKind(periodFlagged, previousFlagged)),
          ],
          meta: `${topChannel} is carrying the most new off-platform pressure in the current window.`,
        },
        {
          title: 'Case conversion',
          chips: [
            createStatusChip(`${periodCases} opened`, periodCases ? 'medium' : 'neutral'),
            createStatusChip(`${caseConversionRate}% converted`, caseConversionRate >= 60 ? 'high' : caseConversionRate >= 30 ? 'medium' : 'neutral'),
          ],
          meta: `${periodCases} of ${periodFlagged || 0} flagged assets advanced into formal casework. ${highPriority} still require high-priority handling.`,
        },
        {
          title: 'Response balance',
          chips: [
            createStatusChip(`${periodResolved} resolved`, periodResolved ? 'low' : 'neutral'),
            createStatusChip(`${breaches} overdue`, breaches ? 'high' : 'neutral'),
          ],
          meta:
            responseGap >= 0
              ? `Resolved action is keeping pace with case creation. ${breaches ? 'Vendor-owned overdue work still needs follow-up.' : 'No vendor backlog spike is in scope.'}`
              : `Case creation is outpacing closures by ${Math.abs(responseGap)}. ${breaches ? 'Vendor-owned overdue work is adding pressure.' : 'Execution follow-up is the main constraint.'}`,
        },
      ]
        .map(
          (item) => `
            <li>
              <div class="ss-chip-row ss-chip-row-compact">${item.chips.join('')}</div>
              <p class="ss-list-copy">${escapeHtml(item.title)}</p>
              <span class="ss-list-meta">${escapeHtml(item.meta)}</span>
            </li>
          `
        )
        .join(''),
      'No executive watchlist items in scope.'
    );

    renderMovementChart();
  }

  legendButtons.forEach((button) => {
    const key = button.dataset.overviewSeries;
    button.addEventListener('mouseenter', () => {
      state.highlightSeries = key;
      renderMovementChart();
    });
    button.addEventListener('focus', () => {
      state.highlightSeries = key;
      renderMovementChart();
    });
    button.addEventListener('mouseleave', () => {
      state.highlightSeries = null;
      renderMovementChart();
    });
    button.addEventListener('blur', () => {
      state.highlightSeries = null;
      renderMovementChart();
    });
  });

  summaryPopover = initSummaryPopover();
  summaryTrigger?.addEventListener('click', () => {
    if (summaryPopover?.classList.contains('is-open')) {
      closeSummaryPopover();
      return;
    }
    openSummaryPopover();
  });

  rangeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.range = button.dataset.overviewRange;
      state.activeBucket = null;
      state.pinnedBucket = null;
      state.highlightSeries = null;
      state.summaryTarget = { type: 'range' };
      rangeButtons.forEach((entry) => entry.classList.toggle('is-active', entry === button));
      render();
      openSummaryPopover();
    });
  });

  document.addEventListener('click', (event) => {
    if (!summaryPopover?.classList.contains('is-open')) return;
    if (
      event.target.closest('#overview-summary-trigger') ||
      event.target.closest('#ss-summary-console') ||
      event.target.closest('[data-overview-range]') ||
      event.target.closest('[data-overview-bucket]')
    ) {
      return;
    }
    closeSummaryPopover();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && summaryPopover?.classList.contains('is-open')) closeSummaryPopover();
  });

  window.addEventListener('resize', () => {
    if (summaryPopover?.classList.contains('is-open')) positionSummaryPopover(summaryTrigger);
  });

  window.addEventListener(
    'scroll',
    () => {
      if (summaryPopover?.classList.contains('is-open')) positionSummaryPopover(summaryTrigger);
    },
    { passive: true }
  );

  render();
}

function queuePage() {
  if (!q('queue-rows')) return;

  const state = {
    query: '',
    channel: 'all',
    threat: 'all',
    status: 'all',
    sortBy: 'risk',
    sortDir: 'desc',
    page: 1,
    pageSize: 5,
  };

  const rowsEl = q('queue-rows');
  const summary = q('queue-summary');
  const search = q('queue-search');
  const channelFilter = q('queue-channel-filter');
  const threatFilter = q('queue-threat-filter');
  const statusFilter = q('queue-status-filter');
  const sortButtons = Array.from(document.querySelectorAll('[data-queue-sort]'));
  const pageButtons = q('queue-page-buttons');
  const pageMeta = q('queue-page-meta');
  const pageSizeSelect = q('queue-page-size');

  const kpiTotal = q('queue-kpi-total');
  const kpiCritical = q('queue-kpi-critical');
  const kpiNew = q('queue-kpi-new');

  const empty = q('queue-selected-empty');
  const panel = q('queue-selected-panel');
  const kv = q('queue-kv-grid');
  const detailId = q('queue-detail-id');
  const detailTitle = q('queue-detail-title');
  const detailSummary = q('queue-detail-summary');
  const detailChips = q('queue-detail-chips');
  const detailAi = q('queue-detail-ai');
  const notes = q('queue-notes');
  const statusSelect = q('queue-status-select');
  const ownerInput = q('queue-owner-input');
  const noteInput = q('queue-note-input');
  const stateMsg = q('queue-state');
  const openLink = q('queue-open-case');
  const statusRank = { New: 0, Triaged: 1, Investigating: 2, Enforcement: 3, Closed: 4 };

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

  function defaultSortDirection(sortBy) {
    return sortBy === 'title' || sortBy === 'owner' ? 'asc' : 'desc';
  }

  function sortValue(caseItem, sortBy) {
    if (sortBy === 'title') return caseItem.title.toLowerCase();
    if (sortBy === 'owner') return caseItem.owner.toLowerCase();
    if (sortBy === 'updated') return parseDate(caseItem.updatedAt || caseItem.createdAt);
    if (sortBy === 'status') return statusRank[caseItem.status] ?? 0;
    if (sortBy === 'risk') return Number(caseItem.riskScore || 0);
    return parseDate(caseItem.createdAt);
  }

  function compareCases(a, b) {
    const aValue = sortValue(a, state.sortBy);
    const bValue = sortValue(b, state.sortBy);
    let comparison = 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue - bValue;
    }

    if (comparison === 0) {
      comparison = Number(b.riskScore || 0) - Number(a.riskScore || 0);
      if (comparison === 0) comparison = parseDate(b.createdAt) - parseDate(a.createdAt);
    }

    return state.sortDir === 'asc' ? comparison : comparison * -1;
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

    if (pageSizeSelect) {
      pageSizeSelect.value = String(state.pageSize);
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
      .sort(compareCases);
  }

  function updateSortUi() {
    sortButtons.forEach((button) => {
      const active = button.dataset.queueSort === state.sortBy;
      button.classList.toggle('is-active', active);
      const arrow = button.querySelector('.ss-th-arrow');
      if (arrow) arrow.textContent = active ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕';
      const th = button.closest('th');
      if (th) th.setAttribute('aria-sort', active ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
    });
  }

  function pageRows(rows) {
    const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const startIndex = (state.page - 1) * state.pageSize;
    return rows.slice(startIndex, startIndex + state.pageSize);
  }

  function linkedDomainLabel(caseItem) {
    if (!caseItem.linkedDomainId) return 'No linked domain';
    return getDomainById(caseItem.linkedDomainId)?.domainName || 'Linked domain unavailable';
  }

  function renderPagination(totalRows) {
    if (!pageButtons || !pageMeta) return;

    if (!totalRows) {
      pageMeta.textContent = 'No queue records in the current filter.';
      pageButtons.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalRows / state.pageSize));
    const start = (state.page - 1) * state.pageSize + 1;
    const end = Math.min(totalRows, state.page * state.pageSize);
    pageMeta.textContent = `Showing ${start}-${end} of ${totalRows} ranked cases`;

    if (totalPages === 1) {
      pageButtons.innerHTML = '';
      return;
    }

    const buttons = [
      `<button class="ss-page-btn" type="button" data-queue-page="${Math.max(1, state.page - 1)}" ${state.page === 1 ? 'disabled' : ''} aria-label="Previous page">‹</button>`,
    ];

    for (let page = 1; page <= totalPages; page += 1) {
      buttons.push(
        `<button class="ss-page-btn ${page === state.page ? 'is-active' : ''}" type="button" data-queue-page="${page}" aria-label="Page ${page}">${page}</button>`
      );
    }

    buttons.push(
      `<button class="ss-page-btn" type="button" data-queue-page="${Math.min(totalPages, state.page + 1)}" ${state.page === totalPages ? 'disabled' : ''} aria-label="Next page">›</button>`
    );

    pageButtons.innerHTML = buttons.join('');
    pageButtons.querySelectorAll('[data-queue-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextPage = Number(button.dataset.queuePage);
        if (!nextPage || nextPage === state.page) return;
        state.page = nextPage;
        renderTable();
      });
    });
  }

  function renderSelected(caseItem, emptyMessage = 'Select a case row to edit status, owner, notes, and priority.') {
    if (!caseItem) {
      empty.textContent = emptyMessage;
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      if (detailId) detailId.textContent = '';
      if (detailTitle) detailTitle.textContent = '';
      if (detailSummary) detailSummary.textContent = '';
      if (detailChips) detailChips.innerHTML = '';
      if (detailAi) detailAi.textContent = '';
      if (openLink) openLink.href = './charts.html';
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    const linkedDomain = linkedDomainLabel(caseItem);
    const evidenceCount = caseEvidence(caseItem.id).length;
    const actionCount = caseActions(caseItem.id).length;

    if (detailId) detailId.textContent = caseItem.id;
    if (detailTitle) detailTitle.textContent = caseItem.title;
    if (detailSummary) detailSummary.textContent = caseItem.summary;
    if (detailChips) {
      detailChips.innerHTML = [
        createStatusChip(caseItem.channel, 'neutral'),
        createStatusChip(caseItem.threatType, 'case'),
        createStatusChip(`Risk ${caseItem.riskScore}`, riskClass(caseItem.riskScore)),
        createStatusChip(caseItem.priority, priorityClass(caseItem.priority)),
        createStatusChip(caseItem.status, statusClass(caseItem.status)),
      ].join('');
    }
    if (detailAi) detailAi.textContent = caseItem.aiSuggestedAction || suggestedActionForCase(caseItem);

    renderKvGrid(kv, [
      { label: 'Linked Domain', value: linkedDomain },
      { label: 'Owner', value: caseItem.owner },
      { label: 'Created', value: fmtDateTime(caseItem.createdAt) },
      { label: 'Last Update', value: fmtDateTime(caseItem.updatedAt || caseItem.createdAt) },
      { label: 'Evidence Items', value: String(evidenceCount) },
      { label: 'Open Actions', value: String(actionCount) },
    ]);

    renderListMarkup(
      notes,
      caseItem.notes
        .slice(0, 8)
        .map((entry) => `<li><strong>${escapeHtml(entry.author)}</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.createdAt))}</span></li>`)
        .join(''),
      'No notes recorded for this case yet.'
    );

    statusSelect.value = caseItem.status;
    ownerInput.value = caseItem.owner;
    if (openLink) openLink.href = `./charts.html?case=${encodeURIComponent(caseItem.id)}`;
  }

  function renderTable() {
    const rows = filteredCases();
    const visibleRows = pageRows(rows);
    const visibleCase = syncVisibleSelection(
      visibleRows,
      appState.selectedCaseId,
      (caseItem) => caseItem.id,
      (caseId) => {
        appState.selectedCaseId = caseId;
      }
    );

    kpiTotal.textContent = String(rows.length);
    kpiCritical.textContent = String(rows.filter((caseItem) => caseItem.priority === 'Critical').length);
    kpiNew.textContent = String(rows.filter((caseItem) => caseItem.status === 'New').length);

    const openCount = rows.filter((caseItem) => caseItem.status !== 'Closed').length;
    const domainLinkedCount = rows.filter((caseItem) => caseItem.linkedDomainId).length;
    summary.textContent = `${openCount} open · ${domainLinkedCount} linked to domains · sorted ${state.sortBy === 'updated' ? 'by recency' : `by ${state.sortBy}`}`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="5">No cases match active filters.</td></tr>';
      renderPagination(0);
      updateSortUi();
      renderSelected(null, 'No cases match active filters. Adjust filters to continue working the queue.');
      return;
    }

    visibleRows.forEach((caseItem) => {
      const latestNote = caseItem.notes[0];
      const row = document.createElement('tr');
      if (appState.selectedCaseId === caseItem.id) row.classList.add('is-selected');
      row.innerHTML = `
        <td>
          <div class="ss-case-cell">
            <span class="ss-case-id">${escapeHtml(caseItem.id)}</span>
            <strong class="ss-case-title">${escapeHtml(caseItem.title)}</strong>
          </div>
        </td>
        <td>
          <div class="ss-signal-stack">
            <div class="ss-chip-row ss-chip-row-compact">
              ${createStatusChip(caseItem.channel, 'neutral')}
              ${createStatusChip(caseItem.threatType, 'case')}
            </div>
            <p class="ss-cell-meta">${escapeHtml(linkedDomainLabel(caseItem))}</p>
            <p class="ss-cell-meta">Created ${escapeHtml(fmtDate(caseItem.createdAt))}</p>
          </div>
        </td>
        <td>
          <div class="ss-risk-stack">
            ${createStatusChip(`Risk ${caseItem.riskScore}`, riskClass(caseItem.riskScore))}
            <div class="ss-progress ss-progress-micro" style="--progress:${Math.max(0, Math.min(100, caseItem.riskScore))}%"><span></span></div>
            <div class="ss-chip-row ss-chip-row-compact">
              ${createStatusChip(caseItem.priority, priorityClass(caseItem.priority))}
              ${createStatusChip(caseItem.status, statusClass(caseItem.status))}
            </div>
          </div>
        </td>
        <td>
          <div class="ss-owner-cell">
            <strong>${escapeHtml(caseItem.owner)}</strong>
          </div>
        </td>
        <td>
          <div class="ss-note-preview">
            <strong>${escapeHtml(latestActivitySignal(latestNote))}</strong>
            <p>${escapeHtml(fmtDate(latestNote?.createdAt || caseItem.updatedAt || caseItem.createdAt))}</p>
          </div>
        </td>
      `;
      row.addEventListener('click', () => {
        appState.selectedCaseId = caseItem.id;
        persistState(appState);
        render();
        scrollToPanel(panel);
      });
      rowsEl.appendChild(row);
    });

    renderPagination(rows.length);
    updateSortUi();
    renderSelected(visibleCase);
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
    state.page = 1;
    renderTable();
  });

  channelFilter?.addEventListener('change', (event) => {
    state.channel = event.target.value;
    state.page = 1;
    renderTable();
  });

  threatFilter?.addEventListener('change', (event) => {
    state.threat = event.target.value;
    state.page = 1;
    renderTable();
  });

  statusFilter?.addEventListener('change', (event) => {
    state.status = event.target.value;
    state.page = 1;
    renderTable();
  });

  sortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sortBy = button.dataset.queueSort;
      if (!sortBy) return;
      if (state.sortBy === sortBy) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = sortBy;
        state.sortDir = defaultSortDirection(sortBy);
      }
      state.page = 1;
      renderTable();
    });
  });

  pageSizeSelect?.addEventListener('change', (event) => {
    state.pageSize = Number(event.target.value) || 5;
    state.page = 1;
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
  const boardSummary = q('investigation-board-summary');
  const signalEmpty = q('investigation-signal-empty');
  const signalBars = q('investigation-signal-bars');
  const trendChart = q('investigation-trend-chart');
  const modeButtons = Array.from(document.querySelectorAll('[data-investigation-mode]'));
  const rangeButtons = Array.from(document.querySelectorAll('[data-investigation-range]'));

  const caseGrid = q('investigation-case-grid');
  const assetGrid = q('investigation-asset-grid');
  const evidenceList = q('investigation-evidence');
  const timeline = q('investigation-timeline');
  const enforcementLog = q('investigation-enforcement-log');

  const aiSummary = q('investigation-ai-summary');
  const aiCategory = q('investigation-ai-category');
  const aiAction = q('investigation-ai-action');
  const state = {
    mode: 'all',
    range: 'full',
  };

  function buildSelect() {
    select.innerHTML = appState.cases
      .slice()
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((caseItem) => `<option value="${escapeHtml(caseItem.id)}">${escapeHtml(caseItem.id)} · ${escapeHtml(caseItem.title)}</option>`)
      .join('');
  }

  function shortDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function investigationPoints(caseItem) {
    const evidence = caseEvidence(caseItem.id).slice().sort((a, b) => parseDate(a.capturedAt) - parseDate(b.capturedAt));
    const actions = caseActions(caseItem.id).slice().sort((a, b) => parseDate(a.requestedAt) - parseDate(b.requestedAt));
    const timestamps = [
      { timestamp: caseItem.createdAt, stage: 'Detected' },
      { timestamp: caseItem.triagedAt || addHours(caseItem.createdAt, 8), stage: 'Triaged' },
      { timestamp: evidence[0]?.capturedAt || addHours(caseItem.createdAt, 18), stage: 'Evidence' },
      { timestamp: evidence[1]?.capturedAt || addHours(caseItem.createdAt, 30), stage: 'Review' },
      { timestamp: actions[0]?.requestedAt || caseItem.updatedAt, stage: 'Action' },
      { timestamp: caseItem.updatedAt || caseItem.createdAt, stage: 'Current' },
    ]
      .filter((entry) => entry.timestamp)
      .sort((a, b) => parseDate(a.timestamp) - parseDate(b.timestamp));

    const deduped = timestamps.filter((entry, index, list) => index === 0 || entry.timestamp !== list[index - 1].timestamp || entry.stage !== list[index - 1].stage);

    let points = deduped;
    if (state.range === 'response') points = deduped.slice(-4);
    if (state.range === 'focus') points = deduped.slice(-3);

    return points.map((point, index, list) => {
      const progress = list.length === 1 ? 1 : index / (list.length - 1);
      const evidenceSeen = evidence.filter((item) => parseDate(item.capturedAt) <= parseDate(point.timestamp)).length;
      const actionsSeen = actions.filter((item) => parseDate(item.requestedAt) <= parseDate(point.timestamp)).length;
      const detection = clamp(caseItem.riskScore * 0.58 + 12 + progress * 12, 22, 96);
      const evidenceSignal = clamp(12 + evidenceSeen * 22 + progress * 18 + (caseItem.linkedDomainId ? 6 : 0), 8, 94);
      const enforcementSignal = clamp(10 + actionsSeen * 30 + progress * 24 + (caseItem.status === 'Enforcement' || caseItem.status === 'Closed' ? 18 : 0), 8, 96);
      return {
        ...point,
        label: shortDate(point.timestamp),
        detection,
        evidence: evidenceSignal,
        enforcement: enforcementSignal,
      };
    });
  }

  function renderSignalBarsChart(points) {
    if (!signalBars) return;
    signalBars.innerHTML = '';

    if (!points.length) {
      signalEmpty.className = 'ss-empty';
      signalEmpty.textContent = 'No signal history available for the selected case.';
      return;
    }

    signalEmpty.className = 'ss-hidden';
    signalEmpty.textContent = '';

    const width = 700;
    const height = 250;
    const chartTop = 26;
    const chartHeight = 150;
    const baseY = chartTop + chartHeight;
    const left = 38;
    const right = 24;
    const groupWidth = (width - left - right) / points.length;
    const barWidth = state.mode === 'all' ? 14 : 22;
    const barGap = 6;
    const series = [
      { key: 'detection', color: 'var(--ss-color-chart-lime)' },
      { key: 'evidence', color: 'var(--ss-color-accent-secondary)' },
      { key: 'enforcement', color: 'var(--ss-color-accent-tertiary)' },
    ];

    signalBars.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const panel = svgNode('rect', {
      x: 0,
      y: 0,
      width,
      height,
      rx: 20,
      fill: 'rgba(255,255,255,0.01)',
    });
    signalBars.appendChild(panel);

    for (let lineIndex = 0; lineIndex <= 4; lineIndex += 1) {
      const y = chartTop + (chartHeight / 4) * lineIndex;
      signalBars.appendChild(
        svgNode('line', {
          x1: left,
          x2: width - right,
          y1: y,
          y2: y,
          stroke: lineIndex === 4 ? 'rgba(143, 151, 181, 0.34)' : 'rgba(143, 151, 181, 0.16)',
          'stroke-width': 1,
        })
      );
    }

    points.forEach((point, index) => {
      const groupCenter = left + groupWidth * index + groupWidth / 2;
      const offsetBase = state.mode === 'all' ? ((series.length - 1) * (barWidth + barGap)) / 2 : 0;

      series.forEach((seriesItem, seriesIndex) => {
        const active = state.mode === 'all' || state.mode === seriesItem.key;
        const x = state.mode === 'all' ? groupCenter - offsetBase + seriesIndex * (barWidth + barGap) : groupCenter - barWidth / 2;
        const value = point[seriesItem.key];
        const fillHeight = Math.max(8, (value / 100) * chartHeight);
        signalBars.appendChild(
          svgNode('rect', {
            x,
            y: chartTop,
            width: barWidth,
            height: chartHeight,
            rx: barWidth / 2,
            fill: 'rgba(255,255,255,0.05)',
            stroke: 'rgba(255,255,255,0.04)',
          })
        );
        signalBars.appendChild(
          svgNode('rect', {
            x,
            y: baseY - fillHeight,
            width: barWidth,
            height: fillHeight,
            rx: barWidth / 2,
            fill: seriesItem.color,
            opacity: active ? 0.92 : 0.18,
          })
        );
      });

      const label = svgNode('text', {
        x: groupCenter,
        y: height - 16,
        'text-anchor': 'middle',
        class: 'ss-bar-chart-label',
      });
      label.textContent = point.label;
      signalBars.appendChild(label);

      const stage = svgNode('text', {
        x: groupCenter,
        y: height - 4,
        'text-anchor': 'middle',
        class: 'ss-bar-chart-stage',
      });
      stage.textContent = point.stage;
      signalBars.appendChild(stage);
    });
  }

  function renderTrendDeck(points) {
    if (!trendChart) return;
    trendChart.innerHTML = '';

    if (!points.length) return;

    const width = 700;
    const height = 220;
    const padding = { top: 18, right: 18, bottom: 34, left: 18 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const series = [
      { key: 'detection', color: 'var(--ss-color-accent-primary)' },
      { key: 'evidence', color: 'var(--ss-color-accent-secondary)' },
      { key: 'enforcement', color: 'var(--ss-color-accent-tertiary)' },
    ];

    trendChart.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const backdrop = svgNode('rect', {
      x: 0,
      y: 0,
      width,
      height,
      rx: 20,
      fill: 'rgba(255,255,255,0.01)',
    });
    trendChart.appendChild(backdrop);

    for (let lineIndex = 0; lineIndex <= 4; lineIndex += 1) {
      const y = padding.top + (chartHeight / 4) * lineIndex;
      trendChart.appendChild(
        svgNode('line', {
          x1: padding.left,
          x2: width - padding.right,
          y1: y,
          y2: y,
          stroke: lineIndex === 4 ? 'rgba(143, 151, 181, 0.34)' : 'rgba(143, 151, 181, 0.16)',
          'stroke-width': 1,
        })
      );
    }

    const step = chartWidth / Math.max(1, points.length - 1);
    series.forEach((seriesItem) => {
      const active = state.mode === 'all' || state.mode === seriesItem.key;
      const values = points.map((point) => point[seriesItem.key] / 100);
      const coordinates = values
        .map((value, index) => {
          const x = padding.left + step * index;
          const y = padding.top + chartHeight - value * chartHeight;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

      trendChart.appendChild(
        svgNode('polyline', {
          points: coordinates,
          fill: 'none',
          stroke: seriesItem.color,
          'stroke-width': active ? 2.8 : 1.6,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          opacity: active ? 0.96 : 0.22,
        })
      );
    });

    points.forEach((point, index) => {
      const label = svgNode('text', {
        x: padding.left + step * index,
        y: height - 12,
        'text-anchor': index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle',
        class: 'ss-line-chart-label',
      });
      label.textContent = point.label;
      trendChart.appendChild(label);
    });
  }

  function updateChartControls() {
    modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.investigationMode === state.mode);
    });
    rangeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.investigationRange === state.range);
    });
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
    const evidence = caseEvidence(caseItem.id);
    const actions = caseActions(caseItem.id);
    const timelineEntries = caseTimeline(caseItem);
    const domain = getDomainById(caseItem.linkedDomainId);
    const points = investigationPoints(caseItem);

    meta.textContent = `${caseItem.status} · ${evidence.length} evidence · ${actions.length} action${actions.length === 1 ? '' : 's'} · updated ${fmtDateTime(caseItem.updatedAt)}`;
    if (boardSummary) {
      boardSummary.textContent = `${timelineEntries.length} trace event${timelineEntries.length === 1 ? '' : 's'} synthesized for ${caseItem.threatType.toLowerCase()} review.`;
    }

    renderKvGrid(caseGrid, [
      { label: 'Case ID', value: caseItem.id },
      { label: 'Workflow', value: caseItem.status },
      { label: 'Owner', value: caseItem.owner },
      { label: 'Priority', value: caseItem.priority },
    ]);

    renderKvGrid(assetGrid, [
      { label: 'Channel', value: caseItem.channel },
      { label: 'Threat Type', value: caseItem.threatType },
      { label: 'Linked Asset', value: domain?.domainName || 'Unavailable' },
      { label: 'Risk Flags', value: domain?.riskFlags.join(', ') || 'None' },
      { label: 'Registrar / Status', value: domain ? `${domain.registrar} · ${domain.status}` : 'Unavailable' },
      { label: 'Risk Score', value: String(caseItem.riskScore) },
    ]);

    renderListMarkup(
      evidenceList,
      evidence
        .map(
          (item) => `
            <li>
              <div class="ss-chip-row ss-chip-row-compact">${createStatusChip(item.type.replace('_', ' '), 'case')}</div>
              <p class="ss-list-copy">${escapeHtml(item.value)}</p>
              <span class="ss-list-meta">${escapeHtml(fmtDateTime(item.capturedAt))}</span>
            </li>
          `
        )
        .join(''),
      'No evidence attached to this case yet.'
    );

    aiSummary.textContent = caseItem.aiSummary;
    aiCategory.textContent = `${caseItem.threatType} · ${caseItem.channel} channel · priority ${caseItem.priority}`;
    aiAction.textContent = caseItem.aiSuggestedAction;

    renderListMarkup(
      timeline,
      timelineEntries
        .slice(0, 12)
        .map((entry) => `<li><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.detail)}</p><span>${escapeHtml(fmtDateTime(entry.timestamp))}</span></li>`)
        .join(''),
      'No timeline activity recorded for this case yet.'
    );

    renderListMarkup(
      enforcementLog,
      actions
        .map((action) => {
          const vendor = getVendorById(action.vendorId);
          const sla = actionSlaMeta(action);
          return `
            <li>
              <div class="ss-chip-row ss-chip-row-compact">
                ${createStatusChip(action.actionType, 'case')}
                ${createStatusChip(action.status, statusClass(action.status))}
                ${createStatusChip(sla.label, sla.kind)}
              </div>
              <p class="ss-list-copy">${escapeHtml(vendor?.name || 'Unassigned')} · ${escapeHtml(action.outcome)}</p>
              <span class="ss-list-meta">${escapeHtml(fmtDateTime(action.requestedAt))}</span>
            </li>
          `;
        })
        .join(''),
      'No enforcement actions yet.'
    );

    renderSignalBarsChart(points);
    renderTrendDeck(points);
    updateChartControls();

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

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.investigationMode;
      render();
    });
  });

  rangeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.range = button.dataset.investigationRange;
      render();
    });
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
  const detailKicker = q('domains-detail-kicker');
  const detailTitle = q('domains-detail-title');
  const detailCopy = q('domains-detail-copy');
  const detailStatus = q('domains-detail-status');
  const riskScale = q('domains-risk-scale');
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

  function domainSecurityChips(domain) {
    return [
      createStatusChip(`DNSSEC ${domain.dnsSecurity.dnssec ? 'On' : 'Off'}`, domain.dnsSecurity.dnssec ? 'low' : 'medium'),
      createStatusChip(`Lock ${domain.dnsSecurity.registryLock ? 'On' : 'Off'}`, domain.dnsSecurity.registryLock ? 'low' : 'medium'),
      createStatusChip(`WHOIS ${domain.dnsSecurity.whoisPrivacy ? 'Private' : 'Public'}`, 'neutral'),
    ].join('');
  }

  function domainRiskFlagChips(domain, limit = null) {
    const flags = domain.riskFlags.length ? (limit ? domain.riskFlags.slice(0, limit) : domain.riskFlags) : ['No active flags'];
    return flags.map((flag) => createStatusChip(flag, flag === 'No active flags' ? 'neutral' : 'case')).join('');
  }

  function domainRiskScore(domain) {
    const flagWeights = {
      phishing: 30,
      lookalike: 20,
      typosquat: 18,
      scam: 22,
      counterfeit: 18,
    };

    let score = 8;
    domain.riskFlags.forEach((flag) => {
      score += flagWeights[flag] || 12;
    });

    if (domain.status === 'Monitoring') score += 12;
    if (domain.status === 'Incident') score += 28;
    if (domain.status === 'Suspended') score += 18;
    if (!domain.dnsSecurity.dnssec) score += 8;
    if (!domain.dnsSecurity.registryLock) score += 8;

    return clamp(score, 4, 99);
  }

  function domainRiskTier(score) {
    if (score >= 85) return { label: 'Critical', key: 'critical', chip: 'high' };
    if (score >= 65) return { label: 'High', key: 'high', chip: 'medium' };
    if (score >= 45) return { label: 'Moderate', key: 'medium', chip: 'case' };
    if (score >= 25) return { label: 'Watch', key: 'watch', chip: 'neutral' };
    return { label: 'Low', key: 'low', chip: 'low' };
  }

  function lastActionSummary(domain) {
    const latest = domain.actionLog[0];
    if (!latest) return 'No registrar activity logged.';
    return `${fmtDate(latest.timestamp)} · ${latest.text}`;
  }

  function renderRiskScale(domain) {
    if (!riskScale) return;
    const score = domainRiskScore(domain);
    const current = domainRiskTier(score).key;
    const steps = [
      { key: 'low', label: 'Low', range: '0-24' },
      { key: 'watch', label: 'Watch', range: '25-44' },
      { key: 'medium', label: 'Moderate', range: '45-64' },
      { key: 'high', label: 'High', range: '65-84' },
      { key: 'critical', label: 'Critical', range: '85+' },
    ];

    riskScale.innerHTML = steps
      .map(
        (step) => `
          <article class="ss-risk-step ${step.key} ${step.key === current ? 'is-active' : ''}">
            <strong>${escapeHtml(step.label)}</strong>
            <span>${escapeHtml(step.range)}</span>
          </article>
        `
      )
      .join('');
  }

  function renderSelected(domain, emptyMessage = 'Select a domain to inspect risk flags and registrar history.') {
    if (!domain) {
      empty.textContent = emptyMessage;
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      if (detailKicker) detailKicker.textContent = '';
      if (detailTitle) detailTitle.textContent = '';
      if (detailCopy) detailCopy.textContent = '';
      if (detailStatus) detailStatus.innerHTML = '';
      if (riskScale) riskScale.innerHTML = '';
      if (riskFlags) riskFlags.innerHTML = '';
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    const linked = domainLinkedCases(domain.id);
    const riskScore = domainRiskScore(domain);
    const tier = domainRiskTier(riskScore);
    const lastAction = domain.actionLog[0];

    if (detailKicker) detailKicker.textContent = domain.status;
    if (detailTitle) detailTitle.textContent = domain.domainName;
    if (detailCopy) detailCopy.textContent = domain.notes;
    if (detailStatus) {
      detailStatus.innerHTML = [
        createStatusChip(domain.status, statusClass(domain.status)),
        createStatusChip(`Risk ${riskScore}`, tier.chip),
        createStatusChip(`${linked.length} linked case(s)`, 'neutral'),
      ].join('');
    }

    renderKvGrid(detailGrid, [
      { label: 'Registrar', value: domain.registrar },
      { label: 'Expiration', value: domain.expiresOn },
      { label: 'Last Flagged', value: fmtDateTime(domain.lastFlaggedAt) },
      { label: 'Security Posture', value: securityLabel(domain) },
      { label: 'Linked Cases', value: String(linked.length) },
      { label: 'Latest Registrar Action', value: lastAction?.text || 'No registrar action logged.' },
    ]);

    renderRiskScale(domain);

    riskFlags.innerHTML = domainRiskFlagChips(domain);

    renderListMarkup(
      linkedCases,
      linked
        .map(
          (caseItem) => `
            <li>
              <div class="ss-chip-row ss-chip-row-compact">
                ${createStatusChip(caseItem.id, 'neutral')}
                ${createStatusChip(caseItem.status, statusClass(caseItem.status))}
                ${createStatusChip(caseItem.priority, priorityClass(caseItem.priority))}
              </div>
              <p class="ss-list-copy"><a href="./charts.html?case=${encodeURIComponent(caseItem.id)}">${escapeHtml(caseItem.title)}</a></p>
              <span class="ss-list-meta">${escapeHtml(caseItem.channel)} · ${escapeHtml(caseItem.threatType)}</span>
            </li>
          `
        )
        .join(''),
      'No linked cases.'
    );

    renderListMarkup(
      log,
      domain.actionLog
        .slice(0, 10)
        .map((entry) => `<li><strong>Registrar Action</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.timestamp))}</span></li>`)
        .join(''),
      'No registrar actions logged for this domain yet.'
    );
  }

  function renderTable() {
    const rows = filteredDomains();
    const visibleDomain = syncVisibleSelection(
      rows,
      appState.selectedDomainId,
      (domain) => domain.id,
      (domainId) => {
        appState.selectedDomainId = domainId;
      }
    );

    kpiTotal.textContent = String(appState.domains.length);
    kpiMonitoring.textContent = String(appState.domains.filter((domain) => domain.status === 'Monitoring').length);
    kpiIncident.textContent = String(appState.domains.filter((domain) => domain.status === 'Incident').length);

    summary.textContent = `${rows.length} domain(s) in view · ${rows.filter((domain) => domain.riskFlags.length).length} carrying active risk flags`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="5">No domains match current filters.</td></tr>';
      renderSelected(null, 'No domains match current filters. Adjust filters to inspect a portfolio record.');
      return;
    }

    rows.forEach((domain) => {
      const riskScore = domainRiskScore(domain);
      const tier = domainRiskTier(riskScore);
      const linked = domainLinkedCases(domain.id);
      const row = document.createElement('tr');
      if (domain.id === appState.selectedDomainId) row.classList.add('is-selected');
      row.innerHTML = `
        <td>
          <div class="ss-domain-cell">
            <strong class="ss-domain-name">${escapeHtml(domain.domainName)}</strong>
            <p class="ss-domain-meta">${escapeHtml(domain.registrar)}</p>
            <p class="ss-domain-meta">Expires ${escapeHtml(domain.expiresOn)}</p>
          </div>
        </td>
        <td>
          <div class="ss-domain-security">
            <div class="ss-chip-row ss-chip-row-compact">${domainSecurityChips(domain)}</div>
            <p class="ss-domain-meta">${escapeHtml(securityLabel(domain))}</p>
          </div>
        </td>
        <td>
          <div class="ss-domain-risk">
            ${createStatusChip(`Risk ${riskScore}`, tier.chip)}
            <div class="ss-progress ss-progress-micro" style="--progress:${riskScore}%"><span></span></div>
            <div class="ss-chip-row ss-chip-row-compact">
              ${domainRiskFlagChips(domain, 2)}
            </div>
          </div>
        </td>
        <td>
          <div class="ss-domain-status">
            <div class="ss-chip-row ss-chip-row-compact">
              ${createStatusChip(domain.status, statusClass(domain.status))}
              ${createStatusChip(`${linked.length} case(s)`, 'neutral')}
            </div>
            <p class="ss-domain-meta">Last flagged ${escapeHtml(fmtDate(domain.lastFlaggedAt))}</p>
          </div>
        </td>
        <td>
          <div class="ss-domain-activity">
            <p class="ss-domain-meta">${escapeHtml(lastActionSummary(domain))}</p>
          </div>
        </td>
      `;
      row.addEventListener('click', () => {
        appState.selectedDomainId = domain.id;
        persistState(appState);
        renderTable();
        scrollToPanel(panel);
      });
      rowsEl.appendChild(row);
    });

    renderSelected(visibleDomain);
  }

  q('domains-log-add')?.addEventListener('click', () => {
    const domain = selectedDomain();
    if (!domain) return;
    const text = logInput.value.trim();
    if (!text) return;
    addDomainActionLog(domain.id, text);
    logInput.value = '';
    renderTable();
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
  const deadlineSummary = q('enforcement-deadline-summary');
  const deadlineList = q('enforcement-deadline-list');

  const kpiOpen = q('enforcement-kpi-open');
  const kpiBreach = q('enforcement-kpi-breach');
  const kpiResolved = q('enforcement-kpi-resolved');

  const empty = q('enforcement-empty');
  const panel = q('enforcement-panel');
  const detailKicker = q('enforcement-detail-kicker');
  const detailTitle = q('enforcement-detail-title');
  const detailCopy = q('enforcement-detail-copy');
  const detailStatus = q('enforcement-detail-status');
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

  function outcomeClass(outcome) {
    if (outcome === 'Removed') return 'low';
    if (outcome === 'Escalated') return 'medium';
    if (outcome === 'Not Removed') return 'high';
    return 'neutral';
  }

  function latestActionNote(action) {
    return action.notes?.[0] || null;
  }

  function slaProgress(action) {
    if (action.status === 'Resolved' || action.status === 'Denied') return 100;
    const total = Math.max(1, hoursBetween(action.requestedAt, action.dueAt) || 1);
    const elapsed = Math.max(0, hoursBetween(action.requestedAt, nowIso()) || 0);
    return clamp(Math.round((elapsed / total) * 100), 4, 100);
  }

  function renderSupport(rows) {
    const byVendor = countBy(rows, (action) => getVendorById(action.vendorId)?.name || 'Unassigned')
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, tone: `tone-${index % 4}` }));

    renderBarList(q('enforcement-type-bars'), byVendor.length ? byVendor : [{ label: 'No visible workload', value: 0, tone: 'tone-0' }]);

    const deadlineRows = rows
      .filter((action) => action.status !== 'Resolved' && action.status !== 'Denied')
      .sort((a, b) => parseDate(a.dueAt) - parseDate(b.dueAt))
      .slice(0, 4);

    const breachCount = rows.filter((action) => actionSlaMeta(action).breach).length;
    const dueSoonCount = rows.filter((action) => {
      const hoursLeft = hoursBetween(nowIso(), action.dueAt);
      return action.status !== 'Resolved' && action.status !== 'Denied' && Number.isFinite(hoursLeft) && hoursLeft >= 0 && hoursLeft < 8;
    }).length;

    if (deadlineSummary) {
      deadlineSummary.textContent = breachCount
        ? `${breachCount} overdue · ${dueSoonCount} due inside 8h`
        : dueSoonCount
          ? `${dueSoonCount} due inside 8h`
          : 'No immediate deadline pressure in view';
    }

    renderListMarkup(
      deadlineList,
      deadlineRows
        .map((action) => {
          const vendor = getVendorById(action.vendorId);
          const caseItem = getCaseById(action.caseId);
          const sla = actionSlaMeta(action);
          return `
            <li>
              <div class="ss-chip-row ss-chip-row-compact">
                ${createStatusChip(caseItem?.id || action.caseId, 'neutral')}
                ${createStatusChip(sla.label, sla.kind)}
              </div>
              <p class="ss-list-copy">${escapeHtml(action.actionType)} · ${escapeHtml(vendor?.name || 'Unassigned')}</p>
              <span class="ss-list-meta">${escapeHtml(caseItem?.title || 'Case unavailable')}</span>
            </li>
          `;
        })
        .join(''),
      'No active deadlines in the current view.'
    );
  }

  function renderSelected(action, emptyMessage = 'Select an action to update status or add notes.') {
    if (!action) {
      empty.textContent = emptyMessage;
      empty.classList.remove('ss-hidden');
      panel.classList.add('ss-hidden');
      if (detailKicker) detailKicker.textContent = '';
      if (detailTitle) detailTitle.textContent = '';
      if (detailCopy) detailCopy.textContent = '';
      if (detailStatus) detailStatus.innerHTML = '';
      return;
    }

    empty.classList.add('ss-hidden');
    panel.classList.remove('ss-hidden');

    const vendor = getVendorById(action.vendorId);
    const caseItem = getCaseById(action.caseId);
    const sla = actionSlaMeta(action);
    const latestNote = latestActionNote(action);
    const resolvedLabel = action.resolvedAt ? fmtDateTime(action.resolvedAt) : 'Open';

    if (detailKicker) detailKicker.textContent = `${action.id} · ${vendor?.region || 'Global'} vendor route`;
    if (detailTitle) detailTitle.textContent = action.actionType;
    if (detailCopy) {
      detailCopy.textContent = `${caseItem?.title || 'Case unavailable'} · ${vendor?.name || 'Unassigned'} operating on a ${vendor?.slaHours || 'n/a'}h SLA. ${
        latestNote ? `Latest note: ${latestNote.text}` : 'Awaiting additional coordination notes.'
      }`;
    }
    if (detailStatus) {
      detailStatus.innerHTML = [
        createStatusChip(action.status, statusClass(action.status)),
        createStatusChip(action.outcome, outcomeClass(action.outcome)),
        createStatusChip(sla.label, sla.kind),
      ].join('');
    }

    renderKvGrid(detailGrid, [
      { label: 'Case ID', value: action.caseId },
      { label: 'Channel', value: caseItem?.channel || 'Unavailable' },
      { label: 'Owner', value: caseItem?.owner || 'Unassigned' },
      { label: 'Vendor', value: vendor?.name || 'Unassigned' },
      { label: 'Vendor Region', value: vendor?.region || 'Global' },
      { label: 'Action Type', value: action.actionType },
      { label: 'Requested', value: fmtDateTime(action.requestedAt) },
      { label: 'Due', value: fmtDateTime(action.dueAt) },
      { label: 'Resolved', value: resolvedLabel },
      { label: 'Threat', value: caseItem?.threatType || 'Unavailable' },
    ]);

    nextStatus.value = action.status;

    renderListMarkup(
      notes,
      action.notes
        .slice(0, 12)
        .map((entry) => `<li><strong>${escapeHtml(entry.author)}</strong><p>${escapeHtml(entry.text)}</p><span>${escapeHtml(fmtDateTime(entry.createdAt))}</span></li>`)
        .join(''),
      'No coordination notes recorded for this action yet.'
    );
  }

  function renderTable() {
    const rows = filteredActions();
    const visibleAction = syncVisibleSelection(
      rows,
      appState.selectedActionId,
      (action) => action.id,
      (actionId) => {
        appState.selectedActionId = actionId;
      }
    );

    const openCount = appState.enforcementActions.filter((action) => action.status !== 'Resolved' && action.status !== 'Denied').length;
    const breachCount = appState.enforcementActions.filter((action) => actionSlaMeta(action).breach).length;
    const resolvedCount = appState.enforcementActions.filter((action) => action.status === 'Resolved').length;

    kpiOpen.textContent = String(openCount);
    kpiBreach.textContent = String(breachCount);
    kpiResolved.textContent = String(resolvedCount);

    summary.textContent = `${rows.length} action(s) in view · ${rows.filter((action) => action.status !== 'Resolved' && action.status !== 'Denied').length} still active`;

    rowsEl.innerHTML = '';
    if (!rows.length) {
      rowsEl.innerHTML = '<tr><td colspan="5">No enforcement actions match current filters.</td></tr>';
      renderSelected(null, 'No enforcement actions match current filters. Adjust filters to inspect vendor coordination details.');
      renderSupport(rows);
      return;
    }

    rows.forEach((action) => {
      const vendor = getVendorById(action.vendorId);
      const caseItem = getCaseById(action.caseId);
      const sla = actionSlaMeta(action);
      const latestNote = latestActionNote(action);
      const progress = slaProgress(action);
      const row = document.createElement('tr');
      if (action.id === appState.selectedActionId) row.classList.add('is-selected');
      row.innerHTML = `
        <td>
          <div class="ss-enforcement-item">
            <strong class="ss-enforcement-id">${escapeHtml(caseItem?.id || action.caseId)}</strong>
            <p class="ss-enforcement-meta">${escapeHtml(caseItem?.title || 'Case unavailable')}</p>
            <p class="ss-enforcement-meta">${escapeHtml(action.actionType)} · ${escapeHtml(action.id)}</p>
          </div>
        </td>
        <td>
          <div class="ss-enforcement-vendor">
            <div class="ss-chip-row ss-chip-row-compact">
              ${createStatusChip(vendor?.name || 'Unassigned', 'neutral')}
              ${createStatusChip(vendor?.region || 'Global', 'case')}
            </div>
            <p class="ss-enforcement-meta">${escapeHtml(`${vendor?.slaHours || 'n/a'}h SLA · ${caseItem?.channel || 'Unknown channel'}`)}</p>
          </div>
        </td>
        <td>
          <div class="ss-enforcement-sla">
            ${createStatusChip(sla.label, sla.kind)}
            <div class="ss-progress ss-progress-micro" style="--progress:${progress}%"><span></span></div>
            <p class="ss-enforcement-meta">Due ${escapeHtml(fmtDateTime(action.dueAt))}</p>
          </div>
        </td>
        <td>
          <div class="ss-enforcement-status">
            <div class="ss-chip-row ss-chip-row-compact">
              ${createStatusChip(action.status, statusClass(action.status))}
              ${createStatusChip(action.outcome, outcomeClass(action.outcome))}
            </div>
            <p class="ss-enforcement-meta">${escapeHtml(action.resolvedAt ? `Closed ${fmtDate(action.resolvedAt)}` : 'Awaiting closure')}</p>
          </div>
        </td>
        <td>
          <div class="ss-enforcement-activity">
            <p class="ss-enforcement-meta">${escapeHtml(latestNote ? `${fmtDate(latestNote.createdAt)} · ${latestNote.text}` : 'No coordination notes yet.')}</p>
          </div>
        </td>
      `;
      row.addEventListener('click', () => {
        appState.selectedActionId = action.id;
        persistState(appState);
        renderTable();
        scrollToPanel(panel);
      });
      rowsEl.appendChild(row);
    });

    renderSelected(visibleAction);
    renderSupport(rows);
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
    renderTable();
  });

  vendorFilter?.addEventListener('change', (event) => {
    state.vendor = event.target.value;
    renderTable();
  });

  statusFilter?.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderTable();
  });

  if (!appState.selectedActionId && appState.enforcementActions[0]) {
    appState.selectedActionId = appState.enforcementActions[0].id;
    persistState(appState);
  }

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

function initBrandPopover() {
  if (!brandTrigger) return;

  const popover = document.createElement('div');
  popover.className = 'ss-brand-popover';
  popover.id = 'ss-brand-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'About Speculo');
  popover.innerHTML = `
    <div class="ss-brand-popover-head">
      <span class="ss-brand-popover-dot" aria-hidden="true"></span>
      <span>Terminal</span>
    </div>
    <div class="ss-brand-popover-screen">
      <p class="ss-brand-popover-title">speculo</p>
      <p class="ss-brand-popover-line"><span data-brand-typed></span><span class="ss-brand-cursor" aria-hidden="true">_</span></p>
    </div>
  `;
  document.body.appendChild(popover);

  const typedTarget = popover.querySelector('[data-brand-typed]');
  const typedText = 'a brand protection company';
  let typingTimer = null;

  function stopTyping() {
    if (typingTimer) {
      window.clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function positionPopover() {
    const rect = brandTrigger.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 264, rect.right + 12);
    const top = rect.top + 2;
    popover.style.left = `${Math.max(12, left)}px`;
    popover.style.top = `${Math.max(12, top)}px`;
  }

  function runTyping(index = 0) {
    if (!typedTarget) return;
    typedTarget.textContent = typedText.slice(0, index);
    if (index >= typedText.length) {
      typingTimer = null;
      return;
    }
    typingTimer = window.setTimeout(() => runTyping(index + 1), 38);
  }

  function openPopover() {
    stopTyping();
    positionPopover();
    brandTrigger.setAttribute('aria-expanded', 'true');
    popover.classList.add('is-open');
    runTyping(0);
  }

  function closePopover() {
    stopTyping();
    brandTrigger.setAttribute('aria-expanded', 'false');
    popover.classList.remove('is-open');
  }

  brandTrigger.setAttribute('aria-expanded', 'false');
  brandTrigger.setAttribute('aria-controls', 'ss-brand-popover');

  brandTrigger.addEventListener('click', () => {
    if (popover.classList.contains('is-open')) {
      closePopover();
      return;
    }
    openPopover();
  });

  document.addEventListener('click', (event) => {
    if (!popover.classList.contains('is-open')) return;
    if (event.target.closest('[data-brand-trigger]') || event.target.closest('#ss-brand-popover')) return;
    closePopover();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePopover();
  });

  window.addEventListener('resize', () => {
    if (popover.classList.contains('is-open')) positionPopover();
  });

  window.addEventListener('scroll', () => {
    if (popover.classList.contains('is-open')) positionPopover();
  }, { passive: true });
}

function initExplainerPopover() {
  if (!explainerTriggers.length) return;

  const popover = document.createElement('div');
  popover.className = 'ss-explainer-popover';
  popover.id = 'ss-explainer-popover';
  popover.tabIndex = -1;
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');
  popover.setAttribute('aria-label', 'Speculo explainer');
  popover.innerHTML = `
    <div class="ss-explainer-popover-head">
      <div class="ss-explainer-window-meta">
        <span class="ss-explainer-lang">json</span>
        <strong class="ss-explainer-file" data-explainer-file></strong>
      </div>
      <span class="ss-explainer-head-mark" aria-hidden="true">{ }</span>
    </div>
    <div class="ss-explainer-popover-screen">
      <div class="ss-explainer-code" data-explainer-code aria-live="polite" aria-atomic="true"></div>
      <div class="ss-explainer-options" data-explainer-options></div>
    </div>
  `;
  document.body.appendChild(popover);

  const fileEl = popover.querySelector('[data-explainer-file]');
  const codeEl = popover.querySelector('[data-explainer-code]');
  const optionsEl = popover.querySelector('[data-explainer-options]');

  let typingTimer = null;
  let activeTrigger = null;
  let activeExplainer = null;
  let activeView = 'primary';
  const seenStates = new Set();

  function stopTyping() {
    if (typingTimer) {
      window.clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function positionPopover(trigger) {
    const rect = trigger.getBoundingClientRect();
    const horizontalPreferred = rect.right + 12;
    const popoverWidth = 520;
    const popoverHeight = Math.min(popover.offsetHeight || 420, window.innerHeight - 24);
    const left = horizontalPreferred + popoverWidth > window.innerWidth
      ? rect.left - (popoverWidth + 12)
      : horizontalPreferred;
    const maxTop = Math.max(12, window.innerHeight - popoverHeight - 12);
    const top = Math.min(maxTop, Math.max(12, rect.top - 2));
    popover.style.left = `${Math.max(12, left)}px`;
    popover.style.top = `${top}px`;
  }

  function currentPayload() {
    if (!activeExplainer) return null;
    if (activeView === 'primary') {
      return {
        file: activeExplainer.primary.file,
        content: activeExplainer.primary.content,
        options: [
          ...activeExplainer.options.map((option) => ({ ...option, mode: option.key })),
          { key: 'close', label: '[3] Close', mode: 'close' },
        ],
      };
    }

    return {
      file: activeExplainer.views[activeView].file,
      content: activeExplainer.views[activeView].content,
      options: [
        { key: 'primary', label: '[1] Back', mode: 'primary' },
        { key: 'close', label: '[2] Close', mode: 'close' },
      ],
    };
  }

  function renderOptions(options) {
    optionsEl.innerHTML = options
      .map((option) => {
        const match = option.label.match(/^\[(\d+)\]\s*(.+)$/);
        const index = match ? match[1] : '>';
        const label = match ? match[2] : option.label;
        return `
          <button class="ss-explainer-option" type="button" data-explainer-mode="${escapeHtml(option.mode)}">
            <span class="ss-explainer-option-index" aria-hidden="true">cmd ${escapeHtml(index)}</span>
            <span class="ss-explainer-option-label">open ${escapeHtml(label.toLowerCase())}</span>
          </button>
        `;
      })
      .join('');

    optionsEl.querySelectorAll('[data-explainer-mode]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextMode = button.dataset.explainerMode;
        if (nextMode === 'close') {
          closePopover();
          return;
        }
        activeView = nextMode;
        renderState();
      });
    });
  }

  function revealExplainerContent(content, stateKey, onDone) {
    const lines = formatExplainerLines(content);
    const plainText = explainerLinesToText(lines);
    const instant = seenStates.has(stateKey);

    codeEl.innerHTML = '';
    codeEl.setAttribute('aria-label', plainText);

    function step(index = 0) {
      if (index >= lines.length) {
        typingTimer = null;
        seenStates.add(stateKey);
        onDone();
        return;
      }

      codeEl.insertAdjacentHTML('beforeend', renderExplainerLineMarkup(lines[index], index));
      typingTimer = window.setTimeout(() => step(index + 1), instant ? 10 : 52);
    }

    step(0);
  }

  function renderState() {
    const payload = currentPayload();
    if (!payload || !activeExplainer) return;
    stopTyping();
    const stateKey = `${activeTrigger?.dataset.explainerTrigger || 'overview'}:${activeView}`;
    fileEl.textContent = payload.file;
    codeEl.scrollTop = 0;
    optionsEl.innerHTML = '';
    revealExplainerContent(payload.content, stateKey, () => {
      renderOptions(payload.options);
      window.requestAnimationFrame(() => {
        if (activeTrigger) positionPopover(activeTrigger);
      });
      optionsEl.querySelector('button')?.focus();
    });
  }

  function openPopover(trigger) {
    const nextExplainer = OVERVIEW_EXPLAINERS[trigger.dataset.explainerTrigger];
    if (!nextExplainer) return;

    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger = trigger;
    activeExplainer = nextExplainer;
    activeView = 'primary';

    positionPopover(trigger);
    trigger.setAttribute('aria-expanded', 'true');
    popover.classList.add('is-open');
    popover.focus();
    renderState();
  }

  function closePopover() {
    stopTyping();
    optionsEl.innerHTML = '';
    popover.classList.remove('is-open');
    if (activeTrigger) activeTrigger.setAttribute('aria-expanded', 'false');
    activeTrigger?.focus();
    activeTrigger = null;
    activeExplainer = null;
    activeView = 'primary';
  }

  explainerTriggers.forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'ss-explainer-popover');
    trigger.addEventListener('click', () => {
      if (popover.classList.contains('is-open') && activeTrigger === trigger) {
        closePopover();
        return;
      }
      openPopover(trigger);
    });
  });

  document.addEventListener('click', (event) => {
    if (!popover.classList.contains('is-open')) return;
    if (event.target.closest('[data-explainer-trigger]') || event.target.closest('#ss-explainer-popover')) return;
    closePopover();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popover.classList.contains('is-open')) closePopover();
  });

  window.addEventListener('resize', () => {
    if (popover.classList.contains('is-open') && activeTrigger) positionPopover(activeTrigger);
  });

  window.addEventListener(
    'scroll',
    () => {
      if (popover.classList.contains('is-open') && activeTrigger) positionPopover(activeTrigger);
    },
    { passive: true }
  );
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

initBrandPopover();
initExplainerPopover();

window.addEventListener('mousemove', (event) => {
  const target = event.target.closest('[data-tooltip]');
  if (!target) {
    hideTooltip();
    return;
  }
  showTooltip(event, target.dataset.tooltip);
});
window.addEventListener('scroll', hideTooltip, { passive: true });
