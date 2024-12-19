export const matchSuggestion = (text: string) => (opts: string[]) =>
  opts.some((o) => {
    return !o.toLowerCase().includes(text.toLowerCase());
  });

export const matchSchemaSuggestion = (doc: string, text: string) => {
  if (!doc) {
    return false;
  }

  return (
    text
      .replace(/`/g, '')
      .split(' ')
      .filter((t) => doc.includes(t)).length > 0

    // TODO: Better Case Sensitivity (match lowercase to uppercase schema and vice versa)
  );
};

export const sortSuggestionLower = (v: string) => `z ${v}`;
export const sortSuggestionHigher = (v: string) => `A ${v}`;

export const multiWhiteSpaceRegex = / +(?= )/g;
export const backticksRegex = /`/g;

export const needsBackticks = (value: string) => /[^a-zA-Z\d.]/.test(value);

export const formatSuggestion = (value: string) => {
  if (/[^a-zA-Z\d]/.test(value)) {
    return `\`${value.replace(backticksRegex, '')}\``;
  }
  return value;
};
