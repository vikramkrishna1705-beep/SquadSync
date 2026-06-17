import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';

export function useTasks(projectId?: string) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            setError(null);
            const url = projectId ? `/api/tasks?projectId=${projectId}` : "/api/tasks";
            const res = await fetch(url);
            const result = await res.json();
            
            if (!res.ok) {
                throw new Error(result.error || "Failed to fetch tasks");
            }
            
            const data: Task[] = result.data || [];
            setTasks(data.map((t) => ({ ...t, status: t.status || "todo" })));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        loading,
        error,
        refetch: fetchTasks,
        setTasks
    };
}
