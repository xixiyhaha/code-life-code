import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: "密码错误" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "内部服务器错误" }, { status: 500 });
  }
}
