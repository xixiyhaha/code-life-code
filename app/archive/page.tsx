import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

function extractFirstImage(content: string) {
  const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
  return imgMatch ? imgMatch[1] : null;
}

export const revalidate = 60; // ISR cache

export default async function ArchivePage() {
  const posts = await getAllPosts();

  const longPosts = posts.filter(p => p.type === 'post');
  const notes = posts.filter(p => p.type === 'note');

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-col gap-12">
        {/* 长文块 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">我的长文</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
              {longPosts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {longPosts.length === 0 ? (
              <div className="text-gray-500 text-sm">暂无长文</div>
            ) : (
              longPosts.map(post => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  className="group flex flex-col p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  {/* 缩略图提取与显示 */}
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
                  })()}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {post.title || '无标题'}
                  </h3>
                  <div className="text-sm text-gray-500 mt-2 mb-4 line-clamp-2 leading-relaxed">
                    {post.content.replace(/#|<[^>]+>/g, '').substring(0, 100)}...
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        #{post.tags[0]}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 碎碎念块 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">碎碎念</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
              {notes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.length === 0 ? (
              <div className="text-gray-500 text-sm">暂无动态</div>
            ) : (
              notes.map(note => (
                <Link
                  key={note.slug}
                  href={`/post/${note.slug}`}
                  className="block p-5 bg-orange-50/50 dark:bg-[#1e293b]/50 rounded-2xl border border-orange-100/50 dark:border-slate-700/50 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed mb-3">
                    {note.content}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(note.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
