const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: [true, "Please specify transaction type"],
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
  },
  currency: {
    type: String,
    default: "USD",
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: function () {
        return this.isRecurring;
      },
    },
    endDate: {
      type: Date,
    },
    lastProcessed: {
      type: Date,
    },
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
TransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Transaction", TransactionSchema);
