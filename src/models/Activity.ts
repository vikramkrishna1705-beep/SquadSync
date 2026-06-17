import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  action: string;
  taskTitle: string;
  details: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    action: {
      type: String,
      required: true,
      enum: ["created", "moved", "deleted", "updated"],
    },
    taskTitle: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Prevent mongoose model overwrite error
const ActivityModel =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default ActivityModel;
