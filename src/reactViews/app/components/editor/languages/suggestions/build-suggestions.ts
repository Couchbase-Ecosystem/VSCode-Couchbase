import type { LanguageWords, SchemaDoc } from 'components/editor/languages/types';
import type { languages } from 'monaco-editor';
import { buildSchemaSuggestions } from './build-schema-suggestions';
import { matchSchemaSuggestion, matchSuggestion, multiWhiteSpaceRegex, sortSuggestionHigher, sortSuggestionLower } from './utils';

export const buildSuggestions = async (
  schemaDoc: SchemaDoc | undefined,
  matches: LanguageWords,
  schemaOnly?: boolean
): Promise<languages.CompletionItemProvider> => {
  return {
    triggerCharacters: ['.', ':'],
    provideCompletionItems: async (model, position) => {
      const word = model.getWordUntilPosition(position);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textUntilPosition = model
        .getValueInRange({
          ...range,
          startColumn: 0,
        })
        .replace(multiWhiteSpaceRegex, '');
      // TODO: Better Case Sensitivity (match lowercase to uppercase schema and vice versa)

      // stringify schema document
      const doc = JSON.stringify(schemaDoc);
      const customMatch = matchSchemaSuggestion(doc, textUntilPosition);

      const suggs: languages.CompletionItem[] = [];

      const matchFn = matchSuggestion(textUntilPosition);

      if (!schemaOnly) {
        matches.forEach((match) => {
          const { kind, wordsToMatch, words } = match;

          const newSuggestions = words.map((word) => {
            let filterText = sortSuggestionLower(word);

            const cleanText = textUntilPosition.replace(/`/g, '');
            const cleanTextArr = cleanText.split(' ');
            let insertText = word;

            const sysStr = cleanTextArr.find((t) => t.includes('system'));
            if (sysStr) {
              const sp = sysStr.split(':');

              if (!sp[0] || sp[0] === 'system') {
                const nextInsertTextArr = word.split(':');

                if (nextInsertTextArr.length > 1) {
                  insertText = nextInsertTextArr[nextInsertTextArr.length - 1];
                  filterText = sortSuggestionHigher(insertText);
                }
              }
            }

            return {
              label: word,
              insertText,
              kind,
              range,
              sortText: filterText,
              filterText,
            };
          });

          if (matchFn(wordsToMatch)) {
            suggs.push(...newSuggestions);
          }
        });
      }

      let schemaSuggs: languages.CompletionItem[] = [];

      if (customMatch) {
        schemaSuggs = await buildSchemaSuggestions({
          doc,
          range,
          model,
          text: textUntilPosition,
        });
      }

      return {
        incomplete: false,
        suggestions: [...schemaSuggs, ...suggs],
      };
    },
  };
};
