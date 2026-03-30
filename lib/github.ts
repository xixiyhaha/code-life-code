import { Octokit } from "octokit";

if (!process.env.GITHUB_PAT) {
  console.warn("Missing GITHUB_PAT in environment variables");
}

export const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

export const BLOG_REPO_OWNER = "xixiyhaha";
export const BLOG_REPO_NAME = "code-life-blog";
export const IMAGES_REPO_NAME = "code-life-images";

/**
 * 上传图片到公开图床仓库
 */
export async function uploadImageToGithub(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64Content = Buffer.from(buffer).toString("base64");
  
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  const ext = file.name.split(".").pop() || "png";
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const path = `${year}/${month}/${timestamp}-${randomStr}.${ext}`;

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: BLOG_REPO_OWNER,
      repo: IMAGES_REPO_NAME,
      path: path,
      message: `Upload image: ${file.name}`,
      content: base64Content,
    });

    return `https://cdn.jsdelivr.net/gh/${BLOG_REPO_OWNER}/${IMAGES_REPO_NAME}@main/${path}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image to GitHub.");
  }
}

/**
 * 提交文章到 Markdown 仓库
 */
export async function publishPostToGithub(slug: string, content: string, message: string = "New post") {
  const path = `content/posts/${slug}.md`;
  
  try {
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: BLOG_REPO_OWNER,
        repo: BLOG_REPO_NAME,
        path: path,
      });
      if (!Array.isArray(data) && "sha" in data) {
        sha = data.sha;
      }
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: path,
      message: message,
      content: Buffer.from(content).toString("base64"),
      ...(sha && { sha }),
    });

    return true;
  } catch (error) {
    console.error("Error publishing post:", error);
    throw new Error("Failed to publish post to GitHub.");
  }
}

/**
 * 从 GitHub 删除文章
 */
export async function deletePostFromGithub(slug: string, message: string = "Delete post") {
  const path = `content/posts/${slug}.md`;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: path,
    });
    if (Array.isArray(data) || !("sha" in data)) throw new Error("File not found");

    await octokit.rest.repos.deleteFile({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: path,
      message: `${message}: ${slug}`,
      sha: data.sha,
    });
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post from GitHub.");
  }
}

/**
 * 解析 Markdown 并提取所有符合格式的图片链接
 */
export async function extractAndCleanImages(slug: string): Promise<string[]> {
  const path = `content/posts/${slug}.md`;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: path,
    });
    if (Array.isArray(data) || !("content" in data)) return [];

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    // 匹配 Markdown 图片语法: ![alt](url)
    const regex = /!\[.*?\]\((https:\/\/cdn\.jsdelivr\.net\/gh\/.*?)\)/g;
    let match;
    const urls: string[] = [];
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) urls.push(match[1]);
    }
    return urls;
  } catch (error) {
    return [];
  }
}

/**
 * 从图床仓库删除单张图片 (反解 CDN 链接并利用 GitHub API 删除)
 */
export async function deleteImageFromGithub(cdnUrl: string) {
  try {
    const urlObj = new URL(cdnUrl);
    const parts = urlObj.pathname.split("@main/");
    if (parts.length < 2) return false;
    
    const imagePath = parts[1];

    const { data } = await octokit.rest.repos.getContent({
      owner: BLOG_REPO_OWNER,
      repo: IMAGES_REPO_NAME,
      path: imagePath,
    });

    if (Array.isArray(data) || !("sha" in data)) return false;

    await octokit.rest.repos.deleteFile({
      owner: BLOG_REPO_OWNER,
      repo: IMAGES_REPO_NAME,
      path: imagePath,
      message: `Delete image: ${imagePath}`,
      sha: data.sha,
    });
    return true;
  } catch (err) {
    console.error("Failed to delete image ", cdnUrl, err);
    return false;
  }
}

/**
 * 更新关于页面
 */
export async function updateAboutGithub(content: string, message: string = "Update about page") {
  const path = `content/about.md`;

  try {
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: BLOG_REPO_OWNER,
        repo: BLOG_REPO_NAME,
        path: path,
      });
      if (!Array.isArray(data) && "sha" in data) {
        sha = data.sha;
      }
    } catch (e: any) {
      if (e.status !== 404) throw e;
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: BLOG_REPO_OWNER,
      repo: BLOG_REPO_NAME,
      path: path,
      message: message,
      content: Buffer.from(content).toString("base64"),
      ...(sha && { sha }),
    });

    return true;
  } catch (error) {
    console.error("Error updating about page:", error);
    throw new Error("Failed to update about page.");
  }
}
