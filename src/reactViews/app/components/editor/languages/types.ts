import type { languages } from 'monaco-editor';

type DisposeFunction = () => void;

export type LanguageRegistrar = {
  language: (schemaDoc?: SchemaDoc) => Promise<DisposeFunction>;
  schema: (schemaDoc?: SchemaDoc) => Promise<DisposeFunction>;
};

export type LanguageWords = {
  kind: languages.CompletionItemKind;
  wordsToMatch: string[];
  words: string[];
}[];

export type SchemaDoc = {
  /**
   * jsonSchema is as follows:
   * [
   *    // schema
   *   'travel-sample',
   *   'travel-sample.inventory.',
   *   'travel-sample.inventory.airline',
   *   'travel-sample.inventory.hotel',
   *   // attributes
   *   'name',
   *   'callsign',
   *   'country'
   * ]
   */
  jsonSchema: string[];
  indexes: string[];
};
