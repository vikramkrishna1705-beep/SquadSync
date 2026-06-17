import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { 
        type: String, 
        required: true,
        enum: ["red", "blue", "green", "yellow", "purple", "pink"]
    }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo',
    },
    assignee: {
        type: String,
        required: false,
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: false,
    },
    assigneeName: {
        type: String,
        required: false,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    labels: {
        type: [LabelSchema],
        default: [],
    },
    completed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TaskModel = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default TaskModel;