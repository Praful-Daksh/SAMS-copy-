const mongoose = require("mongoose");

const curriculumSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: "v1",
    },
    subjectsBySemester: {
      type: Map,
      of: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const Curriculum = mongoose.model("Curriculum", curriculumSchema);
module.exports = Curriculum;
