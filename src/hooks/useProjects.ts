import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            setError(null);
            const res = await fetch("/api/projects");
            const result = await res.json();
            
            if (!res.ok) {
                throw new Error(result.error || "Failed to fetch projects");
            }
            
            const data: Project[] = result.data || [];
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        refetch: fetchProjects,
        setProjects
    };
}
