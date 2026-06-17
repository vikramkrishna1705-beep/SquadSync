import connectDB from "@/lib/mongodb";
import MemberModel from "@/models/Member";

function getRandomColor() {
  const colors = ["#00FF87", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function GET(): Promise<Response> {
  try {
    await connectDB();
    const members = await MemberModel.find().sort({ name: 1 });
    return Response.json({ data: members }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    await connectDB();
    const body = await request.json();
    const { name, role } = body;

    if (!name || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const memberData = {
      name,
      role,
      color: getRandomColor()
    };
    
    const newMember = await MemberModel.create(memberData);
    return Response.json({ data: newMember }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create member' }, { status: 500 });
  }
}
