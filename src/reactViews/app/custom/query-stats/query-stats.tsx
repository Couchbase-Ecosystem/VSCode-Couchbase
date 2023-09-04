import { clsx } from "clsx";
import type { QueryStatsProps } from "./query-stats.types";
import successImage from "../../images/success.svg";
import errorImage from "../../images/error.svg";
import "./query-stats.scss";

const statusColors = {
  success: "text-on-success-decoration fill-on-success-decoration",
  fatal: "text-on-error-decoration fill-on-error-decoration",
};

export function QueryStats({
  queryStatus,
  rtt,
  elapsed,
  executionTime,
  numDocs,
  size,
  className,
}: QueryStatsProps) {
  return (
    <div className={clsx("flex space-x-2", className, "query-stats")}>
      {queryStatus !== undefined && (
        <span
          className={clsx(statusColors[queryStatus])}
          style={{
            display: "inline-flex",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            justifySelf: "center",
          }}
        >
          <img
            src={queryStatus === "success" ? successImage : errorImage}
            height="13px"
            width="13px"
            className={clsx(statusColors[queryStatus], "mr-1")}
          />
          {queryStatus}
        </span>
      )}

      {rtt !== undefined && (
        <>
          <span className="query-stats-text">|</span>
          <p
            title={`Round-Trip Time (RTT) is the total time taken to send a request and receive a response from the server`}
            className="query-stats-text"
          >
            <b>RTT:</b> {rtt}
          </p>
        </>
      )}
      {size !== undefined && (
        <>
          <span className="query-stats-text">|</span>
          <p
            title={`Round-Trip Time (RTT) is the total time taken to send a request and receive a response from the server`}
            className="query-stats-text"
          >
            <b>SIZE:</b> {size}
          </p>
        </>
      )}
      {elapsed !== undefined && (
        <>
          <span className="query-stats-text">|</span>
          <p
            title={`Round-Trip Time (RTT) is the total time taken to send a request and receive a response from the server`}
            className="query-stats-text"
          >
            <b>ELAPSED:</b> {elapsed}
          </p>
        </>
      )}
      {executionTime !== undefined && (
        <>
          <span className="query-stats-text">|</span>
          <p className="query-stats-text">
            <b>EXECUTION:</b> {executionTime}
          </p>
        </>
      )}
      {numDocs !== undefined && (
        <>
          <span className="query-stats-text">|</span>
          <p className="query-stats-text">
            <b>DOCS:</b> {numDocs}
          </p>
        </>
      )}
    </div>
  );
}
