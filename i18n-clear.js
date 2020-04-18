const fs = require('fs');
const data = fs.readFileSync('./src/locale/messages.generated.xlf').toString();
const contentToRemoveRegexp = /<context-group (purpose="location"){1}>([.\s\S])+?<\/context-group>/g;
let replaced = data.replace(contentToRemoveRegexp, '');
replaced = replaced.replace(/(\n\s*?\n)\s*\n/g, '$1');
fs.writeFileSync('./src/locale/messages.generated.xlf', replaced);
