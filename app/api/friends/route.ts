import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("codelife_blog");
    const friendsCollection = db.collection("friends");
    
    const friends = await friendsCollection.find({}).toArray();
    
    // Remove MongoDB _id for the frontend
    const cleanedFriends = friends.map(f => {
      const { _id, ...rest } = f;
      return rest;
    });

    return NextResponse.json({ friends: cleanedFriends.length > 0 ? cleanedFriends : [] });
  } catch (error: any) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ friends: [] }); // Fallback to empty array
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== ('Bearer ' + process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, url, avatar, desc, id } = await req.json();
    
    if (!name || !url || !avatar) {
       return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("codelife_blog");
    const friendsCollection = db.collection("friends");

    const newFriend = {
       name,
       url,
       avatar,
       desc: desc || "",
       id: id || Date.now().toString()
    };

    await friendsCollection.insertOne(newFriend);
    return NextResponse.json({ success: true, friend: newFriend });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== ('Bearer ' + process.env.ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { friends } = body;
    
    if (!friends || !Array.isArray(friends)) {
      return NextResponse.json({ error: "Invalid friends data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("codelife_blog");
    const friendsCollection = db.collection("friends");

    // Replace all friends (bulk operations are better but this is simple enough for few friends)
    await friendsCollection.deleteMany({});
    if (friends.length > 0) {
      await friendsCollection.insertMany(friends);
    }

    return NextResponse.json({ success: true, friends });
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


