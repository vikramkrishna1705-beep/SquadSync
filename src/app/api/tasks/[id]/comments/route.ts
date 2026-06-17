import connectDB from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import TaskModel from "@/models/Tasks";

interface RouteContext {
    params: Promise<{ id: string }> | { id: string };
}

export async function GET(
    request: Request,
    context: RouteContext
): Promise<Response> {
    try {
        await connectDB();
        
        const resolvedParams = await context.params;
        const { id } = resolvedParams;

        if (!id) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const comments = await CommentModel.find({ taskId: id }).sort({ createdAt: 1 });

        return Response.json({ data: comments }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    context: RouteContext
): Promise<Response> {
    try {
        await connectDB();
        
        const resolvedParams = await context.params;
        const { id } = resolvedParams;

        if (!id) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const body = await request.json();
        const { author, body: commentBody } = body;

        if (!author || !commentBody) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newComment = await CommentModel.create({
            taskId: id,
            author,
            body: commentBody
        });

        return Response.json({ data: newComment }, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create comment" },
            { status: 500 }
        );
    }
}
