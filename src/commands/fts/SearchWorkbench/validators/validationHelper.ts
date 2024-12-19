import * as vscode from "vscode";

export class ValidationHelper {
    // Generates a map of JSON keys to their positions in the document
    static getPositionMap(
        document: vscode.TextDocument,
    ): Map<string, vscode.Range> {
        const positionMap = new Map<string, vscode.Range>();
        const regex = /"(\w+)"\s*:/g;
        const text = document.getText();
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            positionMap.set(match[1], new vscode.Range(startPos, endPos));
        }
        return positionMap;
    }

    static diagnosticExists(
        diagnosticsList: vscode.Diagnostic[],
        newDiagnostic: any,
    ) {
        return diagnosticsList.some(
            (diagnostic) => diagnostic.message === newDiagnostic.message,
        );
    }

    static getUnexpectedAttributeMessage(
        attribute: string,
        context: string,
    ): string {
        return `Unexpected attribute '${attribute}' under '${context}' object`;
    }

    static getUnexpectedAttributeMessageForQuery(
        attribute: string,
        context: string,
    ): string {
        return `Unexpected attribute '${attribute}' for a  '${context}' query`;
    }

    static missingRequiredAttributeQuery(
        missingField: string,
        target: string,
    ): string {
        return `Missing required attribute(s) '${missingField}' for query ${target}`;
    }

    static getExpectedArrayLengthMessage(
        key: string,
        expectedLength: number,
        actualLength: number,
    ): string {
        return `Expected an array of length ${expectedLength} for '${key}', got length ${actualLength}`;
    }

    static getExpectedObjectPropertiesMessage(key: string): string {
        return `Expected an object with 'lat' and 'lon' properties for '${key}'`;
    }

    static getExpectedLatLonMessage(target: string): string {
        return `Each item of the array must be in the format 'lat,lon' for '${target}]'`;
    }

    static getExpectedArrayOrObjectMessage(
        key: string,
        actualType: string,
    ): string {
        return `Expected an array or object for '${key}', found type ${actualType}`;
    }

    static getInvalidDistanceUnitErrorMessage(
        key: string,
        validUnits: string[],
    ): string {
        return `Invalid distance unit for '${key}'. Expected units: ${validUnits.join(
            ", ",
        )}`;
    }

    static getMissingAttributeMessage(
        attribute: string,
        context: string,
    ): string {
        return `The attribute '${attribute}' is required under '${context}' object and must occur exactly once`;
    }

    static getSingleOccurrenceMessage(
        attribute: string,
        context: string,
    ): string {
        return `The attribute '${attribute}' must not appear more than once under '${context}'`;
    }

    static getMustConjunctsErrorMessage(): string {
        return "A single 'conjuncts' attribute is expected inside 'must'";
    }

    static getShouldErrorMessage(): string {
        return "Either a single 'disjuncts' attribute or both 'disjuncts' and 'min' attributes are expected inside 'should'";
    }

    static getMustNotDisjunctsErrorMessage(): string {
        return "A single 'disjuncts' attribute is expected inside 'must_not'";
    }

    static getResultErrorMessage(): string {
        return "The value of the 'result' attribute must be 'complete'";
    }

    static getLevelValuesErrorMessage(): string {
        return "The value of the 'level' attribute must be 'at_plus' or 'not_bounded'";
    }

    static getExpectedDataTypeErrorMessage(
        expectedType: string,
        key: string,
    ): string {
        return `Expected ${expectedType} for property '${key}`;
    }

    static getRelationErrorMessage(): string {
        return "'relation' can only be 'intersects', 'contains' or 'within'";
    }

    static getStyleValuesErrorMessage(): string {
        return "The value of the 'style' attribute must be 'ansi' or 'html'";
    }

    static getMatchAllNoneNoAttributeErrorMessage(attribute: string): string {
        return `No attributes are allowed under ${attribute} in 'match_all' or 'match_none'.`;
    }

    static getUnexecptedAttributeAtTopLevel(attribute: string): string {
        return `Unexpected attribute ${attribute} at the top level`;
    }

    static getRequiredQueryKnnErrorMessage(): string {
        return "'query' and/or 'knn' attributes are expected at the top level";
    }
}
