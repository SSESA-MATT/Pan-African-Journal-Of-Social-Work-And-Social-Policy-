import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'author' | 'reviewer' | 'editor' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  affiliation: string;
  role: UserRole;
  expertise: string[];
  bio: string;
  orcid: string;
  profilePicture: {
    url: string;
    publicId: string;
  };
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    affiliation: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['author', 'reviewer', 'editor', 'admin'],
      default: 'author',
    },
    expertise: [{ type: String, trim: true }],
    bio: { type: String, default: '' },
    orcid: { type: String, default: '' },
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text', affiliation: 'text' });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
