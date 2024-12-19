import { loader } from '@monaco-editor/react';
import { CustomLanguage } from 'components/editor/editor.types';
import { buildSuggestions } from 'components/editor/languages/suggestions';
import type { LanguageWords, SchemaDoc } from 'components/editor/languages/types';
import type { languages as languagesNamespace } from 'monaco-editor';

type GetLanguageBuilderConfig = {
  completions: LanguageWords;
  lang: languagesNamespace.IMonarchLanguage;
  conf: languagesNamespace.LanguageConfiguration;
};
type GetSchemaBuilderConfig = Pick<GetLanguageBuilderConfig, 'completions'>;

export const getSchemaBuilder = (languageName: CustomLanguage, { completions }: GetSchemaBuilderConfig) => {
  const generate = async (schemaDoc?: SchemaDoc) => {
    const [monaco, suggestions] = await Promise.all([loader.init(), buildSuggestions(schemaDoc, completions, true)]);
    const disposableResult = monaco.languages.registerCompletionItemProvider(languageName, suggestions);

    return () => {
      disposableResult.dispose();
    };
  };

  return generate;
};

export const getLanguageBuilder = (languageName: CustomLanguage, { completions, conf, lang }: GetLanguageBuilderConfig) => {
  const generate = async (schemaDoc?: SchemaDoc) => {
    const [monaco, suggestions] = await Promise.all([loader.init(), buildSuggestions(schemaDoc, completions, false)]);

    monaco.languages.register({ id: languageName });

    const disposableResults = [
      monaco.languages.setMonarchTokensProvider(languageName, lang),
      monaco.languages.setLanguageConfiguration(languageName, conf),
      monaco.languages.registerCompletionItemProvider(languageName, suggestions),
    ];

    const dispose = () => {
      disposableResults.forEach((disposable) => {
        disposable.dispose();
      });
    };

    return dispose;
  };

  return generate;
};

/**
 *
 * @param words words used to build language, separated with "|" character
 */
export const createKeywordVariants = (words: string) => {
  const SEPARATOR = '|';

  const separatedWords = words.split(SEPARATOR);
  const separatedLowerWords = words.toLowerCase().split(SEPARATOR);

  return [separatedWords, separatedLowerWords] as const;
};
