const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');

// 1. Check script tag exists with correct id and type
const startTag = '<script id="xmemo-code" type="text/plain">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag);
if (startIndex === -1) {
  console.error('Script tag not found');
  process.exit(1);
}
const endIndex = html.indexOf(endTag, startIndex);
if (endIndex === -1) {
  console.error('Closing script tag not found');
  process.exit(1);
}
const scriptContent = html.slice(startIndex + startTag.length, endIndex).trim();
if (!scriptContent.startsWith('javascript:')) {
  console.error('Script tag content does not start with "javascript:"');
  process.exit(1);
}

// 2. Check that the inline script that sets the href is present (we can do a simple check for the two lines)
const codeLine = "const code = document.getElementById('xmemo-code').textContent.trim();";
const hrefLine = "document.getElementById('xmemo').href = code;";
if (html.indexOf(codeLine) === -1 || html.indexOf(hrefLine) === -1) {
  console.error('Inline script that sets the href not found or changed');
  process.exit(1);
}

console.log('Check passed: script tag and inline script are present and correct.');