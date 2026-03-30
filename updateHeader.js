const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/components/layout/Header.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'className="fixed top-0 inset-x-0 z-50 h-16 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-black/70 backdrop-blur-md"',
  'className="fixed top-0 inset-x-0 z-50 h-16 border-b border-blue-800/50 dark:border-slate-800/50 bg-[#1e40af]/95 dark:bg-slate-900/95 backdrop-blur-md"'
);

c = c.replace('text-gray-900 dark:text-white', 'text-white dark:text-white');
c = c.replace(/'text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400'/g, '"text-sm font-medium transition-colors hover:text-white dark:hover:text-white"');
c = c.replace(/"text-blue-600 dark:text-blue-400"/g, '"text-white font-semibold flex items-center justify-center relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-[2px] after:bg-white"');
c = c.replace(/"text-gray-600 dark:text-gray-400"/g, '"text-blue-200 dark:text-slate-300"');
c = c.replace('bg-gray-300 dark:bg-gray-700', 'bg-blue-700 dark:bg-slate-700');

fs.writeFileSync(file, c);
