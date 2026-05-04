const fs = require('fs');
const { minify } = require('./minify.js');

let code = fs.readFileSync('./x-memo.js', 'utf8');
let minified = minify(code);
// The minified code might have a trailing semicolon, but we'll wrap it in a function anyway.
let jsURL = `javascript:(function(){${minified}})();`;

let html = fs.readFileSync('./index.html', 'utf8');

const startTag = '<script id="xmemo-code" type="text/plain">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag) + startTag.length;
const endIndex = html.indexOf(endTag, startIndex);
const newHtml = html.slice(0, startIndex) + jsURL + html.slice(endIndex);

fs.writeFileSync('./index.html', newHtml);
console.log('Updated index.html with minified x-memo.js');