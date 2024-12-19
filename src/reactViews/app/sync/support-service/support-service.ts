import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { getRequest, postRequest, putRequest } from 'sync/request';
import { OrganizationContext } from 'sync/request.types';
import {
  CreateSupportPayload,
  FeedbackPayload,
  ResolveSupportPayload,
  SupportListResponse,
  SupportResponse,
  UploadSupportTicketFilePayload,
} from './support-service.types';

export function getSupportService({ id }: { id: string }) {
  return getRequest<SupportResponse>(`/support/${id}`);
}

/**
 * Return a list of support items project.
 */
export function listSupportService({ organizationId }: OrganizationContext, params: QueryOptions = defaultPaginationQuery) {
  return getRequest<SupportListResponse>(`/support`, { params: { ...params, tenantId: organizationId } });
}

/**
 * Create support ticket.
 */
export function createSupportService(params: CreateSupportPayload) {
  return postRequest<SupportResponse>(`/support`, { params });
}

export function uploadFileSupportService(payload: UploadSupportTicketFilePayload) {
  return putRequest<SupportResponse>(`/support/${payload.ticket.id}/attachment`, {
    data: {
      bytes: {
        bytes: payload.file.size,
        filename: payload.file.name,
        url: payload.url.split('?')[0],
      },
    },
  });
}

export function updateSupportTicketSupportService({ id }: { id: string }, data: Partial<CreateSupportPayload>) {
  return putRequest<SupportResponse>(`/support/${id}`, { data });
}

/**
 * Resolve support ticket.
 */
export function resolveSupportService({ id }: { id: string }, data: ResolveSupportPayload) {
  return putRequest<SupportResponse>(`/support/${id}`, { data });
}

/**
 * Send feedback for review.
 */
export function createFeedbackSupportService(data: FeedbackPayload) {
  const formData = Object.entries(data).reduce((form, kv) => {
    form.append(kv[0], kv[1]);
    return form;
  }, new FormData());
  /**
   * The browser sets correct headers for us
   * when it detects FormData constructor, so
   * we override REQUEST headers to make sure
   * REQUEST doesn't override browser's ones
   * TODO: this code should be revised
   * when default headers is removed from REQUEST.
   */
  return postRequest<FeedbackPayload>('/feedback', { data: formData });
}
