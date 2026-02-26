import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'declined' | 'overdue';
export type Recommendation = 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';

export interface IReview extends Document {
  manuscript: Types.ObjectId;
  reviewer: Types.ObjectId;
  assignedBy: Types.ObjectId;
  status: ReviewStatus;
  recommendation?: Recommendation;
  commentsToAuthor: string;
  commentsToEditor: string;
  ratings: {
    originality: number;
    methodology: number;
    significance: number;
    clarity: number;
    references: number;
    overall: number;
  };
  dueDate: Date;
  completedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  round: number; // review round (1st review, 2nd after revisions, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    manuscript: {
      type: Schema.Types.ObjectId,
      ref: 'Manuscript',
      required: true,
      index: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'declined', 'overdue'],
      default: 'pending',
      index: true,
    },
    recommendation: {
      type: String,
      enum: ['accept', 'minor_revisions', 'major_revisions', 'reject'],
    },
    commentsToAuthor: { type: String, default: '' },
    commentsToEditor: { type: String, default: '' },
    ratings: {
      originality: { type: Number, min: 1, max: 5, default: 0 },
      methodology: { type: Number, min: 1, max: 5, default: 0 },
      significance: { type: Number, min: 1, max: 5, default: 0 },
      clarity: { type: Number, min: 1, max: 5, default: 0 },
      references: { type: Number, min: 1, max: 5, default: 0 },
      overall: { type: Number, min: 1, max: 5, default: 0 },
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedAt: Date,
    declinedAt: Date,
    declineReason: String,
    round: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Compound index: one reviewer per manuscript per round
reviewSchema.index({ manuscript: 1, reviewer: 1, round: 1 }, { unique: true });
reviewSchema.index({ reviewer: 1, status: 1 });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
