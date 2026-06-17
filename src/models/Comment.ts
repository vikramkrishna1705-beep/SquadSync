import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  author: string;
  body: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;
