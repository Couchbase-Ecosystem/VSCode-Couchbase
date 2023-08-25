/* eslint-disable no-continue */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import type { editor } from 'monaco-editor';
import { languages } from 'monaco-editor';
import { backticksRegex, formatSuggestion, needsBackticks, sortSuggestionHigher } from './utils';

export type BuildSchemaSuggestions = {
  doc: string;
  range: {
    startLineNumber: number;
    endLineNumber: number;
    startColumn: number;
    endColumn: number;
  };
  model: editor.ITextModel;
  text: string;
};

export const buildSchemaSuggestions = async ({ doc, range, model, text }: BuildSchemaSuggestions): Promise<languages.CompletionItem[]> => {
  if (!doc) {
    return [];
  }

  const splitText = text.split(' ');
  const completionItems: languages.CompletionItem[] = [];
  const fullPaths: string[] = [];

  try {
    const parsedDoc = JSON.parse(doc);
    const isObject = (element: unknown): element is { [key: string]: unknown } =>
      typeof element === 'object' && !Array.isArray(element) && element !== null;

    if (isObject(parsedDoc)) {
      for (const key in parsedDoc) {
        const val = parsedDoc[key];

        if (!Array.isArray(val)) {
          return [];
        }

        for (const label of val) {
          if (typeof label !== 'string') {
            break;
          }

          // @TODO: https://couchbasecloud.atlassian.net/browse/AV-39177 Better suggestions for arrays
          const arrSubValues = label.split(/\[.*?\[___editor_array\]\]/);
          if (arrSubValues.length > 1 && arrSubValues[arrSubValues.length - 1]) {
            continue;
          }

          let insertText = label;

          const currLine = model.getLinesContent()[range.endLineNumber - 1].replace(backticksRegex, '').split(' ');
          const keyword = currLine[currLine.length - 1];

          if (keyword.charAt(keyword.length - 1) === '.' && label.includes(keyword)) {
            [, insertText] = label.replace(backticksRegex, '').split(keyword);
          }

          if (needsBackticks(insertText)) {
            const parts = insertText.split('.');

            const newParts = parts.map((part) => {
              if (splitText[splitText.length - 1].includes('`')) {
                return part;
              }

              return formatSuggestion(part);
            });

            insertText = newParts.join('.');
            const filterText = sortSuggestionHigher(insertText.replace(backticksRegex, ''));

            const splitOnPeriods = splitText[splitText.length - 1].split('.');

            if (splitOnPeriods.length > 1) {
              const matched = splitOnPeriods.some((part) => {
                return insertText.includes(part.replace(backticksRegex, ''));
              });

              if (matched) {
                continue;
              }
            }

            fullPaths.push(label);

            completionItems.push({
              label,
              kind: languages.CompletionItemKind.Field,
              insertText,
              range,
              sortText: filterText,
              filterText,
            });

            continue;
          }

          if (splitText.length > 0) {
            let replaced = false;
            for (const text of splitText) {
              const splitOnPeriods = text.split('.');
              if (splitOnPeriods.length > 1) {
                for (const section of splitOnPeriods) {
                  if (section && insertText.includes(section) && section.includes(label.split(/[\\.\s]+/)[0])) {
                    const doesNeedBackticks = needsBackticks(section);

                    insertText = insertText.replace((doesNeedBackticks && formatSuggestion(section)) || `${section}.`, '');

                    const filterText = sortSuggestionHigher(insertText.replace(backticksRegex, ''));

                    completionItems.push({
                      label,
                      kind: languages.CompletionItemKind.Field,
                      insertText,
                      range,
                      sortText: filterText,
                      filterText,
                    });
                    replaced = true;
                  }
                }
              }
            }

            if (replaced) {
              continue;
            }
          }

          const filterText = sortSuggestionHigher(insertText.replace(backticksRegex, ''));

          completionItems.push({
            label,
            kind: languages.CompletionItemKind.Field,
            insertText,
            range,
            sortText: filterText,
            filterText,
          });
        }
      }
    }
  } catch {
    return [];
  }

  let filteredSuggs: languages.CompletionItem[];

  if (text) {
    filteredSuggs = completionItems.filter((completion) => {
      const cleanText = text.replace(backticksRegex, '');
      const cleanTextArr = cleanText.split(' ');
      const completionLabel = completion.label.toString();
      let valid = false;

      valid = cleanTextArr.some((text) => {
        if (completionLabel.includes(text)) {
          const tArr = completionLabel.split(text);
          if (!tArr[0] && tArr[tArr.length - 1]) {
            return true;
          }
        }

        return false;
      });

      if (!valid) {
        const unFinishedIdentifierStatements = cleanTextArr.filter((text) => text.endsWith('.'));

        valid = unFinishedIdentifierStatements.some((text) => {
          const joined = text + completionLabel;
          const found = fullPaths.find((text) => text === joined);

          return found;
        });
      }

      return valid;
    });
  } else {
    filteredSuggs = completionItems;
  }

  return filteredSuggs;
};
