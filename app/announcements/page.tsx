import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { Megaphone, ArrowLeft } from "lucide-react";
import { AnnouncementItem } from "@/components/home/AnnouncementItem";
import { AdminAwareBackLink } from "@/components/ui/AdminAwareBackLink";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const allPosts = await getAllPosts();
  const announcements = allPosts.filter(p => p.type === 'announcement');

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <AdminAwareBackLink text="返回主页" />
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
            <AnnouncementItem key={post.slug} post={post} isLatest={i === 0} />
          ))
        )}
      </div>
    </div>
  );
}