import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 统计数据的存储路径
const dataFilePath = path.join(process.cwd(), "data", "stats.json");

function getStats() {
  try {
    if (fs.existsSync(dataFilePath)) {
       const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
       const cleanContent = fileContent.charCodeAt(0) === 0xFEFF ? fileContent.slice(1) : fileContent;
       if (cleanContent.trim()) {
           return JSON.parse(cleanContent);
       }
    }
  } catch (e) {
    console.error(e);
  }
  return { views: 0, visitors: 0, ips: [] };
}

export async function GET() {
  const stats = getStats();
  return NextResponse.json({ views: stats.views || 0, visitors: stats.visitors || 0 });
}

export async function POST(req: Request) {
  try {
    const stats = getStats();
    
    // 获取由代理传递的真实 IP
    const forwarded = req.headers.get("x-forwarded-for");
    const realtimeIp = req.headers.get("x-real-ip");
    let ip = forwarded ? forwarded.split(/, /)[0] : realtimeIp;
    if (!ip) ip = "unknown";

    stats.views = (stats.views || 0) + 1;
    if (!stats.ips) stats.ips = [];

    if (ip !== "unknown" && !stats.ips.includes(ip)) {
      stats.ips.push(ip);
      stats.visitors = (stats.visitors || 0) + 1;
    } else if (ip === "unknown") {
      // 本地或者未知IP时不增加访客数，或者可以随意增加
      // 这里为了本地测试效果，未知IP如果有 views > 0，这里默认就不去重了
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(stats, null, 2), 'utf-8');

    return NextResponse.json({ views: stats.views, visitors: stats.visitors || 1 });
  } catch (error) {
    console.error("Failed to update stats:", error);
    return NextResponse.json({ views: 0, visitors: 0 });
  }
}
