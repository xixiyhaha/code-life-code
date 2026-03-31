import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

function extractFirstImage(content: string) {
  const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
  return imgMatch ? imgMatch[1] : null;
}

export const dynamic = "force-dynamic";

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
                  href={`/tags/${encodeURIComponent(tag)}`}
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
                  href={`/post/${post.slug}`}
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
                      {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
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
}