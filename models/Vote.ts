import mongoose from "mongoose"

export interface IVote extends mongoose.Document {
  issue: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  createdAt: Date
}

const VoteSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Please provide an issue"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
  },
  { timestamps: true },
)

VoteSchema.index({ issue: 1, user: 1 }, { unique: true })

export default mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema)
