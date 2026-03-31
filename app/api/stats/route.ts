import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("codelife_blog");
    const statsCollection = db.collection("stats");

    const stats = await statsCollection.findOne({ _id: "global_stats" as any });
    return NextResponse.json({
       views: stats?.views || 0,
       visitors: stats?.visitors || 0
    });
  } catch (error: any) {
    return NextResponse.json({ views: 0, visitors: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("codelife_blog");
    const statsCollection = db.collection("stats");

    // Fetch IP from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const remoteIp = req.headers.get('x-real-ip');
    let ip = (forwardedFor ? forwardedFor.split(',')[0] : remoteIp) || 'unknown';

    // Get current stats document, or create it if missing
    let stats = await statsCollection.findOne({ _id: "global_stats" as any });
    if (!stats) {
      stats = { _id: "global_stats", views: 0, visitors: 0, ips: [] } as any;
    }

    // Increment views
    const newViews = ((stats?.views) || 0) + 1;
    let ips = (stats?.ips) || [];
    let newVisitors = (stats?.visitors) || 0;

    // Check unique visitor
    if (ip !== 'unknown' && !ips.includes(ip)) {
      ips.push(ip);
      newVisitors += 1;
    }

    // Determine if we need to filter and cap the IPs array to prevent massive bloating
    if (ips.length > 5000) {
      ips = ips.slice(ips.length - 5000); // keep last 5000 approx
    }

    await statsCollection.updateOne(
      { _id: "global_stats" as any },
      { 
        $set: { 
          views: newViews, 
          visitors: newVisitors, 
          ips: ips 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
       views: newViews,
       visitors: newVisitors
    });

  } catch (error: any) {
    console.error("Stats Error:", error);
    // fallback
    return NextResponse.json({ views: 0, visitors: 0 });
  }
}