import mongoose, { Schema, Document } from 'mongoose';

export interface IRole {
  name: string;
  permissions: mongoose.Types.ObjectId[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoleDocument extends IRole, Document {}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    description: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

RoleSchema.index({ name: 1 });

export const Role = mongoose.model<IRoleDocument>('Role', RoleSchema);