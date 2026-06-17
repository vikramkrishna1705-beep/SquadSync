"use client";

import React, { useState, useEffect, useCallback } from 'react';

export interface Activity {
    _id: string;
    action: string;
    taskTitle: string;
    details: string;
    createdAt: string;
}

const ACTION_CREATED = "created";
const ACTION_MOVED = "moved";
const ACTION_DELETED = "deleted";
const ACTION_UPDATED = "updated";

function getRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch('/api/activity');
            const result = await res.json();
            if (res.ok) {
                setActivities(result.data || []);
            }
        } catch (error) {
            // Error handled gracefully
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-[#222222] w-full">
                <div className="p-4 border-b border-[#222222] bg-[#0a0a0a] sticky top-0 z-10 flex justify-between items-center">
                    <h3 className="font-black text-lg text-white">Activity</h3>
                    <span className="text-[10px] bg-[#1a1a1a] text-[#888888] uppercase tracking-widest font-bold px-2 py-1 rounded border border-[#222222]">
                        Live
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-center text-[#555555] mt-10 animate-pulse text-sm font-bold uppercase tracking-widest">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-[#222222] w-full">
            <div className="p-4 border-b border-[#222222] bg-[#0a0a0a] sticky top-0 z-10 flex justify-between items-center">
                <h3 className="font-black text-lg text-white">Activity</h3>
                <span className="text-[10px] bg-[#1a1a1a] text-[#888888] uppercase tracking-widest font-bold px-2 py-1 rounded border border-[#222222]">
                    Live
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {activities.length === 0 ? (
                    <div className="text-center text-[#555555] mt-10 text-sm font-bold uppercase tracking-widest">No activity yet.</div>
                ) : (
                    <div className="relative border-l border-[#222222] ml-3 space-y-6 pb-4">
                        {activities.map((activity) => {
                            let dotColor = "bg-[#555555] ring-[#555555]/20";
                            if (activity.action === ACTION_CREATED) dotColor = "bg-[#00FF87] ring-[#00FF87]/20";
                            else if (activity.action === ACTION_MOVED) dotColor = "bg-white ring-white/20";
                            else if (activity.action === ACTION_DELETED) dotColor = "bg-[#ff4444] ring-[#ff4444]/20";
                            else if (activity.action === ACTION_UPDATED) dotColor = "bg-[#00cc6a] ring-[#00cc6a]/20";

                            return (
                                <div key={activity._id} className="relative pl-6 group">
                                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ${dotColor}`} />
                                    
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                            <span className="font-bold text-white line-clamp-1" title={activity.taskTitle}>
                                                {activity.taskTitle}
                                            </span>
                                            <span className="text-[10px] text-[#555555] uppercase tracking-widest font-bold shrink-0 tabular-nums">
                                                {getRelativeTime(activity.createdAt)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-[#888888] leading-relaxed">
                                            {activity.action === ACTION_DELETED ? 'Task deleted' : activity.details}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
