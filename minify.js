function minify(code) {
  let inString = false;
  let quoteChar = null;
  let escaped = false;
  let result = '';
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    if (!inString) {
      // Handle comments
      if (ch === '/' && i + 1 < code.length) {
        const next = code[i + 1];
        if (next === '/') {
          // Single-line comment: skip until newline
          while (i < code.length && code[i] !== '\n') {
            i++;
          }
          continue; // skip the newline at the end? we'll let the loop handle it
        } else if (next === '*') {
          // Multi-line comment: skip until */
          i += 2;
          while (i < code.length && !(code[i] === '*' && i + 1 < code.length && code[i + 1] === '/')) {
            i++;
          }
          i += 2; // skip the */
          continue;
        }
      }

      // Handle string start
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true;
        quoteChar = ch;
        escaped = false;
        result += ch;
        i++;
        continue;
      }

      // Handle whitespace: collapse multiple whitespace into one space
      if (/\s/.test(ch)) {
        // We'll add a space only if the previous character in result is not a space
        if (result.length === 0 || result[result.length - 1] !== ' ') {
          result += ' ';
        }
        i++;
        continue;
      }

      // Otherwise, add the character
      result += ch;
      i++;
    } else {
      // Inside a string
      if (escaped) {
        escaped = false;
        result += ch;
        i++;
      } else if (ch === '\\') {
        escaped = true;
        result += ch;
        i++;
      } else if (ch === quoteChar) {
        inString = false;
        quoteChar = null;
        result += ch;
        i++;
      } else {
        result += ch;
        i++;
      }
    }
  }

  return result;
}

module.exports = { minify };