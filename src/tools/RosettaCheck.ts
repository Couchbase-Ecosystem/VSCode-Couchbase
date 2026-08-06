/*
 *     Copyright 2011-2025 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import * as childProcess from "child_process";
import * as vscode from "vscode";
import { logger } from "../logger/logger";

export interface RosettaRunResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    /** True when the process failed to start or crashed, as opposed to reporting violations. */
    crashed: boolean;
    errorMessage?: string;
}

/**
 * Thin wrapper that runs the rosetta-check compatibility analyzer.
 *
 * The analyzer scans the process working directory (it detects the project layout
 * relative to `cwd`), fetches rule definitions from an optional base URL, and prints
 * one line per violation to STDERR in the form:
 *   <source file> [<startLine>:<startCol> .. <endLine>:<endCol>] — <message>
 * Its exit code equals the number of violations found.
 */
export class RosettaCheck {
    /**
     * @param executablePath a native rosetta-check binary, or a `.jar` (run via `java -jar`)
     * @param projectRoot    directory to scan; used as the child process cwd
     * @param rulesBaseUrl   optional base URL for `<baseUrl>/<language>.yaml`; bundled rules are used when omitted
     * @param token          optional cancellation token; cancelling kills the child process
     * @param javaPath       optional path to a `java` executable used to run a `.jar`; falls back to `java` on PATH
     * @param onLine         optional callback invoked for each complete output line as it streams in
     */
    static run(
        executablePath: string,
        projectRoot: string,
        rulesBaseUrl: string | undefined,
        token?: vscode.CancellationToken,
        javaPath?: string,
        onLine?: (line: string, channel: "stdout" | "stderr") => void
    ): Promise<RosettaRunResult> {
        const isJar = executablePath.toLowerCase().endsWith(".jar");
        const java = javaPath && javaPath.trim().length > 0 ? javaPath.trim() : "java";
        const command = isJar ? java : executablePath;
        const args: string[] = isJar ? ["-jar", executablePath] : [];
        // rosetta-check disables each rule unless it declares `enabled: true`; the
        // `-d` flag runs every rule in the provided rule set regardless (verified
        // empirically — the flag's name is "default-disable-rules" but it enables them).
        args.push("-d");
        // The rules base URL is a REQUIRED positional argument for this build.
        if (rulesBaseUrl && rulesBaseUrl.trim().length > 0) {
            args.push(rulesBaseUrl.trim());
        }

        logger.info(`Running rosetta-check: ${command} ${args.join(" ")} (cwd: ${projectRoot})`);

        return new Promise<RosettaRunResult>((resolve) => {
            let child: childProcess.ChildProcessWithoutNullStreams;
            try {
                child = childProcess.spawn(command, args, { cwd: projectRoot });
            } catch (e) {
                resolve({ stdout: "", stderr: "", exitCode: null, crashed: true, errorMessage: `${e}` });
                return;
            }

            let stdout = "";
            let stderr = "";
            let stdoutRemainder = "";
            let stderrRemainder = "";

            // Accumulate the full output while also emitting complete lines as they arrive.
            const pump = (chunk: Buffer, channel: "stdout" | "stderr") => {
                const text = chunk.toString();
                if (channel === "stderr") {
                    stderr += text;
                } else {
                    stdout += text;
                }
                const combined = (channel === "stderr" ? stderrRemainder : stdoutRemainder) + text;
                const lines = combined.split(/\r?\n/);
                const remainder = lines.pop() ?? "";
                if (channel === "stderr") {
                    stderrRemainder = remainder;
                } else {
                    stdoutRemainder = remainder;
                }
                if (onLine) {
                    for (const line of lines) {
                        onLine(line, channel);
                    }
                }
            };

            child.stdout.on("data", (d) => pump(d, "stdout"));
            child.stderr.on("data", (d) => pump(d, "stderr"));

            const cancelSub = token?.onCancellationRequested(() => child.kill());

            child.on("error", (err) => {
                cancelSub?.dispose();
                const isMissing = (err as NodeJS.ErrnoException).code === "ENOENT";
                const errorMessage = isJar && isMissing
                    ? "Java runtime not found on PATH. Install Java 17+, or configure a native rosetta-check binary in 'couchbase.rosetta.executablePath'."
                    : `Failed to start rosetta-check: ${err.message}`;
                resolve({ stdout, stderr, exitCode: null, crashed: true, errorMessage });
            });

            child.on("close", (code) => {
                cancelSub?.dispose();
                // Flush any trailing partial lines that had no terminating newline.
                if (onLine) {
                    if (stdoutRemainder.length > 0) {
                        onLine(stdoutRemainder, "stdout");
                    }
                    if (stderrRemainder.length > 0) {
                        onLine(stderrRemainder, "stderr");
                    }
                }
                // A Java stack trace on stderr means the analyzer itself failed
                // (e.g. an unreachable rules URL) — that is not a set of violations.
                const crashed = /Exception in thread|\n\s*at [\w.$]+\([^)]*:\d+\)|Missing required parameter|Unmatched argument|Unknown option/.test(stderr);
                resolve({ stdout, stderr, exitCode: code, crashed });
            });
        });
    }
}
