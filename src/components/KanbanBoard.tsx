"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock, User, Search, AlertCircle } from "lucide-react";
import { Task, Status, Priority } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import SkeletonCard from "@/components/SkeletonCard";
import TaskModal from "@/components/TaskModal";
import ActivityFeed from "@/components/ActivityFeed";
import { useCountUp } from "@/hooks/useCountUp";

const COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" }
];

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getLabelStyle = (color: string) => {
    switch(color) {
        case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'pink': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
}

// --- COMPONENTS ---

function SortableTaskItem({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[#0f0f0f] border-2 border-[#00FF87] border-dashed rounded-xl h-[140px] opacity-40"
      />
    );
  }

  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.status === "done") return false;
    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);
    return due < new Date();
  }, [task.dueDate, task.status]);

  let borderClass = "";
  let priorityBadge = "";

  if (task.priority === 'high') {
      borderClass = "border-l-red-500";
      priorityBadge = "bg-red-500/10 text-red-400";
  } else if (task.priority === 'medium') {
      borderClass = "border-l-yellow-500";
      priorityBadge = "bg-yellow-500/10 text-yellow-400";
  } else {
      borderClass = "border-l-[#00FF87]";
      priorityBadge = "bg-[#00FF87]/10 text-[#00FF87]";
  }

  const bgClass = isOverdue ? "bg-[#111111]/80" : "bg-[#111111]";
  const hoverClass = `transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:border-[#333333]`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`p-4 rounded-xl border border-[#222222] border-l-4 ${borderClass} ${bgClass} cursor-grab group relative flex flex-col active:cursor-grabbing ${hoverClass}`}
    >
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="flex flex-col gap-1">
          {isOverdue && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 w-fit uppercase tracking-widest">
              <AlertCircle size={10} />
              Overdue
            </span>
          )}
          <h4 className="text-sm font-bold text-white leading-snug pr-8">{task.title}</h4>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${priorityBadge}`}
        >
          {task.priority}
        </span>
      </div>
      <p className="text-[#888888] text-xs line-clamp-2 mb-4 leading-relaxed flex-1 mt-1">
        {task.description}
      </p>

      {/* Labels Display */}
      {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
              {task.labels.slice(0, 3).map((label: { name: string; color: string }) => (
                  <span key={label.name} className={`px-2 py-0.5 rounded text-xs bg-[#1a1a1a] text-[#888888]`}>
                      {label.name}
                  </span>
              ))}
              {task.labels.length > 3 && (
                  <span className="px-2 py-0.5 rounded text-xs bg-[#1a1a1a] text-[#888888]">
                      +{task.labels.length - 3} more
                  </span>
              )}
          </div>
      )}

      <div className="flex justify-between items-end mt-auto gap-2">
          <div className="flex flex-col gap-2">
              {task.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={12} className={isOverdue ? "text-red-400" : "text-[#555555]"} />
                      <span className={`${isOverdue ? "text-red-400" : "text-[#555555]"}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                  </div>
              )}
          </div>

          {(task.assigneeName || task.assigneeId) && (
              <div 
                  className="w-6 h-6 rounded-full bg-[#00FF87] flex items-center justify-center shrink-0 ml-auto text-black"
                  title={task.assigneeName || task.assigneeId}
              >
                  <span className="text-xs font-bold uppercase tracking-wider">
                      {getInitials(task.assigneeName || task.assigneeId || "?")}
                  </span>
              </div>
          )}
      </div>

      <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#555555] p-1.5">
        <GripVertical size={16} />
      </div>
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
  loading,
  error,
  onClickTask,
  onAddTask,
}: {
  id: Status;
  title: string;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onClickTask: (task: Task) => void;
  onAddTask: (status: Status) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
    },
  });

  return (
    <div className="flex flex-col w-full bg-transparent">
      <div className="py-4 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#888888]">{title}</h3>
          <span className="bg-[#1a1a1a] text-white text-xs px-2 py-0.5 rounded-full">
            {loading ? "-" : tasks.length}
          </span>
        </div>
      </div>
      <div 
        ref={setNodeRef} 
        className={`p-3 flex flex-col rounded-xl border border-dashed transition-colors duration-200 min-h-[150px] ${isOver ? 'border-[#00FF87] bg-[#00FF87]/5' : 'border-[#222222] bg-[#0f0f0f]'}`}
      >
        {error ? (
          <div className="text-red-400 text-sm p-4 text-center bg-red-500/10 rounded-xl border border-red-500/30">
            Could not load tasks. Try refreshing.
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-3 min-h-[150px]">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <SortableContext
            id={id}
            items={tasks.map((t: Task) => t._id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-col gap-3 min-h-[150px]">
              {tasks.map((task: Task) => (
                <SortableTaskItem key={task._id} task={task} onClick={onClickTask} />
              ))}
            </div>
          </SortableContext>
        )}
        {!loading && !error && (
            <button
                onClick={() => onAddTask(id)}
                className="mt-4 w-full py-2.5 rounded-xl border border-[#222222] hover:bg-[#1a1a1a] hover:border-[#00FF87] text-[#888888] hover:text-[#00FF87] font-bold text-xs uppercase tracking-widest transition duration-200 flex items-center justify-center gap-2 group"
            >
                <div className="w-5 h-5 rounded-full bg-[#111111] group-hover:bg-[#00FF87]/20 flex items-center justify-center transition duration-200">
                    <span className="text-lg leading-none mb-0.5 group-hover:text-[#00FF87]">+</span>
                </div>
                Add Task
            </button>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const { tasks, loading, error, refetch: fetchTasks, setTasks } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterAssignee, setFilterAssignee] = useState<string>("All");

  // Edit Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Activity Feed State
  const [isActivityOpen, setIsActivityOpen] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derived state for filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchesPriority = filterPriority === "All" || task.priority?.toLowerCase() === filterPriority.toLowerCase();
      const matchesAssignee = filterAssignee === "All" || task.assigneeId === filterAssignee || task.assigneeName === filterAssignee;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee]);

  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(tasks.map((t: Task) => t.assigneeName || t.assigneeId).filter(Boolean))) as string[];
  }, [tasks]);

  // Metrics calculations
  const metrics = useMemo(() => {
    return {
      total: filteredTasks.length,
      toDo: filteredTasks.filter((t: Task) => t.status === "todo").length,
      inProgress: filteredTasks.filter((t: Task) => t.status === "in_progress").length,
      done: filteredTasks.filter((t: Task) => t.status === "done").length,
    };
  }, [filteredTasks]);

  const animatedTotal = useCountUp(metrics.total);
  const animatedToDo = useCountUp(metrics.toDo);
  const animatedInProgress = useCountUp(metrics.inProgress);
  const animatedDone = useCountUp(metrics.done);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t: Task) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = COLUMNS.some(c => c.id === overId);

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t: Task) => t._id === activeId);
        const overIndex = prevTasks.findIndex((t: Task) => t._id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevTasks;

        const activeStatus = prevTasks[activeIndex].status;
        const overStatus = prevTasks[overIndex].status;

        if (activeStatus !== overStatus) {
          const newTasks = [...prevTasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: overStatus };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t: Task) => t._id === activeId);
        if (activeIndex === -1) return prevTasks;

        if (prevTasks[activeIndex].status !== overId) {
            const newTasks = [...prevTasks];
            newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId as Status };
            // Move to the end of the tasks array so it appears at the bottom of the column
            return arrayMove(newTasks, activeIndex, newTasks.length - 1);
        }
        return prevTasks;
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) {
      // Revert if dropped outside
      fetchTasks();
      return;
    }

    const activeId = active.id as string;
    
    // Find the current status in our local state, because onDragOver already updated it!
    const localTask = tasks.find((t: Task) => t._id === activeId);
    if (!localTask) return;

    const newStatus = localTask.status;

    try {
      const response = await fetch(`/api/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("API Update Failed");
    } catch {
      fetchTasks(); // Rollback if API call fails
    }
  };

  const handleQuickAdd = async (status: Status) => {
      try {
          const response = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: 'New Task',
                  description: 'Click to edit description...',
                  status,
                  priority: 'low',
                  projectId
              })
          });
          
          if (response.ok) {
              const result = await response.json();
              if (result.data) {
                  setEditingTask(result.data); // Open modal immediately
                  fetchTasks();
              }
          }
      } catch (err) {
          
      }
  };

  return (
      <div className="flex-1 flex">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <div className="mb-6 flex flex-col lg:flex-row items-center gap-4 shrink-0 w-full">
            {/* Search */}
            <div className="relative w-full flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-[#555555]" />
                </div>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#111111] border border-[#222222] rounded-md text-sm focus:border-[#00FF87] outline-none transition duration-200 placeholder-[#555555] text-white"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#111111] border border-[#222222] text-white text-sm rounded-md focus:border-[#00FF87] outline-none appearance-none cursor-pointer transition duration-200 py-2 px-4 w-full lg:w-auto shrink-0"
              >
                <option value="All">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-[#111111] border border-[#222222] text-white text-sm rounded-md focus:border-[#00FF87] outline-none appearance-none cursor-pointer transition duration-200 py-2 px-4 w-full lg:w-auto shrink-0"
              >
                <option value="All">All Assignees</option>
                  {uniqueAssignees.map((assignee: string) => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
              </select>
            </div>

            {/* Activity Button */}
            <button 
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              className={`flex items-center justify-center gap-2 border px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition duration-200 w-full lg:w-auto shrink-0 ${isActivityOpen ? 'bg-[#0f0f0f] border-[#00FF87] text-[#00FF87]' : 'bg-transparent border-[#222222] text-[#888888] hover:border-[#00FF87] hover:text-[#00FF87]'}`}
            >
              <Clock size={16} className={isActivityOpen ? "text-[#00FF87]" : "text-[#888888]"} />
              Activity
            </button>
          </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
          <div className="bg-[#111111] border border-[#222222] border-b-4 border-b-white rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-[#888888] mb-1">Total Tasks</span>
            <span className="text-4xl font-black text-white">{animatedTotal}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] border-b-4 border-b-blue-500 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-[#888888] mb-1">To Do</span>
            <span className="text-4xl font-black text-white">{animatedToDo}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] border-b-4 border-b-yellow-500 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-[#888888] mb-1">In Progress</span>
            <span className="text-4xl font-black text-white">{animatedInProgress}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] border-b-4 border-b-[#00FF87] rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-[#888888] mb-1">Done</span>
            <span className="text-4xl font-black text-white">{animatedDone}</span>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4 items-start w-full">
            {COLUMNS.map((col: { id: Status; title: string }) => (
              <div key={col.id} className="snap-start flex flex-col flex-1 min-w-[300px]">
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  tasks={filteredTasks.filter((t: Task) => t.status === col.id)}
                  loading={loading}
                  error={error}
                  onClickTask={setEditingTask}
                  onAddTask={handleQuickAdd}
                />
              </div>
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.4" } },
              }),
            }}
          >
            {activeTask ? (
              <div className="rotate-3 scale-105 transition-transform cursor-grabbing shadow-2xl shadow-teal-500/10">
                <SortableTaskItem task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
            </DragOverlay>
          </DndContext>
        </main>

        {/* Collapsible Activity Feed Panel */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out sticky top-8 max-h-[calc(100vh-4rem)] ${isActivityOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
        >
          <div className="w-80 h-full">
            <ActivityFeed />
          </div>
        </div>

      {/* Slide-in Task Modal */}
      {editingTask && (
        <TaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          onUpdate={fetchTasks} 
        />
      )}
      </div>
  );
}
