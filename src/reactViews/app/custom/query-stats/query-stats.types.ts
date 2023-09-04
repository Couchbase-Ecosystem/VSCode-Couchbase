import { QueryStatus } from "couchbase";

export interface QueryStatsProps {
  queryStatus: QueryStatus | undefined;
  rtt: string;
  elapsed: string;
  executionTime: string;
  numDocs: number | undefined;
  size: string,
  className?: string;
}
