import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 友链数据的存储路径
const dataFilePath = path.join(process.cwd(), "data", "friends.json");

export async function GET() {
  try {
    if (fs.existsSync(dataFilePath)) {
       const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
       // 移除可能会因为编码造成的BOM头
       const cleanContent = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
       if (!cleanContent.trim()) {
           return NextResponse.json({ friends: [] });
       }
       const data = JSON.parse(cleanContent);
       // Handle case where parsed is just an array instead of { friends: [...] }
       if (Array.isArray(data)) {
           return NextResponse.json({ friends: data });
       }
       return NextResponse.json({ friends: data.friends || [] });
    }
    return NextResponse.json({ friends: [] });
  } catch (error) {
    console.error("Failed to read friends data:", error);
    return NextResponse.json({ error: "Failed to read friends data" }, { status: 500 });
  }
}

export async function POST(request: Request) {try{const authHeader = request.headers.get("Authorization");if (authHeader !== (`Bearer ` + process.env.ADMIN_PASSWORD)) {return NextResponse.json({ error: "Unauthorized" }, { status: 401 });}
    const newFriend = await request.json();
    
    let friendsData: any = { friends: [] };
    if (fs.existsSync(dataFilePath)) {
       const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
       const cleanContent = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
       if (cleanContent.trim()) {
           const parsed = JSON.parse(cleanContent);
           // Handle case where parsed is just an array instead of { friends: [...] }
           if (Array.isArray(parsed)) {
               friendsData = { friends: parsed };
           } else if (parsed && Array.isArray(parsed.friends)) {
               friendsData = parsed;
           }
       }
    }
    
    // 生成ID并且追加数据
    newFriend.id = Date.now().toString();
    friendsData.friends.push(newFriend);

    // 覆盖写回文件
    const jsonString = JSON.stringify(friendsData, null, 2);
    // 使用纯 Node.js 写文件以避免 PowerShell 添加 BOM头
    fs.writeFileSync(dataFilePath, jsonString, 'utf-8');

    return NextResponse.json({ success: true, friend: newFriend });
  } catch (error) {
    console.error("Error saving friend data:", error);
    return NextResponse.json({ error: "Failed to save friend data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== (`Bearer ` + process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    
    // Expecting { friends: [...] }
    if (!data || !Array.isArray(data.friends)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataFilePath, jsonString, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating friends data:", error);
    return NextResponse.json({ error: "Failed to update friend data" }, { status: 500 });
  }
}


