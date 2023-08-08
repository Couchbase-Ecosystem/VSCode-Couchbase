export type GoofResponse = {
  errorType: string;
  message: string;
};

export type RbacResponse<T> = {
  data: T;
  permissions: PermissionRecord;
  resources?: { [key: string]: PermissionRecord };
};

export type RbacArrayResponse<T> = {
  data: T[];
  permissions: PermissionRecord;
  resources?: { [key: string]: PermissionRecord };
};

export type RbacListResponse<T> = {
  cursor: {
    pages: PaginationResponse;
    href?: {};
  };
  data: T[];
  permissions: PermissionRecord;
  resources?: { [key: string]: PermissionRecord };
};

export type PaginationResponse = {
  last?: number;
  next?: number;
  page?: number;
  perPage: number;
  previous?: number;
  totalItems?: number;
};

export type PermissionRecord = {
  create: {
    accessible: boolean;
    reason?: string;
  };
  delete: {
    accessible: boolean;
    reason?: string;
  };
  read: {
    accessible: boolean;
    reason?: string;
  };
  update: {
    accessible: boolean;
    reason?: string;
  };
};
