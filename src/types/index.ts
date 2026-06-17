export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";
export type MemberRole = "Frontend" | "Backend" | "Design" | "Events" | "Publicity";

export interface Member {
  _id: string;
  name: string;
  role: MemberRole;
  initials: string;
  color: string;
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  projectId: string;
  labels?: Label[];
  createdAt: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  action: string;
  taskTitle: string;
  details: string;
  createdAt: string;
}

export interface MemberStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
