import { NextResponse } from "next/server";
import { publishPostToGithub } from "@/lib/github";
import matter from "gray-matter";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, content, tags } = body;
    const date = new Date();
    const isoDate = date.toISOString();

    const timestamp = date.getTime();
    let slug = "";

    const frontmatter: Record<string, any> = {
      date: isoDate,
      type: type,
    };

    if (tags && Array.isArray(tags) && tags.length > 0) {
      frontmatter.tags = tags;
    }

    if (type === "post") {
      slug = `post-${timestamp}`;
      frontmatter.title = title || "Untitled Post";
    } else {
      slug = `note-${timestamp}`;
    }

    const fileContent = matter.stringify(content, frontmatter);
    await publishPostToGithub(slug, fileContent, `Publish ${type}: ${slug}`);

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    console.error("Post API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
