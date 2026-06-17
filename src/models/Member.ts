import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Member extends Document {
  name: string;
  role: string;
  initials: string;
  color: string;
  joinedAt: Date;
}

const MemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  initials: { type: String },
  color: {
    type: String,
    default: () => {
      const colors = ["#00FF87", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  joinedAt: { type: Date, default: Date.now }
});

MemberSchema.pre('save', function (this: Member) {
  if (this.isModified('name') || this.isNew) {
    const nameParts = this.name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      this.initials = nameParts[0].substring(0, 2).toUpperCase();
    } else if (nameParts.length > 1) {
      this.initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else {
      this.initials = "??";
    }
  }
});

delete mongoose.models.Member;
const MemberModel: Model<Member> = mongoose.model<Member>('Member', MemberSchema);

export default MemberModel;
