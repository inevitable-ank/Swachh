import mongoose from "mongoose";

export type IssueCategory =
  | "Road"
  | "Water"
  | "Sanitation"
  | "Electricity"
  | "Other";
export type IssueStatus = "Pending" | "In Progress" | "Resolved";

export interface IIssue extends mongoose.Document {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  imageUrl?: string;
  status: IssueStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  longitude?: number;
  latitude?: number;
}

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: ["Road", "Water", "Sanitation", "Electricity", "Other"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Please provide a category"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "In Progress", "Resolved"],
        message: "{VALUE} is not supported",
      },
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Issue ||
  mongoose.model<IIssue>("Issue", IssueSchema);
