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
import * as path from "path";
import * as vscode from "vscode";

// rosetta-check output line:
//   <source file path> [<startLine>:<startCol> .. <endLine>:<endCol>] — <message>
// The separator is an em dash (U+2014), surrounded by spaces.
// ANTLR reports line numbers as 1-based and column (charPositionInLine) as 0-based.
const VIOLATION_RE = /^(.+?) \[(\d+):(\d+) \.\. (\d+):(\d+)\] — (.+)$/;

export interface RosettaViolation {
    absolutePath: string;
    range: vscode.Range;
    message: string;
}

/** True when a line is a rosetta-check violation (not a parse-error / other noise). */
export function isViolationLine(line: string): boolean {
    return VIOLATION_RE.test(line.trimEnd());
}

/**
 * Parses rosetta-check output into violations. Lines that do not match the
 * expected format (blank lines, stack traces, other noise) are ignored.
 */
export function parseViolations(output: string, projectRoot: string): RosettaViolation[] {
    const violations: RosettaViolation[] = [];
    for (const rawLine of output.split(/\r?\n/)) {
        const match = VIOLATION_RE.exec(rawLine.trimEnd());
        if (!match) {
            continue;
        }
        const [, filePath, sLine, sCol, eLine, eCol, message] = match;
        // Convert ANTLR positions to VSCode's 0-based line/column model.
        const startLine = Math.max(0, parseInt(sLine, 10) - 1);
        const startCol = Math.max(0, parseInt(sCol, 10));
        const endLine = Math.max(0, parseInt(eLine, 10) - 1);
        const endCol = Math.max(0, parseInt(eCol, 10));
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(projectRoot, filePath);
        violations.push({
            absolutePath,
            range: new vscode.Range(startLine, startCol, endLine, endCol),
            message: message.trim(),
        });
    }
    return violations;
}

/**
 * Groups violations into VSCode diagnostics keyed by absolute file path, ready
 * for `DiagnosticCollection.set`. The message is shown on hover and in the
 * Problems panel; it comes straight from the analyzer's rule definition.
 */
export function toDiagnosticsByFile(violations: RosettaViolation[]): Map<string, vscode.Diagnostic[]> {
    const byFile = new Map<string, vscode.Diagnostic[]>();
    for (const violation of violations) {
        const { text, docUrl } = extractDocLink(violation.message);
        const diagnostic = new vscode.Diagnostic(
            violation.range,
            text,
            vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = "Couchbase Rosetta";
        if (docUrl) {
            // Renders as a clickable "View Couchbase docs" link in the hover and Problems panel
            // (a raw URL inside the message text is NOT clickable in the editor hover).
            diagnostic.code = { value: "View Couchbase docs", target: vscode.Uri.parse(docUrl) };
        }
        const existing = byFile.get(violation.absolutePath) ?? [];
        existing.push(diagnostic);
        byFile.set(violation.absolutePath, existing);
    }
    return byFile;
}

/**
 * The analyzer emits a single `message` string, so any documentation link is embedded
 * in it (e.g. "... Please refer to https://... for more."). This lifts the URL out so it
 * can be attached as a clickable diagnostic link, and trims the raw URL from the visible text.
 */
function extractDocLink(message: string): { text: string; docUrl?: string } {
    const match = message.match(/https?:\/\/[^\s)]+/);
    if (!match || match.index === undefined) {
        return { text: message };
    }
    const docUrl = match[0].replace(/[.,;)]+$/, "");
    let text = message
        .slice(0, match.index)
        .replace(/\s*(please refer to|see|learn more:?|more:)\s*$/i, "")
        .trim();
    if (text.length === 0) {
        text = message.trim();
    }
    return { text, docUrl };
}
