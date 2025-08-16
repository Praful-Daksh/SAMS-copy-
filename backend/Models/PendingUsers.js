const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["STUDENT", "FACULTY", "ADMIN", "HOD", "CLASS_TEACHER", "GUEST"],
    },
    profileData: {
      type: Object,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "7d",
    },
  },
  { timestamps: true }
);

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
module.exports = PendingUser;
