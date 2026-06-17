import { Task, Member } from '@/types';

const STATUSES = ["todo", "in_progress", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

type TaskCardProps = Task;

const getLabelStyle = (color: string) => {
    switch(color) {
        case 'red': return 'bg-[#ff4444]/20 text-[#ff4444] border-[#ff4444]/30';
        case 'blue': return 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30';
        case 'green': return 'bg-[#00FF87]/20 text-[#00FF87] border-[#00FF87]/30';
        case 'yellow': return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30';
        case 'purple': return 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30';
        case 'pink': return 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30';
        default: return 'bg-[#222222] text-[#888888] border-[#333333]';
    }
}

const TaskCard = ({ title, description, priority, dueDate, status, assigneeId, assigneeName, labels = [] }: TaskCardProps) => {
    let label = null;
    let labelColor = "";
    let isOverdue = false;

    if (dueDate && status !== STATUSES[2]) {
        const now = new Date();
        const due = new Date(dueDate);
        
        const timeDiff = due.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (timeDiff < 0) {
            isOverdue = true;
            label = "⚠ Overdue";
            labelColor = "text-[#ff4444] bg-[#ff4444]/10 border border-[#ff4444]/20";
        } else if (hoursDiff <= 48) {
            label = "Due soon";
            labelColor = "text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20";
        }
    }

    let borderClass = "";
    let priorityBadge = "";

    if (priority === PRIORITIES[2]) {
        borderClass = "border-l-[#ff4444]";
        priorityBadge = "bg-[#ff4444]/20 text-[#ff4444]";
    } else if (priority === PRIORITIES[1]) {
        borderClass = "border-l-[#f59e0b]";
        priorityBadge = "bg-[#f59e0b]/20 text-[#f59e0b]";
    } else {
        borderClass = "border-l-[#00FF87]";
        priorityBadge = "bg-[#00FF87]/20 text-[#00FF87]";
    }

    const bgClass = isOverdue ? "bg-[#ff4444]/10" : "bg-[#111111]";
    const hoverClass = "transition-all duration-300 hover:-translate-y-[2px] hover:border-[#333333]";

    const memberObj: Member | null = typeof assigneeId === 'object' ? (assigneeId as unknown as Member) : null;

    return (
        <div className={`flex w-72 flex-col rounded-xl border border-[#222222] border-l-4 ${borderClass} ${bgClass} overflow-hidden shrink-0 cursor-pointer ${hoverClass}`}>
            <div className={`p-4 border-b border-[#222222] ${isOverdue ? 'bg-[#ff4444]/5' : 'bg-[#1a1a1a]'}`}>
                <div className="flex justify-between items-start gap-3">
                    <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
                    {label && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase tracking-widest ${labelColor}`}>
                            {label}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4">
                <p className="text-[#888888] text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
                    {description}
                </p>

                {labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {labels.slice(0, 3).map((label) => (
                            <span key={label.name} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getLabelStyle(label.color)}`}>
                                {label.name}
                            </span>
                        ))}
                        {labels.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-[#222222] bg-[#1a1a1a] text-[#888888]">
                                +{labels.length - 3} more
                            </span>
                        )}
                    </div>
                )}
                
                <div className="flex justify-between items-end mt-auto gap-2">
                    <div className="flex flex-col gap-2">
                        <span className={`w-fit px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase ${priorityBadge}`}>
                            {priority}
                        </span>
                        {dueDate && (
                            <span className="text-xs text-[#555555] font-bold">
                                {new Date(dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {(memberObj || assigneeName) && (
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#222222] ${!memberObj ? 'bg-[#1a1a1a]' : ''}`}
                            style={memberObj ? { backgroundColor: memberObj.color } : undefined}
                            title={memberObj ? memberObj.name : assigneeName}
                        >
                            <span 
                                className={`text-[10px] font-black uppercase tracking-wider ${memberObj ? 'text-black' : 'text-[#888888]'}`}
                            >
                                {memberObj ? memberObj.initials : assigneeName?.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
