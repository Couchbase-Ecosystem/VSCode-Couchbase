import { loader } from '@monaco-editor/react';
import { CustomLanguage } from 'components/editor/editor.types';
import * as monaco from 'monaco-editor';
import { generateLanguage } from './custom-languages';

loader.config({ monaco });

// IMPORTANT: remember to include any other custom language here
const CUSTOM_LANGUAGES: CustomLanguage[] = ['N1QL', 'SqlPlusPlus', 'CustomJava'];
Object.values(CUSTOM_LANGUAGES).forEach((language) => {
  generateLanguage(language);
});
