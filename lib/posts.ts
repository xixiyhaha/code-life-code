import { octokit, BLOG_REPO_OWNER, BLOG_REPO_NAME } from "./github";
import matter from "gray-matter";

export interface Post {
  slug: string;
  type: "post" | "note" | "announcement";
  title?: string;
  date: string;
  content: string;
  tags?: string[];
  sha?: string;
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: "content/posts",
    });

    if (!Array.isArray(data)) return [];

    const posts: Post[] = [];

    for (const file of data) {
      if (!file.name.endsWith(".md")) continue;

      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: BLOG_REPO_OWNER,
        repo: BLOG_REPO_NAME,
        path: file.path,
      });

      if (!("content" in fileData)) continue;

      const content = Buffer.from(fileData.content, "base64").toString("utf-8");
      const { data: frontmatter, content: markdownBody } = matter(content);

      posts.push({
        slug: file.name.replace(".md", ""),
        type: frontmatter.type || (file.name.startsWith("note-") ? "note" : "post"),
        title: frontmatter.title,
        date: frontmatter.date || new Date().toISOString(),
        content: markdownBody,
        tags: frontmatter.tags || [],
        sha: fileData.sha,
      });
    }

    // 按时间倒序排列
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    if (error.status === 404) {
      // 如果目录还不存在，返回空数组
      return [];
    }
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: `content/posts/${slug}.md`,
    });

    if (Array.isArray(fileData) || !("content" in fileData)) return null;

    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    const { data: frontmatter, content: markdownBody } = matter(content);

    return {
      slug,
      type: frontmatter.type || (slug.startsWith("note-") ? "note" : "post"),
      title: frontmatter.title,
      date: frontmatter.date || new Date().toISOString(),
      content: markdownBody,      tags: frontmatter.tags || [],
      sha: fileData.sha,    };
  } catch (error: any) {
    if (error.status !== 404) {
      console.error(`Error fetching post ${slug}:`, error);
    }
    return null;
  }
}

export interface AboutData {
  name: string;
  avatar: string;
  description: string;
  github: string;
  email: string;
  location: string;
  website: string;
  content: string;
  sha?: string;
}

export async function getAboutData(): Promise<AboutData> {
  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: "content/about.md",
    });

    if (Array.isArray(fileData) || !("content" in fileData)) throw new Error("Not found");

    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    const { data: frontmatter, content: markdownBody } = matter(content);

    return {
      name: frontmatter.name || "xixiyhaha",
      avatar: frontmatter.avatar || "https://avatars.githubusercontent.com/xixiyhaha",
      description: frontmatter.description || "简要的个人介绍，记录我的学习和生活。",
      github: frontmatter.github || "https://github.com/xixiyhaha",
      email: frontmatter.email || "",
      location: frontmatter.location || "",
      website: frontmatter.website || "",
      content: markdownBody,
      sha: fileData.sha,
    };
  } catch (error) {
    // Return default if not exists
    return {
      name: "xixiyhaha",
      avatar: "https://avatars.githubusercontent.com/xixiyhaha",
      description: "简要的个人介绍，记录我的学习和生活。",
      github: "https://github.com/xixiyhaha",
      email: "",
      location: "",
      website: "",
      content: "在这里写下关于你的详细介绍...\n\n### 技能\n- JavaScript / TypeScript\n- React / Next.js",
    };
  }
}
