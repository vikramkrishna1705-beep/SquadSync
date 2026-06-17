import connectDB from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import TaskModel from "@/models/Tasks";

export async function GET(): Promise<Response> {
    try {
        await connectDB();

        const projects = await ProjectModel.aggregate([
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "projectId",
                    as: "tasksList"
                }
            },
            {
                $addFields: {
                    taskCount: { $size: "$tasksList" }
                }
            },
            {
                $project: {
                    tasksList: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return Response.json({ data: projects }, { status: 200 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        await connectDB();

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const project = await ProjectModel.create({ name, description });

        return Response.json({ data: project }, { status: 201 });
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create project" },
            { status: 500 }
        );
    }
}
