interface Aliases {
  keyspace: string;
  as: string;
}

export interface Lists {
  buckets: { [key: string]: boolean };
  fields: { [key: string]: boolean };
  indexes?: { [key: string]: boolean };
  aliases: Aliases[];
  total_time?: number;
  warnings?: string[];
  currentKeyspace?: string;
}

export interface Plan {
  operatorId?: string;
  '#operator'?: string;
  operator?: Plan;
  plan?: Plan;
  bucket?: string;
  index_id?: string;
  index_projection?: {};
  namespace?: string;
  scope?: string;
  spans?: [{}];
  using?: string;
  hint_not_followed?: string;
  privileges?: {
    List?: [{}];
  };
  '#time'?: string;
  '#stats'?: {
    execTime?: string;
    servTime?: string;
    '#itemsIn'?: number;
    '#itemsOut'?: number;
    '#phaseSwitches'?: number;
    kernTime?: string;
    state?: string;
    useMemory?: number;
  };
  optimizer_estimates?: {
    cardinality: number;
    cost: number;
    fr_cost: number;
    size: number;
  };
  '#time_normal'?: string;
  '#time_absolute'?: number;
  '~children'?: Plan[];
  '#children'?: Plan[];
  '#child'?: Plan;
  '~child'?: Plan;
  '~versions'?: string[];
  prepared?: {
    operator?: Plan;
  };
  key?: string;
  scan?: Plan;
  insert?: Plan;
  scans?: Plan[];
  delete?: Plan;
  update?: Plan;
  first?: Plan;
  second?: Plan;
  as?: string;
  keyspace?: string;
  index?: string;
  group_keys?: string[];
  condition?: string;
  expr?: string;
  on_keys?: string;
  parallel?: boolean;
  parallelBegin?: boolean;
  parallelEnd?: boolean;
  limit?: string;
  result_terms?: {
    expr: string;
    star?: boolean;
    as?: string;
  }[];
  sort_terms?: {
    expr: string;
  }[];
  keys?: {
    expr: string;
  }[];
  subsequence?: Plan | null;
  predecessor?: Plan | Plan[];
  BranchCount?: () => number;
  Depth?: () => number;
  time?: undefined | number;
  time_percent?: number;
  on_clause?: string;
  variables?: string;
  expressions?: string;
  aggregates?: string[];
}

export type ExecutionPlanNode = {
  children: Array<ExecutionPlanNode>;
  details: Array<string>;
  level: string;
  name: string | null;
  parent: string | null;
  time?: number;
  time_percent?: number;
  tooltip: string;
  cloneOf?: ExecutionPlanNode | null;
  x?: number;
  y?: number;
  x0?: number;
  y0?: number;
};

export type NodeCoordinate = {
  x0: number;
  y0: number;
};

export enum Orientation {
  LeftToRight = 'Left to Right',
  RightToLeft = 'Right to Left',
  TopToBottom = 'Top to Bottom',
  BottomToTop = 'Bottom to Top',
}

export type PlanOptions = {
  orientation: Orientation;
  lineHeight: number;
  compact: boolean;
};
