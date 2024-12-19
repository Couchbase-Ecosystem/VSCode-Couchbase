import type { SupportImpact, SupportPlan, SupportPriority, SupportTicketStatus, SupportTopic } from 'constants/support';
import type { RbacListResponse, RbacResponse } from 'sync/response.types';

export type Support = {
  id: string;
  priority: SupportPriority;
  subject: string;
  userEmail: string;
  clusterScope?: {
    label: string;
    id: string;
  };
  description?: string;
  environments?: string[];
  preSignedURLs?: string[];
  productionImpact?: SupportImpact;
  projectScope?: {
    label: string;
    id: string;
  };
  requestId?: string;
  SDKs?: string[] | null;
  supportPlan?: SupportPlan;
  tenantScope?: {
    label: string;
    id: string;
  };
  topic?: SupportTopic;
  userScope?: {
    label: string;
    id: string;
  };

  readonly status: SupportTicketStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly cc?: string[];
  readonly externalId: number;
  readonly has_incidents?: boolean;
  readonly type?: string;
  readonly url?: string;
};

export type SupportResponse = RbacResponse<Support>;
export type SupportListResponse = RbacListResponse<Support>;

export type CreateSupportPayload = {
  id?: string;
  productionImpact?: SupportImpact;

  attachmentCount?: number;
  clusterScope?: {
    id: string;
    label: string;
  };
  environments: string[];
  description: string;
  impact?: SupportImpact;
  projectScope?: {
    id: string;
    label: string;
  };
  SDKs?: string[];
  tenantScope: {
    id: string;
    label: string;
  };
  subject: string;
  topic: SupportTopic;
  priority?: SupportPriority;
};

export type ResolveSupportPayload = Partial<CreateSupportPayload & { status: SupportTicketStatus; comment: string } & Support>;

export type SupportTicketForm = {
  subject: string;
  description: string;
  topic: SupportTopic;
  impact: SupportImpact;
  project: string;
  database: string;
  sdk: string;
  files?: File[];
};

export type UploadSupportTicketFilePayload = {
  ticket: Support;
  url: string;
  file: File;
};

export type FeedbackPayload = {
  clusterCount?: string;
  cspName?: string;
  description: string;
  projectCount?: string;
  summary: string;
  tenantName?: string;
  tenantId?: string;
  totalUsers?: string;
  userEmail: string;
  project?: string;
  cluster?: string;
};
