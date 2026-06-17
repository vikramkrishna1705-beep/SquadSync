import connectDB from "@/lib/mongodb";
import TaskModel from "@/models/Tasks";
import ActivityModel from "@/models/Activity";
import { Task } from "@/types";

export async function GET(request: Request): Promise<Response> {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const assigneeId = searchParams.get("assigneeId");

        let filter: Record<string, string> = {};
        if (projectId) filter.projectId = projectId;
        if (assigneeId) filter.assigneeId = assigneeId;

        const tasks: Task[] = await TaskModel.find(filter).populate('projectId', 'name');

        return Response.json({ data: tasks }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to fetch tasks" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        await connectDB();

        const body: Partial<Task> = await request.json();
        
        if (!body.title || !body.projectId) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const task: Task = await TaskModel.create({
            ...body,
            assigneeId: body.assigneeId,
            assigneeName: body.assigneeName
        });

        await ActivityModel.create({
            action: "created",
            taskTitle: task.title,
            details: `Task created in ${task.status === "todo" ? "To Do" : task.status === "in_progress" ? "In Progress" : "Done"}`
        });

        return Response.json({ data: task }, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create task" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request): Promise<Response> {
    try {
        await connectDB();
        
        const body: Partial<Task> = await request.json();
        const { _id, status } = body;

        if (!_id || !status) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const taskBeforeUpdate = await TaskModel.findById(_id);
        if (!taskBeforeUpdate) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        const updatedTask: Task | null = await TaskModel.findByIdAndUpdate(
            _id,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        if (taskBeforeUpdate.status !== status) {
            const getStatusLabel = (s: string) => s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Done";
            await ActivityModel.create({
                action: "moved",
                taskTitle: updatedTask.title,
                details: `moved from ${getStatusLabel(taskBeforeUpdate.status)} → ${getStatusLabel(status)}`
            });
        }

        return Response.json({ data: updatedTask }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to update task" },
            { status: 500 }
        );
    }
}