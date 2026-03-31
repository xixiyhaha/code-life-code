import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { Megaphone, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function AnnouncementsPage() {
  const allPosts = await getAllPosts();
  const announcements = allPosts.filter(p => p.type === 'announcement');

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">历史公告</h1>
          <p className="text-gray-500 text-sm mt-1">共 {announcements.length} 条公告</p>
        </div>
      </div>

      <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 md:ml-6 pl-6 md:pl-8 py-2 space-y-10">
        {announcements.length === 0 ? (
          <div className="text-gray-500 text-sm">暂无公告</div>
        ) : (
          announcements.map((post, i) => (
            <div key={post.slug} className="relative">
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#0a0a0a] border-4 border-blue-500"></div>
              {i === 0 && (
                <span className="absolute -left-[80px] md:-left-[90px] top-1 text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">最新</span>
              )}
              
              <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <Link href={`/post/${post.slug}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title || '无标题公告'}
                  </Link>
                  <time className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full w-max">
                    {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')}
                  </time>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 line-clamp-4">
                  {post.content.replace(/#|<[^>]+>/g, '').substring(0, 200)}...
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                  <Link href={`/post/${post.slug}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 w-max">
                    查看全文 <span className="text-[10px]">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}