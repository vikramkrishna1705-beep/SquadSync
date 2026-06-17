import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default ProjectModel;
