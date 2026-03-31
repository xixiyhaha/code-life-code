"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MoreHorizontal, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Post } from "@/lib/posts";

export function AnnouncementItem({ post, isLatest = false }: { post: Post, isLatest?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("确定要删除这条公告吗？")) return;

    const adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminPassword}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (e: any) {
      alert("删除失败: " + e.message);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert("公告内容不能为空");
      return;
    }

    const adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminPassword}`
        },
        body: JSON.stringify({
          title: post.title,
          content: editContent,
          type: "announcement"
        })
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEditing(false);
      router.refresh();
    } catch (e: any) {
      alert("保存失败: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#0a0a0a] border-4 border-blue-500"></div>
      {isLatest && (
        <span className="absolute -left-[80px] md:-left-[90px] top-1 text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">最新</span>
      )}
      
      <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <time className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full w-max">
            {new Date(post.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')}
          </time>
          
          {isAdmin && !isEditing && (
            <div className="relative">
              <button onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }} className="p-1.5 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                    <button 
                      onClick={(e) => { e.preventDefault(); setIsEditing(true); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />编辑
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      删除
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-4 bg-gray-50 dark:bg-[#111] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 resize-none outline-none focus:ring-0 leading-relaxed text-sm min-h-[100px]"
              placeholder="正文内容..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />取消
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 line-clamp-4">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {post.content}
            </ReactMarkdown>
          </div>
        )}
        
        {!isEditing && (
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
            <Link href={`${isAdmin ? '/admin' : ''}/post/${post.slug}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 w-max">
              查看全文 <span className="text-[10px]">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}