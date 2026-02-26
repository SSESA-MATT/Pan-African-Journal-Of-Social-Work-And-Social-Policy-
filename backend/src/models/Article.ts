import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVolume extends Document {
  volumeNumber: number;
  year: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssue extends Document {
  volume: Types.ObjectId;
  issueNumber: number;
  title: string;
  description: string;
  coverImageUrl: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticle extends Document {
  manuscript: Types.ObjectId;
  volume: Types.ObjectId;
  issue: Types.ObjectId;
  title: string;
  abstract: string;
  authors: {
    name: string;
    email: string;
    affiliation: string;
    isCorresponding: boolean;
  }[];
  keywords: string[];
  doi: string;
  pdfUrl: string;
  pdfPublicId: string;
  slug: string;
  pages: { start: number; end: number };
  category: string;
  citationCount: number;
  viewCount: number;
  downloadCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Volume Schema ────────────────────────────────────────────
const volumeSchema = new Schema<IVolume>(
  {
    volumeNumber: { type: Number, required: true, unique: true },
    year: { type: Number, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
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

// ─── Issue Schema ─────────────────────────────────────────────
const issueSchema = new Schema<IIssue>(
  {
    volume: { type: Schema.Types.ObjectId, ref: 'Volume', required: true, index: true },
    issueNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    publishedAt: Date,
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

issueSchema.index({ volume: 1, issueNumber: 1 }, { unique: true });

// ─── Article Schema ───────────────────────────────────────────
const articleSchema = new Schema<IArticle>(
  {
    manuscript: { type: Schema.Types.ObjectId, ref: 'Manuscript', index: true },
    volume: { type: Schema.Types.ObjectId, ref: 'Volume', required: true, index: true },
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    authors: [
      {
        name: { type: String, required: true },
        email: String,
        affiliation: String,
        isCorresponding: { type: Boolean, default: false },
      },
    ],
    keywords: [String],
    doi: { type: String, default: '', index: true },
    pdfUrl: { type: String, default: '' },
    pdfPublicId: { type: String, default: '' },
    slug: { type: String, unique: true, index: true },
    pages: {
      start: { type: Number, default: 0 },
      end: { type: Number, default: 0 },
    },
    category: {
      type: String,
      default: 'research-article',
      enum: ['research-article', 'review-article', 'case-study', 'policy-brief', 'commentary', 'book-review'],
    },
    citationCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
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

articleSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ volume: 1, issue: 1, publishedAt: -1 });

export const Volume = mongoose.model<IVolume>('Volume', volumeSchema);
export const Issue = mongoose.model<IIssue>('Issue', issueSchema);
export const Article = mongoose.model<IArticle>('Article', articleSchema);
