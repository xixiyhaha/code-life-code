import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json([]);
    }

    const posts = await getAllPosts();
    const query = q.toLowerCase();

    const results = posts.filter(post => {
      if (post.type === 'post') {
        // 长文只匹配标题
        return post.title?.toLowerCase().includes(query);
      } else if (post.type === 'note') {
        // 碎碎念只匹配正文纯内容（移除Markdown图片链接等）
        const plainContent = post.content.replace(/!\[.*?\]\(.*?\)/g, '');
        return plainContent.toLowerCase().includes(query);
      }
      return false;
    }).map(post => {
      // 预处理碎碎念内容
      let textSnippet = "";
      if (post.type === 'note') {
         // 先移除图片和 HTML 等噪音
         const plainText = post.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/<[^>]*>/g, '').trim();
         textSnippet = plainText.substring(0, 100).replace(/\n/g, ' ') + (plainText.length > 100 ? '...' : '');
      }

      return {
        slug: post.slug,
        title: post.type === 'post' ? post.title : undefined, // 碎碎念不返回标题
        type: post.type,
        date: post.date,
        snippet: post.type === 'note' ? textSnippet : undefined // 长文不返回snippet，或按照需求可以不传
      };
    }).slice(0, 10);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
