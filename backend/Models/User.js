const mongoose = require("mongoose");

const options = {
  discriminatorKey: "role",
  collection: "users",
  timestamps: true,
};

const baseUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["STUDENT", "FACULTY", "HOD", "CLASS_TEACHER", "GUEST", "ADMIN"],
    },
  },
  options
);

const User = mongoose.model("User", baseUserSchema);

const studentSchema = new mongoose.Schema({
  aparId: {
    type: String,
    required: true,
  },
  admission_academic_year: {
    type: Date,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  section: {
    type: Number,
    required: true,
  },
  transport: {
    type: String,
    required: true,
  },
  busRoute: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  parentPhoneNumber: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
});

const facultySchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  department: String,
});

const commonSchema = {
  firstName: String,
  lastName: String,
};

const Student = User.discriminator("STUDENT", studentSchema);
const Faculty = User.discriminator("FACULTY", facultySchema);
const HOD = User.discriminator("HOD", new mongoose.Schema(commonSchema));
const ClassTeacher = User.discriminator(
  "CLASS_TEACHER",
  new mongoose.Schema(commonSchema)
);
const Admin = User.discriminator("ADMIN", new mongoose.Schema(commonSchema));
const Guest = User.discriminator("GUEST", new mongoose.Schema(commonSchema));

module.exports = { User, Student, Faculty, HOD, ClassTeacher, Admin, Guest };
