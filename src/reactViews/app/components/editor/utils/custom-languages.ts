import { CustomLanguage, SupportedLanguage } from 'components/editor/editor.types';
import { registerCustomJava } from 'components/editor/languages/custom/custom-java';
import { registerN1QL } from 'components/editor/languages/custom/n1ql';
import { registerSqlPlusPlus } from 'components/editor/languages/custom/sql-plus-plus';
import { LanguageRegistrar, SchemaDoc } from 'components/editor/languages/types';

const GENERATED_LANGUAGES: { [key in CustomLanguage]: LanguageRegistrar } = {
  N1QL: registerN1QL,
  SqlPlusPlus: registerSqlPlusPlus,
  CustomJava: registerCustomJava,
};

export const isCustomLanguage = (language: SupportedLanguage): language is CustomLanguage => language in GENERATED_LANGUAGES;

export const generateSchema = (language: CustomLanguage, schemaDoc?: SchemaDoc) => {
  const languageRegistrar = GENERATED_LANGUAGES[language];

  return languageRegistrar.schema(schemaDoc);
};

export const generateLanguage = (language: CustomLanguage, schemaDoc?: SchemaDoc) => {
  const languageRegistrar = GENERATED_LANGUAGES[language];

  return languageRegistrar.language(schemaDoc);
};
