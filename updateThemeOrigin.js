const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/components/GiscusComments.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/setTheme\("[^"]+"\);/g, 'setTheme(window.location.origin + "/css/giscus-custom.css");');
fs.writeFileSync(file, c);
