const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a goal name"],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, "Please provide a target amount"],
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: [true, "Please provide a target date"],
  },
  description: {
    type: String,
    trim: true,
  },
  autoAllocate: {
    enabled: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  status: {
    type: String,
    enum: ["in-progress", "completed", "cancelled"],
    default: "in-progress",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update the updatedAt field
GoalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if goal is completed
GoalSchema.pre("save", function (next) {
  if (
    this.currentAmount >= this.targetAmount &&
    this.status === "in-progress"
  ) {
    this.status = "completed";
  }
  next();
});

module.exports = mongoose.model("Goal", GoalSchema);