import { editor as editorNamespace } from 'monaco-editor';

export type CustomLanguage = 'N1QL' | 'SqlPlusPlus' | 'CustomJava';

export type SupportedLanguage =
  | CustomLanguage
  | 'json'
  | 'javascript'
  | 'typescript'
  | 'shell'
  // TODO: java version is currently out of date and not recognizing `var` keyword
  // A simple PR to the monaco-editor codebase should fix
  // -> https://github.com/microsoft/monaco-editor/issues/3582
  | 'java'
  | 'python'
  | 'csharp'
  | 'text';

export type SupportedThemes = 'vs-dark' | 'vs-light';

export type OnRunHandler = () => void;

export type PasteEventHandler = (e: editorNamespace.IPasteEvent) => void;

export type CSSDimension = `${number}${
  | 'em'
  | 'ex'
  | 'ch'
  | 'rem'
  | 'vw'
  | 'vh'
  | 'vmin'
  | 'vmax'
  | 'px'
  | 'cm'
  | 'mm'
  | 'in'
  | 'pt'
  | 'pc'
  | '%'}`;
