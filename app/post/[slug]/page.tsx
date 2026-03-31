import { getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import GithubSlugger from "github-slugger";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, List } from "lucide-react";
import React from "react";

export default async function PostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const slugger = new GithubSlugger();
  const headings: { level: number; text: string; id: string }[] = [];
  
  // Custom simple parsing since remark doesn't easily expose AST directly here
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(post.content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: slugger.slug(match[2]),
    });
  }

  return (
    <div className="max-w-5xl mx-auto pt-24 pb-12 px-4 sm:px-6 relative grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10 lg:gap-16">
      
      {/* Left Sidebar: TOC */}
      <aside className="hidden md:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar">
          <Link href="/home" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">     
            <ArrowLeft className="w-4 h-4" /> 返回主页
          </Link>

          {headings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 tracking-wider uppercase">
                <List className="w-4 h-4" /> 目录
              </div>
              <ul className="flex flex-col gap-2.5">
                {headings.map((h, i) => (
                  <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <article className="min-w-0">
        <div className="md:hidden mb-8">
          <Link href="/home" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">     
            <ArrowLeft className="w-4 h-4" /> 返回主页
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight mb-4">
            {post.title || "无标题"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.date}>
              {format(new Date(post.date), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
            </time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map(tag => (
                   <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              img: ({ node, ...props }) => (
                <span className="block my-8 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}      
                  <img {...props} alt={props.alt || "图片"} className="w-full h-auto object-cover" />
                </span>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}