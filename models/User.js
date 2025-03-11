const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    trim: true,
    minlength: [5, "Username must be at least 5 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [5, "Password must be at least 5 characters"],
    select: false,
  },
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  preferredCurrency: {
    type: String,
    default: "USD",
  },
  dashboardPreferences: {
    defaultView: {
      type: String,
      enum: ["summary", "transactions", "budgets", "goals"],
      default: "summary",
    },
    favoriteWidgets: {
      type: [String],
      default: [
        "balance",
        "recentTransactions",
        "budgetOverview",
        "goalProgress",
      ],
    },
    timeRange: {
      type: String,
      enum: ["week", "month", "quarter", "year", "all"],
      default: "month",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
