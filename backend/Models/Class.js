const mongoose = require("mongoose")
const classSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  section: {
    type: Number,
    required: true,
  },
  semester:{
    type: Number,
    required : true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  curriculum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curriculum",
  },
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;