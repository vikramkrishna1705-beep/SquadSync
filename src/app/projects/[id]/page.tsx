"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import KanbanBoard from "@/components/KanbanBoard";
import { Project } from "@/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function ProjectBoardPage() {
    const params = useParams();
    const projectId = params.id as string;
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();
            if (res.ok) {
                setProject(data.data);
            } else {
                router.push("/projects");
            }
        } catch (error) {
            router.push("/projects");
        } finally {
            setLoading(false);
        }
    }, [projectId, router]);

    useEffect(() => {
        if (projectId) fetchProject();
    }, [projectId, fetchProject]);

    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure you want to delete this project AND all its tasks? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                router.push("/projects");
            } else {
                alert("Failed to delete project");
            }
        } catch (error) {
            alert("Failed to delete project");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#00FF87] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
            <Navbar />
            
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/projects" className="text-[#888888] hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors w-fit">
                        <ArrowLeft size={16} /> Back to Projects
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-4">
                        <h1 className="text-4xl font-black uppercase text-white tracking-tighter">
                            {project.name}
                        </h1>
                        {project.description && (
                            <span className="text-[#888888] text-sm mb-1 line-clamp-1 max-w-xl">
                                {project.description}
                            </span>
                        )}
                    </div>
                </div>

                <button 
                    onClick={handleDeleteProject}
                    className="p-2 border border-[#222222] text-[#888888] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 rounded-md transition duration-200"
                    title="Delete Project"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <KanbanBoard projectId={projectId} />
        </div>
    );
}
