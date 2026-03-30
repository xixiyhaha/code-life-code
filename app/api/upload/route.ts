import { NextResponse } from "next/server";
import { uploadImageToGithub } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await uploadImageToGithub(file);
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}