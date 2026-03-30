const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/components/layout/Header.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('SearchBar')) {
  c = c.replace('import { ThemeToggle } from "../ui/ThemeToggle";', 'import { ThemeToggle } from "../ui/ThemeToggle";\nimport { SearchBar } from "./SearchBar";');
  c = c.replace('<nav className="flex items-center gap-6">', '<nav className="flex items-center gap-4 lg:gap-6">\n          <SearchBar />');
}

fs.writeFileSync(file, c);
