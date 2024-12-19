export const SUPPORT_PRIORITY = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};
export type SupportPriority = keyof typeof SUPPORT_PRIORITY;

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export const SUPPORT_PRIORITY_BY_PRIORITY_LEVEL: Record<PriorityLevel, SupportPriority> = {
  P1: 'urgent',
  P2: 'high',
  P3: 'normal',
  P4: 'low',
};

export const SUPPORT_IMPACT = {
  prod_impact_none: 'None',
  cloud_impact_trouble_starting: 'TroubleStarting',
  prod_impact_dev_slight: 'DevImpactSlight',
  prod_impact_dev_blocked: 'DevImpactBlocked',
  prod_impact_rca: 'RCA',
  prod_impact: 'ProdImpact',
  prod_impact_partial_outage: 'ProdImpactPartial',
  prod_impact_severe_outage: 'ProdImpactSevere',
};

export type SupportImpact = keyof typeof SUPPORT_IMPACT;

export const SUPPORT_IMPACT_PRIORITY: Record<SupportImpact, PriorityLevel> = {
  prod_impact_none: 'P4',
  cloud_impact_trouble_starting: 'P4',
  prod_impact_dev_slight: 'P4',
  prod_impact_dev_blocked: 'P3',
  prod_impact_rca: 'P4',
  prod_impact: 'P3',
  prod_impact_partial_outage: 'P2',
  prod_impact_severe_outage: 'P1',
};

type PriorityContent = {
  title: string;
  content: string;
  priority: string;
};

const p1PriorityContent: PriorityContent = {
  title: 'Blocker',
  priority: 'P1',
  content:
    'Error that causes complete loss or severe outage of the Cloud Service, resulting in an application being down or non-operational, or loss of customer data.',
};

const p2PriorityContent: PriorityContent = {
  priority: 'P2',
  title: 'Critical',
  content: 'Error that causes partial loss of the Cloud Service impacting business operations.',
};

const p3riorityContent: PriorityContent = {
  priority: 'P3',
  title: 'Major',
  content: 'Error that does not prevent normal operation, or may be temporarily circumvented using an available workaround.',
};

const p4riorityContent: PriorityContent = {
  priority: 'P4',
  title: 'Minor',
  content: 'Non-critical error, general questions, or requests for enhancements to the Software.',
};

export const SUPPORT_PRIORITY_TEXT: Record<PriorityLevel | SupportPriority, PriorityContent> = {
  P1: p1PriorityContent,
  urgent: p1PriorityContent,
  P2: p2PriorityContent,
  high: p2PriorityContent,
  P3: p3riorityContent,
  normal: p3riorityContent,
  P4: p4riorityContent,
  low: p4riorityContent,
};

export const SUPPORT_IMPACT_OPTIONS: { label: string; value: SupportImpact; group?: string }[] = [
  {
    label: 'None',
    value: 'prod_impact_none',
  },
  {
    label: 'Trouble Getting Started',
    value: 'cloud_impact_trouble_starting',
  },
  {
    label: 'Development Slightly Impacted',
    value: 'prod_impact_dev_slight',
    group: 'DEVELOPMENT IMPACT',
  },
  {
    label: 'Development Blocked',
    value: 'prod_impact_dev_blocked',
    group: 'DEVELOPMENT IMPACT',
  },
  {
    label: 'Root Cause Analysis',
    value: 'prod_impact_rca',
    group: 'PRODUCTION IMPACT',
  },
  {
    label: 'Production Impacted',
    value: 'prod_impact',
    group: 'PRODUCTION IMPACT',
  },
  {
    label: 'Partial Production Outage',
    value: 'prod_impact_partial_outage',
    group: 'PRODUCTION IMPACT',
  },
  {
    label: 'Severe Production Outage',
    value: 'prod_impact_severe_outage',
    group: 'PRODUCTION IMPACT',
  },
];

export const SUPPORT_TICKET_STATUS = {
  closed: 'Closed',
  hold: 'Hold',
  new: 'New',
  open: 'Open',
  pending: 'Pending',
  solved: 'Solved',
};
export type SupportTicketStatus = keyof typeof SUPPORT_TICKET_STATUS;

export const SUPPORT_TOPIC = {
  topic_billing: 'Billing',
  topic_database: 'Database',
  topic_sdk: 'SDK',
  topic_question: 'General',
};

export type SupportTopic = keyof typeof SUPPORT_TOPIC;

export const SUPPORT_TOPIC_OPTIONS: { label: string; value: SupportTopic }[] = [
  {
    label: 'Database',
    value: 'topic_database',
  },
  {
    label: 'SDK',
    value: 'topic_sdk',
  },
  {
    label: 'Billing',
    value: 'topic_billing',
  },
  {
    label: 'General',
    value: 'topic_question',
  },
];

export const SUPPORT_PLAN = {
  none: 'None',
  developer_pro: 'Developer Pro',
  enterprise: 'Enterprise',
};

export type SupportPlan = keyof typeof SUPPORT_PLAN;
