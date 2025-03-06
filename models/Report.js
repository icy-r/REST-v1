const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportType: {
    type: String,
    enum: [
      "spending-by-category",
      "income-vs-expense",
      "monthly-trend",
      "tag-analysis",
    ],
    required: [true, "Please specify report type"],
  },
  startDate: {
    type: Date,
    required: [true, "Please specify start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please specify end date"],
  },
  filters: {
    categories: [String],
    tags: [String],
    type: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
