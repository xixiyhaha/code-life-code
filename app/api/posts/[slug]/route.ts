import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deletePostFromGithub, extractAndCleanImages, deleteImageFromGithub, publishPostToGithub } from "@/lib/github";
import matter from "gray-matter";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 先提取并删除文章包含的所有图片
    const imageUrls = await extractAndCleanImages(slug);
    if (imageUrls && imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map((url) => deleteImageFromGithub(url))
      );
    }

    // 再删除文章本身
    await deletePostFromGithub(slug);

    revalidatePath('/', 'layout'); revalidatePath('/blog', 'page'); revalidatePath('/plog', 'page'); return NextResponse.json({ success: true});
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, content, date, tags } = body;
    
    const frontmatter: Record<string, any> = {
      date: date || new Date().toISOString(),
      type: type,
    };

    if (tags && Array.isArray(tags)) {
      frontmatter.tags = tags;
    }

    if (title) {
      frontmatter.title = title;
    }

    const fileContent = matter.stringify(content, frontmatter);
    await publishPostToGithub(slug, fileContent, `Update ${type}: ${slug}`);

    revalidatePath('/', 'layout'); revalidatePath('/blog', 'page'); revalidatePath('/plog', 'page'); return NextResponse.json({ success: true});
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
