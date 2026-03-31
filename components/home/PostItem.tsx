"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Post } from "@/lib/posts";
import Link from "next/link";
import { MessageCircle, Heart, MoreHorizontal, Trash2, Edit2, Loader2, Save, X, Tag } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import GiscusComments from "@/components/GiscusComments";

export function PostItem({ post }: { post: Post }) {
  const router = useRouter();    const pathname = usePathname();  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content);
  const [editTags, setEditTags] = useState<string[]>(post.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const savedLikes = localStorage.getItem(`like_${post.slug}`);
    const savedState = localStorage.getItem(`isLiked_${post.slug}`);
    if (savedLikes) setLikes(parseInt(savedLikes));
    if (savedState) setIsLiked(savedState === "true");
  }, [post.slug]);

  const handleLike = () => {
    const newLikeState = !isLiked;
    const newLikes = newLikeState ? likes + 1 : Math.max(0, likes - 1);
    setIsLiked(newLikeState);
    setLikes(newLikes);
    localStorage.setItem(`like_${post.slug}`, newLikes.toString());
    localStorage.setItem(`isLiked_${post.slug}`, newLikeState.toString());
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
      // 仅在 /admin 系列路由下，并且验证了本地存储密码后，才显示编辑功能
      if (localStorage.getItem("ADMIN_PASSWORD") && pathname?.startsWith("/admin")) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }, [pathname]);
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, editContent]);

  const timeAgo = formatDistanceToNow(new Date(post.date), {
    addSuffix: true,
    locale: zhCN,
  });

  const handleDelete = async () => {
    if (!confirm("确定要永久删除这条内容吗？此操作将同步删除 GitHub 仓库文件")) return;

    let adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    if (!adminPassword) {
      adminPassword = prompt("请输入密码以确认删除：");
      if (!adminPassword) return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminPassword}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      router.refresh();
    } catch (e: any) {
      alert("删除失败: " + e.message);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSaveEdit = async () => {
    let adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    if (!adminPassword) {
      adminPassword = prompt("请输入密码以确认修改：");
      if (!adminPassword) return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminPassword}` 
        },
        body: JSON.stringify({
          type: post.type,
          title: editTitle,
          content: editContent,
          date: post.date, // keep original date
          tags: post.type === "post" ? editTags : undefined,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setIsEditing(false);
      router.refresh();
    } catch (e: any) {
      alert("修改失败: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const extractImagesAndText = (markdownContent: string) => {
    const urls: string[] = [];
    let textContent = markdownContent;

    // 提取并移除 Markdown 图片: ![alt](url)
    const mdRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = mdRegex.exec(markdownContent)) !== null) {
      if (match[1]) urls.push(match[1].replace(/["'].*$/, '').trim());
    }
    textContent = textContent.replace(/!\[.*?\]\((.*?)\)/g, '');

    // 提取并移除 HTML 图片: <img src="url" .../>
    const htmlRegex = /<img.*?src=["'](.*?)["']/gi;
    while ((match = htmlRegex.exec(markdownContent)) !== null) {
      if (match[1]) urls.push(match[1]);
    }
    textContent = textContent.replace(/<img.*?>/gi, '');

    return { textContent: textContent.trim(), urls };
  };

  const { textContent, urls: images } = extractImagesAndText(post.content);

  if (isEditing) {
    return (
      <div className="relative mb-10 bg-white dark:bg-[#111] border border-blue-500 rounded-2xl p-5 sm:p-6 shadow-sm group/card">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="text-sm font-medium text-blue-500 flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> 正在编辑中...
          </div>
          <button 
            disabled={isSaving}
            onClick={() => setIsEditing(false)} 
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full bg-gray-50 dark:bg-[#222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {post.type === "post" && (
          <>
            <input
              type="text"
              placeholder="鏂囩珷鏍囬"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-none outline-none mb-3 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center text-sm text-gray-500 mr-2"><Tag className="w-4 h-4 mr-1" /> 标签:</div>
              {(Array.from(new Set(["C++", "Python", "深度学习", "前端", "后端", "算法", "生活", ...editTags]))).map(tag => (
                <button
                  key={tag}
                  onClick={() => setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                    editTags.includes(tag)
                      ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                  )}
                >
                  {tag}
                </button>
              ))}
              <input
                type="text"
                placeholder="+ 自定义"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !editTags.includes(val)) {
                      setEditTags(prev => [...prev, val]);
                    }
                    e.currentTarget.value = "";
                  }
                }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-transparent border border-dashed border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 focus:text-blue-600 w-24"
              />
            </div>
          </>
        )}
        
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="正文内容支持 Markdown..."
          className="w-full min-h-[120px] resize-none bg-transparent text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed text-sm sm:text-base font-mono"
        />

        <div className="flex items-center justify-end mt-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <button
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={isSaving || !editContent.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "保存中..." : "保存修改"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id={post.slug} className="relative mb-10 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow group/card scroll-mt-24">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">  
          {timeAgo}
        </div>

        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none opacity-0 group-hover/card:opacity-100 focus:opacity-100"     
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#222] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-20 py-1 origin-top-right animate-in fade-in scale-95 duration-100">       
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#333] flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />编辑内容
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isDeleting ? "删除中..." : "删除动态"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {post.type === "post" && post.title && (
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">   
          <Link href={`${isAdmin ? '/admin' : ''}/post/${post.slug}`} className="hover:text-blue-500 transition-colors">
            {post.title}
          </Link>
        </h3>
      )}

      {/* 鏂囨湰娓叉煋 */}
      {post.type === "post" && post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 mt-1">
          {post.tags.map(tag => (
            <Link key={tag} href={`${isAdmin ? '/admin' : ''}/tags/${encodeURIComponent(tag)}`} className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {textContent && (
        <div className="mb-3 relative">
          <div className={clsx(
            "prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200",
            post.type === "post" && "line-clamp-2 overflow-hidden"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({node, ...props}) => (
                  <img
                    {...props}
                    onClick={() => setSelectedImage((props.src as string) || null)}
                    className="cursor-zoom-in rounded-lg"
                  />
                )
              }}
            >
              {textContent}
            </ReactMarkdown>
          </div>
          
        </div>
      )}

      {/* 九宫格图片渲染 */}
      {images.length > 0 && (
        <div className={clsx(
          "grid gap-1.5 mt-3",
          images.length === 1 ? "grid-cols-1 sm:w-2/3" :
          images.length === 2 ? "grid-cols-2" :
          images.length === 4 ? "grid-cols-2 sm:w-2/3" :
          "grid-cols-3"
        )}>
          {images.map((img, idx) => (
             <div
               key={idx}
               onClick={() => setSelectedImage(img)}
               className={clsx(
                 "relative w-full rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-[#111] cursor-pointer",
                 images.length === 1 ? "aspect-auto max-h-[400px]" : "aspect-square"
               )}
             >
                {/* eslint-disable-next-line @next/next/no-img-element */}      
                <img
                  src={img}
                  alt={`image-${idx}`}
                  className={clsx(
                    "w-full h-full",
                    images.length === 1 ? "object-contain" : "object-cover"     
                  )}
                />
             </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-6 text-gray-400">
        <button
          onClick={handleLike}
          className={clsx(
            "flex items-center gap-1.5 transition-colors group",
            isLiked ? "text-red-500" : "hover:text-red-500"
          )}
        >
          <Heart className={clsx("w-4 h-4 transition-all duration-300", isLiked ? "fill-red-500 scale-110" : "group-hover:fill-red-500")} />
          <span className="text-xs font-medium">{likes > 0 ? likes : "喜欢"}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={clsx("flex items-center gap-1.5 transition-colors", showComments ? "text-blue-500" : "hover:text-blue-500")}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium">评论</span>
        </button>
      </div>

      {/* Giscus Comments Area */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800/50">
          <GiscusComments term={post.slug} />
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Enlarged" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
}
