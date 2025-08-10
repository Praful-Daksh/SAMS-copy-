const mongoose = require("mongoose")

const departmentAssignmentSchema = new mongoose.Schema(
  {
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    years: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const DepartmentAssignment = mongoose.model(
  "DepartmentAssignment",
  departmentAssignmentSchema
);
module.exports = DepartmentAssignment;
