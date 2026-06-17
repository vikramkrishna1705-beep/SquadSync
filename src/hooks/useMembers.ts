import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/types';

export function useMembers() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            setError(null);
            const res = await fetch("/api/members");
            const result = await res.json();
            
            if (!res.ok) {
                throw new Error(result.error || "Failed to fetch members");
            }
            
            const data: Member[] = result.data || [];
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        loading,
        error,
        refetch: fetchMembers,
        setMembers
    };
}
