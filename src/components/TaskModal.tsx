import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task, Member, Comment } from '@/types';
import { X, Trash2, Clock, User, AlertCircle, MessageSquare, Send } from 'lucide-react';
import LabelPicker from '@/components/LabelPicker';

const STATUSES = ["todo", "in_progress", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

interface TaskModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: () => void;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

function getRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
}

// --- Sub-components ---

interface InlineTextProps {
    field: keyof Task;
    value: string;
    isEditing: boolean;
    onEdit: (field: keyof Task) => void;
    onSave: (field: keyof Task, val: string) => void;
    onCancel: () => void;
    className?: string;
    placeholder?: string;
}

const InlineText = ({ field, value, isEditing, onEdit, onSave, onCancel, className, placeholder }: InlineTextProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => onSave(field, e.target.value);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSave(field, e.currentTarget.value);
        if (e.key === 'Escape') onCancel();
    };
    const handleClick = () => onEdit(field);

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                defaultValue={value}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-[#1a1a1a] border border-[#222222] rounded-md px-2 py-1 text-white focus:outline-none focus:border-[#00FF87] transition duration-200 ${className}`}
            />
        );
    }
    
    return (
        <div 
            onClick={handleClick}
            className={`cursor-pointer hover:bg-[#111111] p-1 -ml-1 rounded transition duration-200 ${!value ? 'text-[#555555] italic' : ''} ${className}`}
        >
            {value || placeholder || `Add ${field}...`}
        </div>
    );
};

interface InlineTextAreaProps {
    field: keyof Task;
    value: string;
    isEditing: boolean;
    onEdit: (field: keyof Task) => void;
    onSave: (field: keyof Task, val: string) => void;
    onCancel: () => void;
    className?: string;
    placeholder?: string;
}

const InlineTextArea = ({ field, value, isEditing, onEdit, onSave, onCancel, className, placeholder }: InlineTextAreaProps) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => onSave(field, e.target.value);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') onCancel();
    };
    const handleClick = () => onEdit(field);

    if (isEditing) {
        return (
            <textarea
                ref={inputRef}
                rows={4}
                defaultValue={value}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-[#1a1a1a] border border-[#222222] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#00FF87] resize-y transition duration-200 ${className}`}
            />
        );
    }
    
    return (
        <div 
            onClick={handleClick}
            className={`cursor-pointer hover:bg-[#111111] p-2 -ml-2 rounded transition duration-200 whitespace-pre-wrap min-h-[4rem] ${!value ? 'text-[#555555] italic' : ''} ${className}`}
        >
            {value || placeholder || `Add ${field}...`}
        </div>
    );
};

interface InlineSelectProps {
    field: keyof Task;
    value: string;
    options: {value: string, label: string}[];
    isEditing: boolean;
    onEdit: (field: keyof Task) => void;
    onSave: (field: keyof Task, val: string) => void;
}

