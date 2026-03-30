const fs = require('fs');
const path = require('path');

// 1. Update Navigation
const navFile = 'D:/Desktop/博客/code-life-blog/config/nav.ts';
const navContent = `export const navConfigs = [
  { name: '首页', href: '/home' },
  { name: 'Blog', href: '/blog' },
  { name: 'Plog', href: '/plog' },
  { name: '友链', href: '/friends' }
];`;
fs.writeFileSync(navFile, navContent);

// 2. Setup the Blog directory (Long posts)
const blogDir = 'D:/Desktop/博客/code-life-blog/app/blog';
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

const blogPage = `import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

function extractFirstImage(content: string) {
  const imgMatch = content.match(/!\\[.*?\\]\\((.*?)\\)/);
  return imgMatch ? imgMatch[1] : null;
}

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllPosts();
  const longPosts = posts.filter(p => p.type === 'post');
  const allTags = Array.from(new Set(longPosts.flatMap(p => p.tags || [])));

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col gap-10">
        {/* 标签墙 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🏷️ 归档标签
          </h2>
          {allTags.length === 0 ? (
             <div className="text-sm text-gray-500">暂无标签</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Link 
                  key={tag} 
                  href={\`/tags/\${encodeURIComponent(tag)}\`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 hover:border-blue-300 hover:shadow-sm dark:hover:border-blue-500/50 text-gray-700 dark:text-gray-300 text-sm rounded-full transition-all"
                >
                  # {tag}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 长文块 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">我的长文</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
              {longPosts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {longPosts.length === 0 ? (
              <div className="text-gray-500 text-sm">暂无长文</div>
            ) : (
              longPosts.map(post => (
                <Link
                  key={post.slug}
                  href={\`/post/\${post.slug}\`}
                  className="group flex flex-col p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* 缩略图 */}
                  {(() => {
                    const thumb = extractFirstImage(post.content);
                    if (thumb) {
                      return (
                        <div className="w-full h-36 mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700/50 shrink-0">
                          <img src={thumb} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    {post.title || '无标题'}
                  </h3>
                  <div className="text-sm text-gray-500 mt-2 mb-4 line-clamp-3 leading-relaxed flex-1">
                    {post.content.replace(/#|<[^>]+>/g, '').substring(0, 100)}...
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\\//g, '-')}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="font-medium text-blue-500/80">
                        #{post.tags[0]}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(blogDir, 'page.tsx'), blogPage);


// 3. Setup the Plog directory (Moments/Notes)
const plogDir = 'D:/Desktop/博客/code-life-blog/app/plog';
if (!fs.existsSync(plogDir)) fs.mkdirSync(plogDir, { recursive: true });

const plogPage = `import { getAllPosts, getAboutData } from "@/lib/posts";
import { PostItem } from "@/components/home/PostItem";

export const revalidate = 60;

export default async function PlogPage() {
  const posts = await getAllPosts();
  const notes = posts.filter(p => p.type === 'note');
  const aboutData = await getAboutData();

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto min-h-screen">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-gray-100 dark:ring-gray-800 shadow-sm relative">
           <img src={aboutData.avatar || "https://avatars.githubusercontent.com/xixiyhaha"} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plog · 碎碎念</h1>
        <p className="text-sm text-gray-500 mt-2">分享日常与瞬间 ({notes.length})</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 p-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          空空如也，快去发布你的第一条朋友圈吧！
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {notes.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}`;
fs.writeFileSync(path.join(plogDir, 'page.tsx'), plogPage);

// 4. Delete old archive directory
const archiveDir = 'D:/Desktop/博客/code-life-blog/app/archive';
if (fs.existsSync(archiveDir)) {
  fs.rmSync(archiveDir, { recursive: true, force: true });
}

console.log("Migration complete!");
