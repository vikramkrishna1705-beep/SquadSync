import connectDB from "@/lib/mongodb";
import MemberModel from "@/models/Member";
import TaskModel from "@/models/Tasks";

interface RouteContext {
    params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  try {
    await connectDB();
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const member = await MemberModel.findById(id);
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    const tasks = await TaskModel.find({ assigneeId: id });
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter((t: { status: string }) => t.status === "todo").length,
      inProgress: tasks.filter((t: { status: string }) => t.status === "in_progress").length,
      done: tasks.filter((t: { status: string }) => t.status === "done").length,
    };

    return Response.json({ data: { member, stats } }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to fetch member details" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  try {
    await connectDB();
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deletedMember = await MemberModel.findByIdAndDelete(id);
    if (!deletedMember) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json({ data: { message: "Member deleted successfully" } }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to delete member" }, { status: 500 });
  }
}
