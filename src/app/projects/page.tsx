"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Project } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    
    // New project form state
    const [newName, setNewName] = useState<string>("");
    const [newDesc, setNewDesc] = useState<string>("");
    const [createError, setCreateError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const router = useRouter();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (res.ok) {
                setProjects(data.data || []);
            }
        } catch (error) {
            // gracefully handled
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            setCreateError("Project name is required.");
            return;
        }

        setIsSubmitting(true);
        setCreateError("");

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create project");

            router.push(`/projects/${data.data._id}`);
        } catch (err: any) {
            setCreateError(err instanceof Error ? err.message : "Failed to create project");
            setIsSubmitting(false);
        }
    };

    const handleOpenCreate = () => setIsCreating(true);
    const handleCloseCreate = () => {
        setIsCreating(false);
        setNewName("");
        setNewDesc("");
        setCreateError("");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value);
    const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDesc(e.target.value);
    
    const handleProjectClick = (id: string) => router.push(`/projects/${id}`);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative overflow-hidden">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col overflow-hidden">
                <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h1 className="text-6xl sm:text-7xl font-black uppercase text-white tracking-tighter mb-4">
                            Your Projects
                        </h1>
                        <p className="text-[#888888] text-sm uppercase tracking-widest">Select a project to view its Kanban board.</p>
                    </div>
                    
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-[#00FF87] text-black font-bold py-3 px-6 rounded-md flex items-center gap-2 hover:bg-[#00cc6a] transition duration-200"
                    >
                        <Plus size={20} />
                        New Project
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-12 bg-[#111111] border border-[#222222] rounded-xl p-8">
                        <h2 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-2">
                            <FolderKanban className="text-[#00FF87]" size={24} /> Create New Project
                        </h2>
                        <form onSubmit={handleCreateProject} className="flex flex-col gap-5 max-w-xl">
                            {createError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm font-bold">
                                    {createError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[#888888] mb-2 font-bold">Project Name</label>
                                <input 
                                    type="text" 
                                    value={newName} 
                                    onChange={handleNameChange}
                                    placeholder="e.g. Website Redesign"
                                    className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition duration-200 text-white placeholder-[#555555]"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[#888888] mb-2 font-bold">Description (Optional)</label>
                                <textarea 
                                    value={newDesc} 
                                    onChange={handleDescChange}
                                    placeholder="Brief details about this project..."
                                    rows={3}
                                    className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition duration-200 text-white placeholder-[#555555] resize-y"
                                />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !newName.trim()}
                                    className="bg-[#00FF87] text-black font-bold py-2 px-6 rounded-md hover:bg-[#00cc6a] transition duration-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Creating..." : "Create Project"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCloseCreate}
                                    className="border border-[#222222] text-[#888888] font-bold py-2 px-6 rounded-md hover:border-[#00FF87] hover:text-[#00FF87] transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i: number) => (
                            <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl h-40 animate-pulse" />
                        ))}
                    </div>
                ) : projects.length === 0 && !isCreating ? (
                    <div className="text-center py-20 bg-[#111111] rounded-xl border border-[#222222] border-dashed">
                        <FolderKanban size={48} className="mx-auto text-[#555555] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2 uppercase">No projects yet</h3>
                        <p className="text-[#888888] mb-6 max-w-md mx-auto text-sm">Get started by creating your first project board to organize your tasks.</p>
                        <button 
                            onClick={handleOpenCreate}
                            className="bg-[#00FF87] text-black font-bold py-2.5 px-6 rounded-md hover:bg-[#00cc6a] transition duration-200 inline-flex items-center gap-2"
                        >
                            <Plus size={18} /> Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project: Project) => (
                            <div 
                                key={project._id}
                                onClick={() => handleProjectClick(project._id)}
                                className="bg-[#111111] border border-[#222222] rounded-xl p-6 cursor-pointer hover:border-[#00FF87] transition-colors duration-200 group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-white line-clamp-1">
                                        {project.name}
                                    </h3>
                                </div>
                                
                                <p className="text-[#888888] text-sm line-clamp-2 mb-8 flex-1">
                                    {project.description || <span className="italic">No description provided.</span>}
                                </p>

                                <div className="flex justify-between items-center mt-auto">
                                    <span className="bg-[#00FF87]/10 text-[#00FF87] px-3 py-1 rounded-full text-xs font-bold">
                                        {(project as Project & { taskCount?: number }).taskCount || 0} Tasks
                                    </span>
                                    <ArrowRight size={18} className="text-[#555555] group-hover:text-[#00FF87] transition duration-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
