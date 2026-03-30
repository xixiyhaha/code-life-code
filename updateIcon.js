const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/components/ui/ThemeToggle.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 focus:outline-none"',
  'className="p-2 rounded-xl text-blue-100 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none"'
);
c = c.replace(/className="w-5 h-5 text-blue-100 dark:text-slate-300 hover:text-white dark:hover:text-white"/g, 'className="w-5 h-5"');

fs.writeFileSync(file, c);
