import connectDB from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
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

        const project = await ProjectModel.findById(id);

        if (!project) {
            return Response.json({ error: "Project not found" }, { status: 404 });
        }

        return Response.json({ data: project }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to fetch project" },
            { status: 500 }
        );
    }
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

        const deletedProject = await ProjectModel.findByIdAndDelete(id);

        if (!deletedProject) {
            return Response.json({ error: "Project not found" }, { status: 404 });
        }

        await TaskModel.deleteMany({ projectId: id });

        return Response.json({ data: { message: "Project and tasks deleted successfully" } }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to delete project" },
            { status: 500 }
        );
    }
}
