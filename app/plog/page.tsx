import { getAllPosts, getAboutData } from "@/lib/posts";
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
}