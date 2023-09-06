import * as vscode from 'vscode';

export const sqlppFormatter = (document: vscode.TextDocument): vscode.TextEdit[] => {
    const fullText = document.getText();
    const formattedText = processText(fullText, 4);
    const textEdit = new vscode.TextEdit(
        new vscode.Range(
            document.positionAt(0),
            document.positionAt(fullText.length)
        ),
        formattedText
    );
    return [textEdit];
};

function processText(text: string, step: number): string {
    const arByQuote = text.replace(/\s{1,}/g, " ").replace(/'/g, "~::~'").split("~::~");
    let len = arByQuote.length;
    const ar: string[] = [];
    let deep = 0;
    let parenthesisLevel = 0;
    let strArray: string[] = [];
    let ix = 0;
    const shift = createShiftArr(step);

    for (ix = 0; ix < len; ix++) {
        if (ix % 2 !== 0) {
            ar.push(arByQuote[ix]);
        } else {
            const parts = splitN1ql(arByQuote[ix], getSpaces(step));
            ar.push(...parts);
        }
    }

    const selectPattern = /\s*SELECT\s*/i;
    const setPattern = /\s*SET\s*/i;
    const selectParenthesisPattern = /\s*\(\s*SELECT\s*/i;
    const singleQuotePattern = /'/g;

    len = ar.length;
    for (ix = 0; ix < len; ix++) {
        parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);

        if (selectPattern.test(ar[ix])) {
            ar[ix] = ar[ix].replace(",", `,\n${getSpaces(step)}${getSpaces(step)}`);
        }

        if (setPattern.test(ar[ix])) {
            ar[ix] = ar[ix].replace(",", `,\n${getSpaces(step)}${getSpaces(step)}`);
        }

        if (selectParenthesisPattern.test(ar[ix])) {
            deep++;
            strArray.push(shift[deep]);
            strArray.push(ar[ix]);
        } else if (singleQuotePattern.test(ar[ix])) {
            if (parenthesisLevel < 1 && deep > 0) {
                deep--;
            }
            strArray.push(ar[ix]);
        } else {
            strArray.push(shift[deep]);
            strArray.push(ar[ix]);
            if (parenthesisLevel < 1 && deep > 0) {
                deep--;
            }
        }
    }
    strArray = strArray.join('\n').replace(/^\n+/, '').replace(/\n+/g, '\n').split('\n');
    let resultStr = '';
    for (let currStr of strArray) {
        resultStr += currStr + '\n';
    }
    return resultStr;
}


function splitN1ql(str: string, tab: string): string[] {
    return str.replace(/\s+/g, " ")
        .replace(/ AND /ig, "~::~" + tab + tab + "AND ")
        .replace(/ BETWEEN /gi, "~::~" + tab + "BETWEEN ")
        .replace(/ CASE /gi, "~::~" + tab + "CASE ")
        .replace(/ ELSE /gi, "~::~" + tab + "ELSE ")
        .replace(/ END /gi, "~::~" + tab + "END ")
        .replace(/ FROM /gi, "~::~FROM ")
        .replace(/ GROUP\s+BY/gi, "~::~GROUP BY ")
        .replace(/ HAVING /gi, "~::~HAVING ")
        .replace(/ IN /gi, " IN ")
        .replace(/ JOIN /gi, "~::~JOIN ")
        .replace(/ CROSS~::~+JOIN /gi, "~::~CROSS JOIN ")
        .replace(/ INNER~::~+JOIN /gi, "~::~INNER JOIN ")
        .replace(/ LEFT~::~+JOIN /gi, "~::~LEFT JOIN ")
        .replace(/ RIGHT~::~+JOIN /gi, "~::~RIGHT JOIN ")
        .replace(/ ON /gi, "~::~" + tab + "ON ")
        .replace(/ OR /gi, "~::~" + tab + tab + "OR ")
        .replace(/ ORDER\s+BY/gi, "~::~ORDER BY ")
        .replace(/ OVER /gi, "~::~" + tab + "OVER ")
        .replace(/\(\s*SELECT /gi, "~::~(SELECT ")
        .replace(/\)\s*SELECT /gi, ")~::~SELECT ")
        .replace(/ THEN /gi, " THEN~::~" + tab)
        .replace(/ UNION /gi, "~::~UNION~::~")
        .replace(/ USING /gi, "~::~USING ")
        .replace(/ WHEN /gi, "~::~" + tab + "WHEN ")
        .replace(/ WHERE /gi, "~::~WHERE ")
        .replace(/ WITH /gi, "~::~WITH ")
        .replace(/ ALL /gi, " ALL ")
        .replace(/ AS /gi, " AS ")
        .replace(/ ASC /gi, " ASC ")
        .replace(/ DESC /gi, " DESC ")
        .replace(/ DISTINCT /gi, " DISTINCT ")
        .replace(/ EXISTS /gi, " EXISTS ")
        .replace(/ NOT /gi, " NOT ")
        .replace(/ NULL /gi, " NULL ")
        .replace(/ LIKE /gi, " LIKE ")
        .replace(/\s*SELECT /gi, "SELECT ")
        .replace(/\s*UPDATE /gi, "UPDATE ")
        .replace(/ SET /gi, " SET ")
        .replace(/~::~+/g, "~::~")
        .split("~::~");
}


function isSubquery(str: string, parenthesisLevel: number): number {
    return parenthesisLevel - (str.replace(/\(/g, "").length - str.replace(/\)/g, "").length);
}

function getSpaces(numSpaces: number): string {
    return " ".repeat(Math.max(0, numSpaces));
}

function createShiftArr(step: number): string[] {
    const space = getSpaces(step);
    const shift: string[] = ['\n'];

    for (let ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space);
    }

    return shift;
}

