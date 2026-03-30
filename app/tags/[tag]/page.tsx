import { getAllPosts } from "@/lib/posts";
import { PostItem } from "@/components/home/PostItem";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";

export const revalidate = 60;

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const { tag: encodedTag } = await props.params;
  const tag = decodeURIComponent(encodedTag);
  const posts = await getAllPosts();
  
  const tagPosts = posts.filter(p => p.tags && p.tags.includes(tag));

  return (
    <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto min-h-screen relative">
      <Link href="/home" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回主页
      </Link>
      
      <div className="flex items-center mb-8 gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <Tag className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            #{tag}
          </h1>
          <p className="text-sm text-gray-500 mt-1">共 {tagPosts.length} 篇文章</p>
        </div>
      </div>

      {tagPosts.length === 0 ? (
         <div className="text-center text-gray-500 mt-20 p-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
           没有找到带有此标签的文章
         </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tagPosts.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}