const InlineSelect = ({ field, value, options, isEditing, onEdit, onSave }: InlineSelectProps) => {
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => onSave(field, e.target.value);
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => onSave(field, e.target.value);
    const handleClick = () => onEdit(field);

    if (isEditing) {
        return (
            <select
                autoFocus
                defaultValue={value}
                onBlur={handleBlur}
                onChange={handleChange}
                className="bg-[#1a1a1a] border border-[#222222] rounded-md px-2 py-1 text-white focus:outline-none focus:border-[#00FF87] text-sm transition duration-200"
            >
                {options.map((opt: { value: string; label: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        );
    }

    const currentLabel = options.find((o: { value: string; label: string }) => o.value === value)?.label;
    
    let badgeColor = "bg-[#111111] text-[#888888] border-[#222222]";
    if (field === 'priority') {
        if (value === PRIORITIES[2]) badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";
        else if (value === PRIORITIES[1]) badgeColor = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
        else badgeColor = "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20";
    } else if (field === 'status') {
        if (value === STATUSES[2]) badgeColor = "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20";
        else if (value === STATUSES[1]) badgeColor = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
        else badgeColor = "bg-[#1a1a1a] text-[#888888] border border-[#222222]";
    }
    
    return (
        <div 
            onClick={handleClick}
            className={`cursor-pointer hover:opacity-80 transition-opacity px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor}`}
        >
            {currentLabel}
        </div>
    );
};

interface InlineDateProps {
    field: keyof Task;
    value: string;
    isEditing: boolean;
    isOverdue: boolean;
    onEdit: (field: keyof Task) => void;
    onSave: (field: keyof Task, val: string) => void;
    onCancel: () => void;
}

const InlineDate = ({ field, value, isEditing, isOverdue, onEdit, onSave, onCancel }: InlineDateProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => onSave(field, e.target.value);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSave(field, e.currentTarget.value);
        if (e.key === 'Escape') onCancel();
    };
    const handleClick = () => onEdit(field);

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="date"
                defaultValue={value ? String(value).split('T')[0] : ""}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="bg-[#1a1a1a] border border-[#222222] rounded-md px-2 py-1 text-white focus:outline-none focus:border-[#00FF87] text-sm transition duration-200"
            />
        );
    }
    
    return (
        <div 
            onClick={handleClick}
            className={`cursor-pointer hover:bg-[#111111] p-1 -ml-1 rounded transition duration-200 flex items-center gap-2 ${!value ? 'text-[#555555] italic' : (isOverdue ? 'text-red-400 font-bold' : 'text-white')}`}
        >
            <Clock size={16} className={isOverdue ? "text-red-400" : "text-[#888888]"} />
            {value ? new Date(value).toLocaleDateString() : "Set due date"}
        </div>
    );
};


export default function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
    const [localTask, setLocalTask] = useState<Task>(task);
    const [editingField, setEditingField] = useState<keyof Task | null>(null);

    // Comments State
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState<boolean>(true);
    const [newCommentAuthor, setNewCommentAuthor] = useState<string>("");
    const [newCommentBody, setNewCommentBody] = useState<string>("");
    const [commentError, setCommentError] = useState<string>("");
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Members State
    const [members, setMembers] = useState<Member[]>([]);
    const [isMemberSelectOpen, setIsMemberSelectOpen] = useState<boolean>(false);

    // Slide-in effect state
    const [isOpen, setIsOpen] = useState<boolean>(false);
    
    useEffect(() => {
        setIsOpen(true);
    }, []);

    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/tasks/${task._id}/comments`);
            const data = await res.json();
            if (res.ok) {
                setComments(data.data || []);
            }
        } catch (error) {
            // Error handled gracefully
        } finally {
            setLoadingComments(false);
        }
    }, [task._id]);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch("/api/members");
            const data = await res.json();
            if (res.ok) {
                setMembers(data.data || []);
            }
        } catch (error) {
            // Error handled gracefully
        }
    }, []);

    useEffect(() => {
        setLocalTask(task);
        fetchComments();
        fetchMembers();
    }, [task, fetchComments, fetchMembers]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handlePostComment = async () => {
        if (!newCommentAuthor.trim() || !newCommentBody.trim()) return;
        setCommentError("");

        const optimisticComment: Comment = {
            _id: Date.now().toString(),
            taskId: localTask._id,
            author: newCommentAuthor.trim(),
            body: newCommentBody.trim(),
            createdAt: new Date().toISOString()
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewCommentBody("");
        
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        try {
            const res = await fetch(`/api/tasks/${task._id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author: optimisticComment.author, body: optimisticComment.body }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setComments(prev => prev.map(c => c._id === optimisticComment._id ? data.data : c));
            } else {
                throw new Error(data.error || "Failed to post comment");
            }
        } catch (err) {
            setCommentError(err instanceof Error ? err.message : "Failed to post comment");
            setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
            setNewCommentBody(optimisticComment.body);
        }
    };

    const handleSave = async (field: keyof Task, value: any) => {
        setEditingField(null);
        if (localTask[field] === value) return;
        
        const updatedTask = { ...localTask, [field]: value };
        setLocalTask(updatedTask);

        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });
            if (res.ok) {
                onUpdate();
            } else {
                setLocalTask(task);
            }
        } catch {
            setLocalTask(task);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        
        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                onUpdate();
                handleClose();
            }
        } catch (error) {
            // Error handled gracefully
        }
    };

    const handleSaveAssignee = async (memberId: string, memberName: string) => {
        const prevId = localTask.assigneeId;
        setLocalTask(prev => ({ ...prev, assigneeId: memberId, assigneeName: memberName }));
        setIsMemberSelectOpen(false);

        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assigneeId: memberId, assigneeName: memberName }),
            });
            if (res.ok) {
                onUpdate();
            } else {
                setLocalTask(prev => ({ ...prev, assigneeId: prevId }));
            }
        } catch {
            setLocalTask(prev => ({ ...prev, assigneeId: prevId }));
        }
    };

    const handleEditField = (field: keyof Task) => setEditingField(field);
    const handleCancelEdit = () => setEditingField(null);
    const toggleMemberSelect = () => setIsMemberSelectOpen(!isMemberSelectOpen);

    const handleCommentAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewCommentAuthor(e.target.value);
    const handleCommentBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCommentBody(e.target.value);
    const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePostComment();
        }
    };
    
    const handleSelectUnassigned = () => handleSaveAssignee("", "");

    const isOverdue = useMemo(() => {
        return localTask.dueDate && localTask.status !== STATUSES[2] 
            ? new Date(localTask.dueDate) < new Date(new Date().setHours(0,0,0,0))
            : false;
    }, [localTask.dueDate, localTask.status]);

    const selectedMember = useMemo(() => members.find((m: Member) => m._id === localTask.assigneeId), [members, localTask.assigneeId]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleClose} 
            />
            
            <div 
                className={`relative w-full max-w-md bg-[#0f0f0f] border-l border-[#222222] shadow-2xl h-full overflow-y-auto transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center p-6 border-b border-[#222222] shrink-0">
                    <div className="flex items-center gap-3">
                        <InlineSelect 
                            field="status" 
                            value={localTask.status as string}
                            isEditing={editingField === 'status'}
                            onEdit={handleEditField}
                            onSave={handleSave}
                            options={[
                                { value: STATUSES[0], label: "To Do" },
                                { value: STATUSES[1], label: "In Progress" },
                                { value: STATUSES[2], label: "Done" },
                            ]} 
                        />
                        <InlineSelect 
                            field="priority" 
                            value={localTask.priority as string}
                            isEditing={editingField === 'priority'}
                            onEdit={handleEditField}
                            onSave={handleSave}
                            options={[
                                { value: PRIORITIES[0], label: "Low" },
                                { value: PRIORITIES[1], label: "Medium" },
                                { value: PRIORITIES[2], label: "High" },
                            ]} 
                        />
                    </div>
                    <button 
                        onClick={handleClose}
                        className="text-[#888888] hover:text-[#00FF87] transition duration-200 bg-[#111111] hover:bg-[#1a1a1a] p-2 rounded-full border border-[#222222]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#555555] mb-2 font-bold">Task Title</div>
                        <InlineText 
                            field="title" 
                            value={localTask.title}
                            isEditing={editingField === 'title'}
                            onEdit={handleEditField}
                            onSave={handleSave}
                            onCancel={handleCancelEdit}
                            className="text-2xl font-black text-white" 
                        />
                    </div>

                    <div className="flex flex-col gap-4 p-4 bg-[#111111] rounded-xl border border-[#222222]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="text-xs uppercase tracking-widest text-[#555555] mb-2 font-bold">Assignee</div>
                                <div 
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[#1a1a1a] p-1 -ml-1 rounded transition-colors"
                                    onClick={toggleMemberSelect}
                                >
                                    {selectedMember ? (
                                        <>
                                            <div 
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-[10px]"
                                                style={{ backgroundColor: selectedMember.color }}
                                            >
                                                {selectedMember.initials}
                                            </div>
                                            <span className="text-sm font-bold text-white truncate">{selectedMember.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User size={16} className="text-[#888888]" />
                                            <span className="text-sm font-bold text-[#555555] italic">Unassigned</span>
                                        </>
                                    )}
                                </div>
                                
                                {isMemberSelectOpen && (
                                    <div className="absolute top-full left-0 mt-1 z-10 w-64 bg-[#111111] border border-[#222222] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        <div 
                                            className="p-3 hover:bg-[#1a1a1a] cursor-pointer text-[#888888] text-sm transition-colors border-b border-[#222222]"
                                            onClick={handleSelectUnassigned}
                                        >
                                            None
                                        </div>
                                        {members.map((m: Member) => (
                                            <div 
                                                key={m._id}
                                                onClick={() => handleSaveAssignee(m._id, m.name)}
                                                className="p-3 hover:bg-[#1a1a1a] cursor-pointer transition-colors flex items-center gap-3"
                                            >
                                                <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-xs shrink-0"
                                                    style={{ backgroundColor: m.color }}
                                                >
                                                    {m.initials}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-white text-sm font-semibold truncate">{m.name}</span>
                                                    <span className="text-[#888888] text-xs truncate">{m.role}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[#555555] mb-2 font-bold">Due Date</div>
                                <InlineDate 
                                    field="dueDate" 
                                    value={localTask.dueDate as string}
                                    isEditing={editingField === 'dueDate'}
                                    isOverdue={isOverdue}
                                    onEdit={handleEditField}
                                    onSave={handleSave}
                                    onCancel={handleCancelEdit}
                                />
                                {isOverdue && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1 uppercase">
                                        <AlertCircle size={10} /> Overdue
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[#222222]">
                            <div className="text-xs uppercase tracking-widest text-[#555555] mb-2 font-bold">Labels</div>
                            <LabelPicker 
                                labels={localTask.labels || []} 
                                onChange={(newLabels) => handleSave('labels', newLabels)} 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="text-xs uppercase tracking-widest text-[#555555] mb-2 font-bold">Description</div>
                        <InlineTextArea 
                            field="description" 
                            value={localTask.description}
                            isEditing={editingField === 'description'}
                            onEdit={handleEditField}
                            onSave={handleSave}
                            onCancel={handleCancelEdit}
                            className="text-[#888888] text-sm leading-relaxed" 
                        />
                    </div>
                </div>

                <div className="border-t border-[#222222] bg-[#0a0a0a] shrink-0 flex flex-col">
                    <div className="p-6 pb-2 shrink-0 flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs">
                        <MessageSquare size={16} className="text-[#00FF87]" />
                        Comments
                    </div>
                    
                    <div className="px-6 py-2 space-y-4">
                        {loadingComments ? (
                            <div className="text-center text-sm text-[#555555] animate-pulse font-bold">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-sm text-[#555555] italic font-bold">No comments yet.</div>
                        ) : (
                            comments.map((comment: Comment) => (
                                <div key={comment._id} className="flex gap-3 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-[#00FF87] flex items-center justify-center shrink-0 mt-0.5 text-black">
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {getInitials(comment.author)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-sm text-white">{comment.author}</span>
                                            <span className="text-[10px] text-[#555555] shrink-0 tabular-nums font-bold">
                                                {getRelativeTime(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#888888] leading-relaxed bg-[#111111] border border-[#222222] rounded-lg rounded-tl-none p-3">
                                            {comment.body}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    <div className="p-6 pt-4 shrink-0 border-t border-[#222222] bg-[#0f0f0f]">
                        {commentError && (
                            <div className="mb-3 text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20 flex items-center gap-2 font-bold">
                                <AlertCircle size={12} /> {commentError}
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={newCommentAuthor}
                                onChange={handleCommentAuthorChange}
                                className="bg-[#1a1a1a] border border-[#222222] text-sm rounded-md focus:border-[#00FF87] block w-full p-2 outline-none text-white transition duration-200"
                            />
                            <div className="relative">
                                <textarea
                                    placeholder="Write a comment..."
                                    rows={2}
                                    value={newCommentBody}
                                    onChange={handleCommentBodyChange}
                                    onKeyDown={handleCommentKeyDown}
                                    className="bg-[#1a1a1a] border border-[#222222] text-sm rounded-md focus:border-[#00FF87] block w-full p-2 pr-10 outline-none text-white resize-none transition duration-200"
                                />
                                <button
                                    onClick={handlePostComment}
                                    disabled={!newCommentAuthor.trim() || !newCommentBody.trim()}
                                    className="absolute bottom-2 right-2 p-1.5 bg-[#00FF87] text-black rounded-md hover:bg-[#00cc6a] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                    title="Post Comment"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[#222222] bg-[#0f0f0f] shrink-0">
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold text-red-400 bg-transparent border border-red-500/30 hover:bg-red-500/10 transition duration-200"
                    >
                        <Trash2 size={18} />
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    );
}
