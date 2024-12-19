import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest, putRequest } from 'sync/request';
import { DatabaseContext, OrganizationContext, ProjectContext } from 'sync/request.types';
import {
  AccessibleDatabase,
  CreateDatabasePayload,
  CreateDatabaseResponse,
  CreateServerlessDatabasePayload,
  CreateServerlessResponse,
  DatabaseListResponse,
  DatabaseNodeListResponse,
  DatabaseResponse,
  DeployTrialDatabasePayload,
  JobResponse,
  TogglePlaygroundPayload,
  UpdateDatabasePayload,
  UpdateDatabasePlanPayload,
} from './database-service.types';

export const listDatabases = (params: OrganizationContext, query: QueryOptions = defaultPaginationQuery) => {
  return getRequest<DatabaseListResponse>(`/v2/organizations/${params.organizationId}/clusters`, {
    params: query,
  });
};

/**
 * Request to return a list of nodes for a specified `organization` database.
 */
export const listDatabaseNodes = (params: DatabaseContext) => {
  return getRequest<DatabaseNodeListResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/nodes`
  );
};

/**
 * **Queryable** request to return a list of databases against a specified project.
 */
export const listProjectDatabases = (params: ProjectContext, query: QueryOptions = defaultPaginationQuery) => {
  return getRequest<DatabaseListResponse>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters`, {
    params: query,
  });
};

/**
 * Request to return a specified `organization` database.
 *
 * TODO: This endpoint needs to be updated at the API layer to return a single organization and not a list of organizations.
 */
export const getDatabase = (params: DatabaseContext) => {
  return getRequest<DatabaseResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}`
  );
};

/**
 * Return a list of accessible databases.
 */
export const getAccessibleDatabases = (params: OrganizationContext) => {
  return getRequest<AccessibleDatabase[]>(`/v2/organizations/${params.organizationId}/clusters/accessible-clusters`);
};

/**
 * Request to update a **provisioned** database details.
 */
export const updateDatabase = (params: DatabaseContext, data: UpdateDatabasePayload) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/meta`, {
    data,
  });
};

/**
 * Request to update a **provisioned** database plan.
 */
export const updateDatabasePlan = (params: DatabaseContext, data: UpdateDatabasePlanPayload) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/package`, {
    data,
  });
};

/**
 * Request to delete a specified **provisioned* database.
 */
export const deleteDatabase = (params: DatabaseContext) => {
  return deleteRequest<DatabaseResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}`
  );
};

/**
 * Request to delete a specified **provisioned* database.
 */
export const deleteServerlessDatabase = (params: DatabaseContext) => {
  return deleteRequest<DatabaseResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/databases/${params.databaseId}`
  );
};

/**
 * Request to deploy a **provisioned** database.
 */
export const createDatabase = (params: OrganizationContext, data: CreateDatabasePayload) => {
  return postRequest<CreateDatabaseResponse>(`/v2/organizations/${params.organizationId}/clusters`, {
    data,
  });
};

/**
 * Request to deploy a **provisioned trial** database.
 */
export const createTrialDatabase = (params: OrganizationContext, data: DeployTrialDatabasePayload) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/trial/cluster`, { data });
};

/**
 * Request to deploy a **serverless** database.
 */
export const createServerlessDatabase = (params: OrganizationContext, data: CreateServerlessDatabasePayload) => {
  return postRequest<CreateServerlessResponse>(`/v2/organizations/${params.organizationId}/databases`, {
    data,
  });
};

export const getDataJobs = (params: DatabaseContext) => {
  return getRequest<JobResponse>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/jobs`
  );
};

/**
 * Request to enable/disable playground for a database.
 */
export const toggleDatabasePlayground = (params: DatabaseContext, data: TogglePlaygroundPayload) => {
  return putRequest<{}>(
    `/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/playground`,
    { data }
  );
};

/**
 * Request to enable/disable playground for a database.
 */
export const turnDatabaseOff = (params: DatabaseContext) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/off`);
};

/**
 * Request to enable/disable playground for a database.
 */
export const turnDatabaseOn = (params: DatabaseContext) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/on`, {
    data: {
      turnOnAppService: true,
    },
  });
};

/**
 * Request to enable/disable playground for a database.
 */
export const resumeDatabase = (params: DatabaseContext) => {
  return postRequest<{}>(`/v2/organizations/${params.organizationId}/projects/${params.projectId}/clusters/${params.databaseId}/resume`);
};
