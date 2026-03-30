import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateAboutGithub } from "@/lib/github";
import { getAboutData } from "@/lib/posts";
import matter from "gray-matter";

// 加入对 GET 请求的支持，返回当前个人资料信息
export async function GET() {
  try {
    const data = await getAboutData();
    return NextResponse.json({
      name: data.name,
      avatar: data.avatar,
      description: data.description,
      github: data.github,
      email: data.email
    });
  } catch (error) {
    // 降级返回默认值
    return NextResponse.json({
      name: "xixiyhaha",
      avatar: "https://avatars.githubusercontent.com/xixiyhaha"
    });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== ('Bearer ' + process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, description, github, email, location, website, content } = body;

    const frontmatter = {
      name: name || "xixiyhaha",
      avatar: avatar || "https://avatars.githubusercontent.com/xixiyhaha",
      description: description || "",
      github: github || "",
      email: email || "",
      location: location || "",
      website: website || "",
    };

    const fileContent = matter.stringify(content || "", frontmatter);
    await updateAboutGithub(fileContent, "Update about page via API");
    revalidatePath('/about');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("About API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
