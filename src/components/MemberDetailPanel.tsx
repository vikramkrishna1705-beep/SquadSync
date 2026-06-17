import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Circle } from 'lucide-react';
import { Task } from '@/types';
import Link from 'next/link';

interface Member {
  _id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface MemberStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

interface MemberDetailPanelProps {
  member: Member;
  stats: MemberStats;
  onClose: () => void;
}

const STATUSES = ["todo", "in_progress", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export default function MemberDetailPanel({ member, stats, onClose }: MemberDetailPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tasks?assigneeId=${member._id}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch tasks");
      }
      setTasks(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [member._id]);

  useEffect(() => {
    setIsOpen(true);
    fetchTasks();
  }, [fetchTasks]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const todoTasks = useMemo(() => tasks.filter((t: Task) => t.status === STATUSES[0]), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter((t: Task) => t.status === STATUSES[1]), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t: Task) => t.status === STATUSES[2]), [tasks]);

  const getPriorityColor = (priority: string) => {
    if (priority === PRIORITIES[2]) return 'text-[#ff4444]';
    if (priority === PRIORITIES[1]) return 'text-[#f59e0b]';
    return 'text-[#00FF87]';
  };

  const renderTaskList = (list: Task[], title: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-3">{title}</h4>
        <div className="flex flex-col gap-2">
          {list.map((task: Task) => {
            const isProjectObj = typeof task.projectId === 'object' && task.projectId !== null;
            const projId = isProjectObj ? (task.projectId as any)._id : task.projectId;
            const priorityColor = getPriorityColor(task.priority);
            
            return (
              <Link key={task._id} href={`/projects/${projId}`} className="group">
                <div className="bg-[#1a1a1a] border border-[#222222] rounded-md p-3 flex items-center gap-3 hover:border-[#00FF87] transition-colors">
                  <Circle size={10} className={`fill-current ${priorityColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-[#00FF87] transition-colors">{task.title}</p>
                    {isProjectObj && (
                      <p className="text-[#555555] text-xs truncate mt-0.5">{(task.projectId as any).name}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
      <div 
        className={`w-full max-w-md bg-[#111111] border-l border-[#222222] h-full flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#222222] flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-black font-black text-2xl shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            <div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tight">{member.name}</h2>
              <span className="inline-block text-[#888888] text-sm font-semibold tracking-wider uppercase mt-1">
                {member.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-[#888888] hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-lg p-4 text-center">
              <div className="text-[#555555] text-xs font-bold uppercase mb-1">Total Tasks</div>
              <div className="text-white font-black text-3xl">{stats.total}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-lg p-4 text-center">
              <div className="text-[#555555] text-xs font-bold uppercase mb-1">Done</div>
              <div className="text-[#00FF87] font-black text-3xl">{stats.done}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-lg p-4 text-center">
              <div className="text-[#555555] text-xs font-bold uppercase mb-1">To Do</div>
              <div className="text-white font-black text-2xl">{stats.todo}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-lg p-4 text-center">
              <div className="text-[#555555] text-xs font-bold uppercase mb-1">In Progress</div>
              <div className="text-white font-black text-2xl">{stats.inProgress}</div>
            </div>
          </div>

          <h3 className="text-white font-black uppercase text-lg mb-6 tracking-wider">Assigned Tasks</h3>
          
          {loading ? (
            <div className="text-[#555555] font-bold text-sm">Loading tasks...</div>
          ) : error ? (
            <div className="text-[#ff4444] font-bold text-sm">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="text-[#555555] font-bold text-sm bg-[#1a1a1a] border border-[#222222] rounded-lg p-4 text-center">
              No tasks assigned
            </div>
          ) : (
            <div>
              {renderTaskList(inProgressTasks, "In Progress")}
              {renderTaskList(todoTasks, "To Do")}
              {renderTaskList(doneTasks, "Done")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
