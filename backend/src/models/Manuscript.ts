import mongoose, { Schema, Document, Types } from 'mongoose';

export type ManuscriptStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revisions_required'
  | 'revised'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface IManuscript extends Document {
  title: string;
  abstract: string;
  keywords: string[];
  authors: {
    userId?: Types.ObjectId;
    name: string;
    email: string;
    affiliation: string;
    isCorresponding: boolean;
  }[];
  submittedBy: Types.ObjectId;
  status: ManuscriptStatus;
  category: string;
  manuscriptFile: {
    url: string;
    publicId: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  };
  supplementaryFiles: {
    url: string;
    publicId: string;
    filename: string;
    size: number;
    mimeType: string;
    fileType: string; // figure, table, supplementary
    uploadedAt: Date;
  }[];
  assignedEditor?: Types.ObjectId;
  editorComments: string;
  revisionNotes: string;
  revisionDeadline?: Date;
  submittedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const manuscriptSchema = new Schema<IManuscript>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      maxlength: [5000, 'Abstract cannot exceed 5000 characters'],
    },
    keywords: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 3 && v.length <= 10,
        message: 'Must have between 3 and 10 keywords',
      },
    },
    authors: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        email: { type: String, required: true },
        affiliation: { type: String, default: '' },
        isCorresponding: { type: Boolean, default: false },
      },
    ],
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'revisions_required', 'revised', 'accepted', 'rejected', 'published'],
      default: 'draft',
      index: true,
    },
    category: {
      type: String,
      default: 'research-article',
      enum: ['research-article', 'review-article', 'case-study', 'policy-brief', 'commentary', 'book-review'],
    },
    manuscriptFile: {
      url: String,
      publicId: String,
      filename: String,
      size: Number,
      mimeType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
    supplementaryFiles: [
      {
        url: String,
        publicId: String,
        filename: String,
        size: Number,
        mimeType: String,
        fileType: { type: String, enum: ['figure', 'table', 'supplementary', 'cover-letter'] },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    assignedEditor: { type: Schema.Types.ObjectId, ref: 'User' },
    editorComments: { type: String, default: '' },
    revisionNotes: { type: String, default: '' },
    revisionDeadline: Date,
    submittedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
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

// Indexes
manuscriptSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
manuscriptSchema.index({ submittedBy: 1, status: 1 });
manuscriptSchema.index({ assignedEditor: 1 });
manuscriptSchema.index({ createdAt: -1 });

const Manuscript = mongoose.model<IManuscript>('Manuscript', manuscriptSchema);
export default Manuscript;
