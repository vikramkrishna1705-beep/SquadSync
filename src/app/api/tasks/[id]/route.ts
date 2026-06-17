import connectDB from "@/lib/mongodb";
import TaskModel from "@/models/Tasks";
import ActivityModel from "@/models/Activity";
import { Task } from "@/types";

interface RouteContext {
    params: Promise<{ id: string }> | { id: string };
}

export async function DELETE(
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

        const deletedTask: Task | null = await TaskModel.findByIdAndDelete(id);

        if (!deletedTask) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        await ActivityModel.create({
            action: "deleted",
            taskTitle: deletedTask.title,
            details: "Task deleted"
        });

        return Response.json({ data: { message: "Task deleted successfully" } }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to delete task" },
            { status: 500 }
        );
    }
}

export async function PATCH(
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

        const body: Partial<Task> = await request.json();
        
        const { _id, ...updateData } = body;

        const taskBeforeUpdate = await TaskModel.findById(id);
        if (!taskBeforeUpdate) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        const updatedTask: Task | null = await TaskModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedTask) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        if (updateData.status && taskBeforeUpdate.status !== updateData.status) {
            const getStatusLabel = (s: string) => s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Done";
            await ActivityModel.create({
                action: "moved",
                taskTitle: updatedTask.title,
                details: `moved from ${getStatusLabel(taskBeforeUpdate.status)} → ${getStatusLabel(updateData.status)}`
            });
        } else {
            await ActivityModel.create({
                action: "updated",
                taskTitle: updatedTask.title,
                details: "Task details updated"
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
