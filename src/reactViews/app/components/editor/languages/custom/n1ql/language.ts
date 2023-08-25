import { LanguageWords } from 'components/editor/languages/types';
import * as monaco from 'monaco-editor';
import {
  builtinConstants,
  builtinFunctions,
  keywords,
  lowerBuiltinConstants,
  lowerBuiltinFunctions,
  lowerKeywords,
  operators,
} from './definitions';

export const completions: LanguageWords = [
  {
    kind: monaco.languages.CompletionItemKind.Keyword,
    wordsToMatch: lowerKeywords,
    words: keywords,
  },
  {
    kind: monaco.languages.CompletionItemKind.Function,
    wordsToMatch: lowerBuiltinFunctions,
    words: builtinFunctions,
  },
  {
    kind: monaco.languages.CompletionItemKind.Constant,
    wordsToMatch: lowerBuiltinConstants,
    words: builtinConstants,
  },
];

export const conf: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '--',
    blockComment: ['/*', '*/'],
  },
  brackets: [['(', ')']],
  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
    { open: '[', close: ']' },
  ],
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
    { open: '[', close: ']' },
  ],
};

export const lang: monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.n1ql',
  ignoreCase: true,
  brackets: [{ open: '(', close: ')', token: 'delimiter.parenthesis' }],
  keywords,
  operators,
  builtinFunctions,
  builtinVariables: builtinConstants,
  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@string' },
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [
        /[\w@#$]+/,
        {
          cases: {
            '@operators': 'operator',
            '@builtinVariables': 'keyword',
            '@builtinFunctions': 'keyword',
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
      [/[<>=!%&+\-/|~^]/, 'operator'],
    ],
    whitespace: [[/\s+/, 'white']],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }],
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment'],
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
    ],
    string: [
      [/"([^"]*)"/, 'string'],
      [/"([^"]*)/, 'string'],
      [/'([^']*)'/, 'string'],
      [/'([^']*)/, 'string'],
      [/`([^`]*)`/, 'identifier'],
      [/`([^`]*)/, 'identifier'],
    ],
  },
};
