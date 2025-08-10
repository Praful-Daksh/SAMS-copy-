const {
  User,
  Student,
  Faculty,
  HOD,
  ClassTeacher,
  Admin,
  Guest,
} = require("../Models/User.js");
const PendingUser = require("../Models/PendingUsers.js");
const Class = require("../Models/Class.js");

/**
 * function for approve request of user for registration
 */
const approveUser = async (req, res) => {
  const { pendingUserId } = req.params;

  try {
    const pending = await PendingUser.findById(pendingUserId);
    if (!pending) {
      return res
        .status(404)
        .json({ message: "Pending user not found", success: false });
    }

    const roleModels = {
      STUDENT: Student,
      FACULTY: Faculty,
      ADMIN: Admin,
      HOD: HOD,
      CLASS_TEACHER: ClassTeacher,
      GUEST: Guest,
    };

    const Model = roleModels[pending.role];
    if (!Model) {
      return res
        .status(400)
        .json({ message: "Invalid role in pending data", success: false });
    }

    const profileData = { ...pending.profileData };
    let classDoc = null;

    if (pending.role === "STUDENT") {
      const { department, year, section, admissionAcademicYear, lateralEntry } =
        profileData;
      const batch = lateralEntry
        ? new Date(admissionAcademicYear).getFullYear() - 1
        : new Date(admissionAcademicYear).getFullYear();

      classDoc = await Class.findOne({ department, year, section, batch });
      if (!classDoc) {
        return res.status(404).json({
          message:
            "No class found for the student's department/year/section/batch",
          success: false,
        });
      }

      profileData.batch = batch;
      profileData.class = classDoc._id;
    }

    const newUser = new Model({
      email: pending.email,
      password: pending.password,
      role: pending.role,
      ...profileData,
    });

    await newUser.save();

    if (classDoc) {
      classDoc.students.push(newUser._id);
      await classDoc.save();
    }

    await PendingUser.findByIdAndDelete(pendingUserId);

    res.status(200).json({
      message: "User approved and created",
      success: true,
      userId: newUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * function for rejecting user
 * stopping user to be registered
 */
const rejectUser = async (req, res) => {
  const { pendingUserId } = req.params;
  await PendingUser.findByIdAndDelete(pendingUserId);
  res
    .status(200)
    .json({ message: "User registration request rejected", success: true });
};

module.exports = {
  approveUser,
  rejectUser,
};
