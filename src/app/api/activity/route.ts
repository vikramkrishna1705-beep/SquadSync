import connectDB from "@/lib/mongodb";
import ActivityModel from "@/models/Activity";

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
    try {
        await connectDB();

        const activities = await ActivityModel.find()
            .sort({ createdAt: -1 })
            .limit(20);

        return Response.json({ data: activities }, { status: 200 });

    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to fetch activity" },
            { status: 500 }
        );
    }
}
