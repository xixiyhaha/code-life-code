const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/config/nav.ts';
const content = `export const navConfigs = [
  { name: '首页', href: '/home' },
  { name: '归档', href: '/archive' },
  { name: '友链', href: '/friends' }
];`;
fs.writeFileSync(file, content);
