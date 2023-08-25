import { useRef } from 'react';
import './utils/configure-monaco';
import { Editor as BaseEditor, OnChange } from '@monaco-editor/react';
import { Icon } from 'components/icon';
import { Spinner } from 'components/spinner';
import { editor, editor as editorNamespace } from 'monaco-editor';
import { CSSDimension, OnRunHandler, PasteEventHandler, SupportedLanguage, SupportedThemes } from './editor.types';
import type { SchemaDoc } from './languages/types';
import { generateSchema, isCustomLanguage } from './utils/custom-languages';
import { getEditorStyles, getPlayButtonStyles } from './utils/get-styles';
import './styles/editor.scss';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

type EditorProps = {
  editorId?: string;
  language: SupportedLanguage;
  value?: string;
  theme?: SupportedThemes;
  onRun?: OnRunHandler;
  readOnly?: boolean;
  schemaDoc?: SchemaDoc;
  fontSize?: number;
  lineHeight?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  onChange?: OnChange;
  onDidPaste?: PasteEventHandler;
  height?: CSSDimension;
};

export function Editor({
  editorId = 'cb-editor',
  language,
  value = '',
  theme = 'vs-dark',
  onRun,
  readOnly = false,
  schemaDoc,
  fontSize = 16,
  lineHeight = 1.6,
  wordWrap = 'on',
  onChange,
  onDidPaste,
  height = '100px',
}: EditorProps) {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const onEditorMount = (editor: editorNamespace.IStandaloneCodeEditor) => {
    if (schemaDoc && isCustomLanguage(language)) {
      generateSchema(language, schemaDoc).then((dispose) => {
        editor.onDidDispose(dispose);
      });
    }

    editorRef.current = editor;
    if (onDidPaste) {
      editorRef.current.onDidPaste(onDidPaste);
    }
  };

  return (
    <div {...getEditorStyles(theme)}>
      {onRun ? (
        <div className="flex w-full justify-end px-4 pb-2.5">
          <button className={getPlayButtonStyles(theme)} onClick={onRun} type="button">
            <span className="sr-only">Run</span>
            <span className="pl-0.5">
              <Icon name="play" size="large" />
            </span>
          </button>
        </div>
      ) : null}
      <BaseEditor
        className="editor-wrapper"
        height={height}
        theme={theme}
        language={language}
        value={value}
        onChange={onChange}
        wrapperProps={{ id: editorId }}
        onMount={onEditorMount}
        loading={<Spinner size="large" />}
        options={{ readOnly, minimap: { enabled: false }, padding: { top: 4, bottom: 16 }, wordWrap, fontSize, lineHeight }}
        // `options` takes IStandaloneEditorConstructionProps: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions.html
      />
    </div>
  );
}
