const fs = require('fs');
const file = 'D:/Desktop/博客/code-life-blog/app/archive/page.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('extractFirstImage')) {
  c = c.replace('import Link from "next/link";', 
`import Link from "next/link";

function extractFirstImage(content: string) {
  const imgMatch = content.match(/!\\[.*?\\]\\((.*?)\\)/);
  return imgMatch ? imgMatch[1] : null;
}`);

  c = c.replace(
      '{/* 可选缩略图，如果有的话可以加在这个位置，现在用渐变背景做轻量化点缀 */}',
      `{/* 缩略图提取与显示 */}
                  {(() => {
                    const thumb = extractFirstImage(post.content);
                    if (thumb) {
                      return (
                        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700/50 shrink-0">
                          <img src={thumb} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      );
                    }
                    return null;
                  })()}`
  );
}

fs.writeFileSync(file, c);
