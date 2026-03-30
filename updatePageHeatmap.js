const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/app/home/page.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('GithubHeatmap')) {
    c = c.replace(
        'import { HomeClientWrapper } from "./HomeClientWrapper";',
        'import { HomeClientWrapper } from "./HomeClientWrapper";\nimport { GithubHeatmap } from "@/components/home/GithubHeatmap";'
    );
}

// 找到占位的部分并替换
const placeholderStr = `<div className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700/50 text-xs text-gray-400">
              这里以后放 GitHub 式热力图
            </div>`;

c = c.replace(placeholderStr, '<GithubHeatmap username={aboutData.github ? aboutData.github.split("/").pop() : "xixiyhaha"} />');

fs.writeFileSync(file, c);
console.log("Heatmap updated in page.tsx");
