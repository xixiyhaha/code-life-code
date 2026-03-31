import Link from "next/link";
import { getAllPosts, getAboutData } from "@/lib/posts";
import { PostItem } from "@/components/home/PostItem";
import { AdminClientWrapper } from "@/components/home/AdminClientWrapper";
import { StatsPanel } from "@/components/home/StatsPanel";
import { Megaphone } from "lucide-react";

export async function HomeTemplate({ showAdminControls = false }: { showAdminControls?: boolean }) {
  // 服务端拉取数据
  const allPosts = await getAllPosts();
  const posts = allPosts.filter(p => p.type !== 'announcement');
  const announcements = allPosts.filter(p => p.type === 'announcement');
  const latestAnnouncement = announcements[0];
  const aboutData = await getAboutData();

  const recentLongPosts = posts.filter(p => p.type === 'post').slice(0, 5);
  const allTags = Array.from(new Set(
    posts.filter(p => p.type === 'post').flatMap(p => p.tags || [])
  ));

  return (
    <div className="pt-24 pb-20 px-4 max-w-[1400px] mx-auto min-h-screen relative grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] gap-8 lg:gap-10">
      {/* Left Sidebar */}
      <div className="hidden lg:flex flex-col gap-8">
        <div className="sticky top-24">
          <div className="mb-10 flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <Link href={showAdminControls ? "/admin/about" : "/about"} className="group flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-blue-500 transition-all">
                <img src={aboutData.avatar || "https://avatars.githubusercontent.com/xixiyhaha"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">{aboutData.name}</h2>
            </Link>
            <p className="text-sm text-gray-500 text-center mt-3 line-clamp-2">{aboutData.description}</p>
            <div className="flex gap-3 mt-5">
              {aboutData.github && (
                <a href={aboutData.github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-medium rounded-full transition-colors flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </a>
              )}
              {aboutData.email && (
                <a href={"mailto:" + aboutData.email} className="px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded-full transition-colors flex items-center gap-2">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  Email
                </a>
              )}
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">最近长文</h3>
          <div className="flex flex-col gap-3">
            {recentLongPosts.length === 0 ? (
               <span className="text-sm text-gray-400">暂无长文</span>
            ) : (
              recentLongPosts.map(p => (
                <Link key={p.slug} href={`/post/${p.slug}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors text-sm line-clamp-2">
                  {p.title || '无标题'}
                </Link>
              ))
            )}
          </div>

          {allTags.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">标签聚合</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                   <Link key={tag} href={`/tags/${tag}`} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors border border-gray-200 dark:border-gray-700/50">
                     #{tag}
                   </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0 max-w-3xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 p-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            空空如也，快去发布你的第一条碎碎念吧！
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostItem key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex flex-col gap-8">
        <div className="sticky top-24">
          {/* 公告板 (置于最上方) */}
          <div className="mb-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] border border-blue-100/50 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Megaphone className="w-4 h-4 animate-pulse" />
              </div>
              <Link href="/announcements" className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide hover:text-blue-600 transition-colors">博客公告</Link>
            </div>
            
            {latestAnnouncement ? (
              <Link href={`/post/${latestAnnouncement.slug}`} className="group block">
                <h4 className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                  {latestAnnouncement.title || "无标题公告"}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(latestAnnouncement.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1 font-medium">
                    阅读详情 <span className="text-[10px]">→</span>
                  </span>
                </div>
              </Link>
            ) : (
              <div className="text-sm text-gray-500 mt-2">暂无公告 / 站长还在码字中...</div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">博客概况</h3>
             <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">文章总数</span>
                  <span className="font-medium text-gray-900 dark:text-white">{posts.length} 篇</span>
                </div>
                <StatsPanel />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">最近更新</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {posts.length > 0 ? new Date(posts[0].date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '暂无'}
                  </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 仅当处于管理页时挂载发布表单 */}
      {showAdminControls && <AdminClientWrapper />}
    </div>
  );
}

