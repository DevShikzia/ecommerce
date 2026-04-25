import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  address?: IAddress;
  phone?: string;
  avatar?: string;
  googleId?: string;
  isVerified: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  number: { type: String, required: true },
  floor: { type: String },
  apartment: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true }
});

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    address: { type: AddressSchema },
    phone: { type: String, trim: true },
    avatar: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ email: 1 });

export const User = mongoose.model<IUserDocument>('User', UserSchema);