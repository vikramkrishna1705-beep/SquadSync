"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Priority, Status, Project, Label, Member } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";
import LabelPicker from "@/components/LabelPicker";

const STATUSES = ["todo", "in_progress", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export default function CreateTaskPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [projectId, setProjectId] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [priority, setPriority] = useState<Priority>(PRIORITIES[0]);
    const [status, setStatus] = useState<Status>(STATUSES[0]);
    
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [assigneeName, setAssigneeName] = useState<string>("");
    const [isMemberSelectOpen, setIsMemberSelectOpen] = useState<boolean>(false);
    
    const [dueDate, setDueDate] = useState<string>("");
    const [labels, setLabels] = useState<Label[]>([]);
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (res.ok) {
                setProjects(data.data || []);
                if (data.data?.length > 0) {
                    setProjectId(data.data[0]._id);
                }
            }
        } catch (err) {
            // gracefully handled
        }
    }, []);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch("/api/members");
            const data = await res.json();
            if (res.ok) {
                setMembers(data.data || []);
            }
        } catch (err) {
            // gracefully handled
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        fetchMembers();
    }, [fetchProjects, fetchMembers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !projectId) {
            setError("Title and Project are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const body = {
                projectId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status,
                assigneeId: assigneeId || undefined,
                assigneeName: assigneeName || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                labels
            };

            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create task");

            router.push(`/projects/${projectId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create task");
            setIsSubmitting(false);
        }
    };

    const handleMemberSelect = (id: string, name: string) => {
        setAssigneeId(id);
        setAssigneeName(name);
        setIsMemberSelectOpen(false);
    };

    const toggleMemberSelect = () => setIsMemberSelectOpen(!isMemberSelectOpen);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value);
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);
    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as Priority);
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as Status);
    const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value);

    const selectedMember = useMemo(() => members.find((m: Member) => m._id === assigneeId), [members, assigneeId]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative overflow-hidden">
            <Navbar />

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tight">Create New Task</h1>
                    <p className="text-[#888888]">Add a new task to an existing project.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#ff4444] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Project</label>
                        {projects.length === 0 ? (
                            <p className="text-sm text-yellow-500">You need to create a project first before creating a task.</p>
                        ) : (
                            <select 
                                value={projectId}
                                onChange={handleProjectChange}
                                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white appearance-none cursor-pointer"
                            >
                                {projects.map((p: Project) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Task Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={handleTitleChange}
                            placeholder="What needs to be done?"
                            className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Description</label>
                        <textarea 
                            value={description} 
                            onChange={handleDescriptionChange}
                            placeholder="Add more details..."
                            rows={4}
                            className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white resize-y"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Priority</label>
                            <select 
                                value={priority}
                                onChange={handlePriorityChange}
                                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white appearance-none cursor-pointer"
                            >
                                <option value={PRIORITIES[0]}>Low</option>
                                <option value={PRIORITIES[1]}>Medium</option>
                                <option value={PRIORITIES[2]}>High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Status</label>
                            <select 
                                value={status}
                                onChange={handleStatusChange}
                                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white appearance-none cursor-pointer"
                            >
                                <option value={STATUSES[0]}>To Do</option>
                                <option value={STATUSES[1]}>In Progress</option>
                                <option value={STATUSES[2]}>Done</option>
                            </select>
                        </div>
                        
                        <div className="relative">
                            <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Assignee</label>
                            <div 
                                onClick={toggleMemberSelect}
                                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 flex justify-between items-center cursor-pointer hover:border-[#00FF87] transition-colors"
                            >
                                {selectedMember ? (
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs"
                                            style={{ backgroundColor: selectedMember.color }}
                                        >
                                            {selectedMember.initials}
                                        </div>
                                        <span className="text-white text-sm">{selectedMember.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-[#888888] text-sm">None</span>
                                )}
                                <ChevronDown size={16} className="text-[#888888]" />
                            </div>

                            {isMemberSelectOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-[#111111] border border-[#222222] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <div 
                                        className="p-3 hover:bg-[#1a1a1a] cursor-pointer text-[#888888] text-sm transition-colors border-b border-[#222222]"
                                        onClick={() => handleMemberSelect("", "")}
                                    >
                                        None
                                    </div>
                                    {members.map((m: Member) => (
                                        <div 
                                            key={m._id}
                                            onClick={() => handleMemberSelect(m._id, m.name)}
                                            className="p-3 hover:bg-[#1a1a1a] cursor-pointer transition-colors flex items-center gap-3"
                                        >
                                            <div 
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-xs"
                                                style={{ backgroundColor: m.color }}
                                            >
                                                {m.initials}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-semibold">{m.name}</span>
                                                <span className="text-[#888888] text-xs">{m.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Due Date (Optional)</label>
                            <input 
                                type="date" 
                                value={dueDate} 
                                onChange={handleDueDateChange}
                                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-md p-3 outline-none focus:border-[#00FF87] transition-all text-white cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Labels</label>
                        <LabelPicker labels={labels} onChange={setLabels} />
                    </div>

                    <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-[#222222]">
                        <button 
                            type="button"
                            onClick={() => router.back()}
                            className="bg-transparent hover:text-white text-[#888888] font-bold py-2.5 px-6 rounded-md transition-colors"
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting || !title.trim() || projects.length === 0}
                            className="bg-[#00FF87] hover:bg-[#00cc6a] text-black font-black uppercase tracking-wider py-2.5 px-8 rounded-md flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Plus size={18} />
                            {isSubmitting ? "CREATING..." : "CREATE TASK"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
