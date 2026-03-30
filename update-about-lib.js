const fs = require('fs');
const file = 'd:/Desktop/博客/code-life-blog/lib/posts.ts';
let code = fs.readFileSync(file, 'utf8');

const newCode = `
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
      content: "在这里写下关于你的详细介绍...\\n\\n### 技能\\n- JavaScript / TypeScript\\n- React / Next.js",
    };
  }
}
`;

code = code + newCode;
fs.writeFileSync(file, code);

const file2 = 'd:/Desktop/博客/code-life-blog/lib/github.ts';
let code2 = fs.readFileSync(file2, 'utf8');

const githubNewCode = `
/**
 * 更新关于页面
 */
export async function updateAboutGithub(content: string, message: string = "Update about page") {
  const path = \`content/about.md\`;

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
`;
code2 = code2 + githubNewCode;
fs.writeFileSync(file2, code2);
