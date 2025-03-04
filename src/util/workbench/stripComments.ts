export function stripComments(query: string) {
    const SQL_COMMENT_REGEXP = /--.*$|\/\*[\s\S]*?\*\/|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/gm;
  
    return query
      .replace(SQL_COMMENT_REGEXP, (_match, capturedString) => {
        // If it's a string: don't remove it
        if (capturedString) {
          return capturedString;
        }
  
        // Otherwise, it's a comment: remove it
        return '';
      })
      .trim();
  }
  